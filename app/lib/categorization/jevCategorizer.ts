/**
 * Jev Decision Model Categorization Service for Better Excel Finances.
 * Utilizes TypeSafe's Jev (System One structured decision model) on OpenRouter
 * via the Decisions API (POST https://openrouter.ai/api/alpha/decisions).
 */

export interface CategorizeOptions {
  unmappedCategories: string[];
  userCategories: string[];
  sampleDescriptions?: Record<string, string[]>;
}

export interface CategorizationResult {
  mappings: Record<string, string>; // csvCategory -> userCategory
  confidenceScores: Record<string, number>;
  categorizedCount: number;
  method: "fast-path" | "jev" | "hybrid" | "fallback";
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

/**
 * Normalizes a string for loose comparison (lowercase, trimmed, collapsed whitespace).
 */
function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function tokenizeString(str: string): string[] {
  return str
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Attempts fast-path matching using exact, case-insensitive, or synonym heuristics.
 */
function tryFastPathMatch(
  csvCategory: string,
  userCategories: string[]
): string | null {
  const normalizedCsv = normalizeString(csvCategory);

  // 1. Direct case-insensitive match
  for (const userCat of userCategories) {
    if (normalizeString(userCat) === normalizedCsv) {
      return userCat;
    }
  }

  // 2. Common financial synonym lookup (token-based to avoid false substring matches like "gas" in "Gas & Electric")
  const csvTokens = tokenizeString(csvCategory);
  if (csvTokens.length > 2) {
    // Let Jev handle multi-word composite categories like "Gas & Electric"
    return null;
  }

  const synonymGroups: string[][] = [
    ["groceries", "grocery", "supermarkets", "supermarket"],
    ["dining", "diningout", "restaurants", "restaurant", "foodanddrink", "fooddrink"],
    ["transportation", "transport", "gas", "gasoline", "automotive", "auto"],
    ["utilities", "utility", "electric", "water", "internet"],
    ["travel", "flights", "hotels", "lodging", "airline"],
    ["shopping", "merchandise", "retail"],
    ["healthcare", "health", "medical", "healthwellness"],
    ["entertainment", "recreation", "movies"],
  ];

  for (const group of synonymGroups) {
    const csvMatchesGroup =
      group.includes(normalizedCsv) ||
      csvTokens.some((token) => group.includes(token));

    if (csvMatchesGroup) {
      const matchedUserCat = userCategories.find((userCat) => {
        const normUser = normalizeString(userCat);
        const userTokens = tokenizeString(userCat);
        return (
          group.includes(normUser) ||
          userTokens.some((token) => group.includes(token))
        );
      });
      if (matchedUserCat) {
        return matchedUserCat;
      }
    }
  }

  return null;
}

/**
 * Generates descriptive criteria for user categories to guide Jev's choice decisions.
 */
function buildCriteriaForCategories(userCategories: string[]): Record<string, string> {
  const criteria: Record<string, string> = {};

  for (const cat of userCategories) {
    const key = cat.toLowerCase().trim();
    if (DEFAULT_CRITERIA_DESCRIPTORS[key]) {
      criteria[cat] = DEFAULT_CRITERIA_DESCRIPTORS[key];
    } else {
      // Find partial matches or provide descriptive fallback
      const matchingKey = Object.keys(DEFAULT_CRITERIA_DESCRIPTORS).find((k) =>
        key.includes(k) || k.includes(key)
      );
      criteria[cat] = matchingKey
        ? DEFAULT_CRITERIA_DESCRIPTORS[matchingKey]
        : `Expenses related to ${cat}`;
    }
  }

  // Always include Uncategorized as an explicit fallback choice
  if (!userCategories.includes("Uncategorized")) {
    criteria["Uncategorized"] = "Does not clearly fit any of the above categories";
  }

  return criteria;
}

/**
 * Classifies unmapped CSV categories against user categories using TypeSafe Jev on OpenRouter.
 */
export async function classifyCategoriesWithJev({
  unmappedCategories,
  userCategories,
  sampleDescriptions = {},
}: CategorizeOptions): Promise<CategorizationResult> {
  const mappings: Record<string, string> = {};
  const confidenceScores: Record<string, number> = {};

  if (!unmappedCategories.length || !userCategories.length) {
    return {
      mappings,
      confidenceScores,
      categorizedCount: 0,
      method: "fallback",
    };
  }

  // 1. Fast-Path Pre-filter
  const remainingToMap: string[] = [];
  for (const cat of unmappedCategories) {
    const fastMatch = tryFastPathMatch(cat, userCategories);
    if (fastMatch) {
      mappings[cat] = fastMatch;
      confidenceScores[cat] = 1.0;
    } else {
      remainingToMap.push(cat);
    }
  }

  if (remainingToMap.length === 0) {
    return {
      mappings,
      confidenceScores,
      categorizedCount: Object.keys(mappings).length,
      method: "fast-path",
    };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("[JevCategorizer] OPENROUTER_API_KEY is not set. Falling back for unmapped categories.");
    for (const cat of remainingToMap) {
      mappings[cat] = cat; // retain raw category
      confidenceScores[cat] = 0.0;
    }
    return {
      mappings,
      confidenceScores,
      categorizedCount: Object.keys(mappings).length,
      method: Object.keys(mappings).length > remainingToMap.length ? "hybrid" : "fallback",
    };
  }

  // Select model: prefer Jev model
  const configuredModel = process.env.OPENROUTER_MODEL;
  const modelId =
    configuredModel && configuredModel.includes("jev")
      ? configuredModel
      : "typesafe/jev-1.14";

  const criteria = buildCriteriaForCategories(userCategories);

  // Prepare questions for Jev Decision API
  // Jev questions keys should be valid identifier tokens
  const questionMap: Record<string, { type: "choice"; instructions: string; criteria: Record<string, string> }> = {};
  const keyToCsvCategoryMap: Record<string, string> = {};

  remainingToMap.forEach((cat, idx) => {
    const questionKey = `q_${idx}_${normalizeString(cat).slice(0, 16) || "cat"}`;
    keyToCsvCategoryMap[questionKey] = cat;

    const samples = sampleDescriptions[cat]?.slice(0, 5) || [];
    const sampleContext = samples.length ? ` (e.g. ${samples.join(", ")})` : "";

    questionMap[questionKey] = {
      type: "choice",
      instructions: `Which budget category best fits statement category '${cat}'${sampleContext}?`,
      criteria,
    };
  });

  const statePayload = {
    statement_categories: remainingToMap.map((cat) => ({
      category: cat,
      sample_merchants: sampleDescriptions[cat]?.slice(0, 5) || [],
    })),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

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
      const errorText = await response.text();
      console.error(`[JevCategorizer] OpenRouter Decisions API error (${response.status}):`, errorText);
      throw new Error(`OpenRouter Decisions API failed with status ${response.status}`);
    }

    const data = await response.json();
    const answers = data?.answers;

    if (answers && typeof answers === "object") {
      // Handles answers as an object: { [questionKey]: { type: "choice", choice: string, confidence: number } }
      if (!Array.isArray(answers)) {
        for (const [qKey, answerObj] of Object.entries(answers)) {
          const csvCat = keyToCsvCategoryMap[qKey];
          if (!csvCat) continue;

          const anyAns = answerObj as { choice?: string; confidence?: number };
          const chosenCategory = anyAns?.choice;
          const confidence = anyAns?.confidence ?? 0.8;

          if (chosenCategory && chosenCategory !== "Uncategorized" && userCategories.includes(chosenCategory)) {
            mappings[csvCat] = chosenCategory;
            confidenceScores[csvCat] = confidence;
          } else {
            mappings[csvCat] = "Uncategorized";
            confidenceScores[csvCat] = confidence;
          }
        }
      } else {
        // Handles answers as an array: [ { name: string, choice: string, confidence: number } ]
        for (const item of answers) {
          const csvCat = keyToCsvCategoryMap[item.name];
          if (!csvCat) continue;

          if (item.choice && item.choice !== "Uncategorized" && userCategories.includes(item.choice)) {
            mappings[csvCat] = item.choice;
            confidenceScores[csvCat] = item.confidence ?? 0.8;
          } else {
            mappings[csvCat] = "Uncategorized";
            confidenceScores[csvCat] = item.confidence ?? 0.8;
          }
        }
      }
    }

    // Fill in any that weren't returned by Jev (retain original CSV category)
    for (const cat of remainingToMap) {
      if (!mappings[cat]) {
        mappings[cat] = cat;
        confidenceScores[cat] = 0.0;
      }
    }

    return {
      mappings,
      confidenceScores,
      categorizedCount: Object.keys(mappings).length,
      method: "hybrid",
    };
  } catch (err) {
    console.error("[JevCategorizer] Error during classification, using fallback:", err);
    for (const cat of remainingToMap) {
      if (!mappings[cat]) {
        mappings[cat] = cat;
        confidenceScores[cat] = 0.0;
      }
    }
    return {
      mappings,
      confidenceScores,
      categorizedCount: Object.keys(mappings).length,
      method: "fallback",
    };
  }
}
