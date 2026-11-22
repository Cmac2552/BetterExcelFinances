/**
 * Jev Decision Model Categorization Service for Better Excel Finances.
 * Utilizes TypeSafe's Jev (System One structured decision model) on OpenRouter
 * via the Decisions API (POST https://openrouter.ai/api/alpha/decisions).
 */

import { logSafeAIError } from "../ai/errors";
import { scrubOptionalTextForAI, scrubTextForAI } from "../ai/scrub";

export interface UserCategoryInput {
  name: string;
  description?: string | null;
}

export interface MerchantToClassify {
  description: string;
  csvCategories: string[];
}

export interface CategorizeMerchantsOptions {
  merchants: MerchantToClassify[];
  userCategories: UserCategoryInput[];
}

export interface CategorizationResult {
  mappings: Record<string, string>; // merchant description -> userCategory
  confidenceScores: Record<string, number>;
  categorizedCount: number;
  method: "jev" | "fallback";
}

// Built-in criteria descriptors to give Jev clear semantic boundaries for common categories
const DEFAULT_CRITERIA_DESCRIPTORS: Record<string, string> = {
  groceries: "Supermarkets, grocery stores, food shopping, markets",
  dining: "Restaurants, cafes, bars, fast food, food delivery, coffee shops",
  "food & drink": "Restaurants, cafes, bars, fast food, coffee shops, dining",
  "dining out": "Restaurants, takeout, delivery, fast food, bars, cafes",
  shopping: "General retail, clothing, electronics, online purchases, merchandise",
  merchandise: "Retail goods, electronics, department stores, merchandise",
  transportation: "Public transit, rideshare, gas stations, tolls, parking, automotive",
  travel: "Airlines, hotels, car rentals, flights, vacation bookings",
  vacation: "Flights, hotels, resorts, vacation bookings, trip expenses",
  utilities: "Electric, gas, water, internet, trash, home utilities",
  housing: "Rent, mortgage, HOA fees, property taxes, home insurance",
  entertainment: "Movies, concerts, streaming services, games, events, recreation",
  "health & wellness": "Doctors, pharmacies, dental, gym memberships, medical care",
  healthcare: "Medical bills, prescriptions, hospital, dental, optical",
  "personal care": "Salons, barbershops, cosmetics, personal grooming",
  education: "Tuition, books, courses, school fees",
  income: "Salary, paychecks, bonuses, interest, dividends",
  services: "Professional services, repairs, subscriptions, maintenance",
};

const BATCH_SIZE = 25;

/**
 * Normalizes a string into an identifier-safe lowercase alphanumeric token.
 */
function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Generates descriptive criteria for user categories to guide Jev's choice decisions,
 * incorporating any user-provided personal notes.
 */
function buildCriteriaForCategories(
  userCategories: UserCategoryInput[]
): Record<string, string> {
  const criteria: Record<string, string> = {};
  const categoryNames = userCategories.map((c) => c.name);

  for (const cat of userCategories) {
    const key = cat.name.toLowerCase().trim();
    const customNotes = scrubOptionalTextForAI(cat.description, 300);

    let defaultDescriptor = DEFAULT_CRITERIA_DESCRIPTORS[key];
    if (!defaultDescriptor) {
      const matchingKey = Object.keys(DEFAULT_CRITERIA_DESCRIPTORS).find(
        (k) => key.includes(k) || k.includes(key)
      );
      if (matchingKey) {
        defaultDescriptor = DEFAULT_CRITERIA_DESCRIPTORS[matchingKey];
      }
    }

    if (customNotes && defaultDescriptor) {
      criteria[cat.name] = `${defaultDescriptor}. User notes: ${customNotes}`;
    } else if (customNotes) {
      criteria[cat.name] = customNotes;
    } else if (defaultDescriptor) {
      criteria[cat.name] = defaultDescriptor;
    } else {
      criteria[cat.name] = `Expenses related to ${scrubTextForAI(cat.name, 50) || cat.name}`;
    }
  }

  // Always include Uncategorized as an explicit fallback choice
  if (!categoryNames.includes("Uncategorized")) {
    criteria["Uncategorized"] = "Does not clearly fit any of the above categories";
  }

  return criteria;
}

/**
 * Classifies unique transaction merchants against user categories using TypeSafe Jev on OpenRouter.
 */
export async function classifyMerchantsWithJev({
  merchants,
  userCategories,
}: CategorizeMerchantsOptions): Promise<CategorizationResult> {
  const mappings: Record<string, string> = {};
  const confidenceScores: Record<string, number> = {};

  if (!merchants.length || !userCategories.length) {
    return {
      mappings,
      confidenceScores,
      categorizedCount: 0,
      method: "fallback",
    };
  }

  const userCategoryNames = userCategories.map((c) => c.name);
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn(
      "[JevCategorizer] Categorization provider is not configured. Falling back to bank CSV categories."
    );
    for (const merchant of merchants) {
      mappings[merchant.description] = merchant.csvCategories[0] || "Uncategorized";
      confidenceScores[merchant.description] = 0.0;
    }
    return {
      mappings,
      confidenceScores,
      categorizedCount: Object.keys(mappings).length,
      method: "fallback",
    };
  }

  // Select model: prefer Jev model
  const configuredModel = process.env.OPENROUTER_MODEL;
  const modelId =
    configuredModel && configuredModel.includes("jev")
      ? configuredModel
      : "typesafe/jev-1.14";

  const criteria = buildCriteriaForCategories(userCategories);
  let anySucceeded = false;

  // Process merchants in batches to keep payload size and latency bounded
  for (let start = 0; start < merchants.length; start += BATCH_SIZE) {
    const batch = merchants.slice(start, start + BATCH_SIZE);

    const questionMap: Record<
      string,
      { type: "choice"; instructions: string; criteria: Record<string, string> }
    > = {};
    const keyToMerchantMap: Record<string, MerchantToClassify> = {};

    const scrubbedBatch: {
      merchant: string;
      bank_categories: string[];
    }[] = [];

    batch.forEach((merchant, idx) => {
      const scrubbedDescription =
        scrubTextForAI(merchant.description, 100) || "Unknown Merchant";
      const questionKey = `q_${idx}_${normalizeString(scrubbedDescription).slice(0, 16) || "tx"}`;
      keyToMerchantMap[questionKey] = merchant;

      const bankCats = merchant.csvCategories
        .filter((c) => c && c.toLowerCase() !== "uncategorized")
        .map((c) => scrubTextForAI(c, 50))
        .filter(Boolean);
      const bankContext = bankCats.length
        ? ` (bank category: ${bankCats.join(", ")})`
        : "";

      scrubbedBatch.push({
        merchant: scrubbedDescription,
        bank_categories: bankCats,
      });

      questionMap[questionKey] = {
        type: "choice",
        instructions: `Which budget category best fits merchant '${scrubbedDescription}'${bankContext}?`,
        criteria,
      };
    });

    const statePayload = {
      merchants: scrubbedBatch,
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout per batch

      const response = await fetch("https://openrouter.ai/api/alpha/decisions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://betterexcelfinances.com",
          "X-Title": "Better Excel Finances",
        },
        body: JSON.stringify({
          model: modelId,
          state: statePayload,
          questions: questionMap,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const apiError = Object.assign(
          new Error(`Decisions API request failed with status ${response.status}`),
          { statusCode: response.status }
        );
        throw apiError;
      }

      const data = await response.json();
      const answers = data?.answers;
      anySucceeded = true;

      if (answers && typeof answers === "object") {
        // Handles answers as an object: { [questionKey]: { type: "choice", choice: string, confidence: number } }
        if (!Array.isArray(answers)) {
          for (const [qKey, answerObj] of Object.entries(answers)) {
            const merchant = keyToMerchantMap[qKey];
            if (!merchant) continue;

            const anyAns = answerObj as { choice?: string; confidence?: number };
            const chosenCategory = anyAns?.choice;
            const confidence = anyAns?.confidence ?? 0.8;

            if (
              chosenCategory &&
              chosenCategory !== "Uncategorized" &&
              userCategoryNames.includes(chosenCategory)
            ) {
              mappings[merchant.description] = chosenCategory;
              confidenceScores[merchant.description] = confidence;
            } else {
              mappings[merchant.description] = "Uncategorized";
              confidenceScores[merchant.description] = confidence;
            }
          }
        } else {
          // Handles answers as an array: [ { name: string, choice: string, confidence: number } ]
          for (const item of answers) {
            const merchant = keyToMerchantMap[item.name];
            if (!merchant) continue;

            if (
              item.choice &&
              item.choice !== "Uncategorized" &&
              userCategoryNames.includes(item.choice)
            ) {
              mappings[merchant.description] = item.choice;
              confidenceScores[merchant.description] = item.confidence ?? 0.8;
            } else {
              mappings[merchant.description] = "Uncategorized";
              confidenceScores[merchant.description] = item.confidence ?? 0.8;
            }
          }
        }
      }

      // Fill in any merchants not returned by Jev (retain original CSV category)
      for (const merchant of batch) {
        if (!mappings[merchant.description]) {
          mappings[merchant.description] = merchant.csvCategories[0] || "Uncategorized";
          confidenceScores[merchant.description] = 0.0;
        }
      }
    } catch (err) {
      logSafeAIError(
        "[JevCategorizer] Batch classification failed, using fallback",
        err,
        { batchSize: batch.length, model: modelId }
      );
      for (const merchant of batch) {
        if (!mappings[merchant.description]) {
          mappings[merchant.description] = merchant.csvCategories[0] || "Uncategorized";
          confidenceScores[merchant.description] = 0.0;
        }
      }
    }
  }

  return {
    mappings,
    confidenceScores,
    categorizedCount: Object.keys(mappings).length,
    method: anySucceeded ? "jev" : "fallback",
  };
}
