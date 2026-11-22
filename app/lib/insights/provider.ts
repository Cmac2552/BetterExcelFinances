import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

export type InsightsAIProvider = "google" | "openrouter";

export interface ResolvedModelConfig {
  provider: InsightsAIProvider;
  modelId: string;
  model: LanguageModel;
}

const DEFAULT_GOOGLE_MODEL = "gemini-4-hydrogen";
const DEFAULT_OPENROUTER_BEDROCK_MODEL = "anthropic/claude-sonnet-5.5";
const OPENROUTER_BEDROCK_PROVIDER_SLUG = "amazon-bedrock";

function buildOpenRouterBedrockConfig(modelId: string): ResolvedModelConfig {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Secondary AI provider is not configured.");
  }

  const openrouter = createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer": "https://betterexcelfinances.com",
      "X-Title": "Better Excel Finances",
    },
  });

  // Strictly route through Amazon Bedrock with Zero Data Retention enforced
  // and fallbacks disabled so prompts are never routed to retaining providers.
  return {
    provider: "openrouter",
    modelId,
    model: openrouter.chat(modelId, {
      provider: {
        only: [OPENROUTER_BEDROCK_PROVIDER_SLUG],
        allow_fallbacks: false,
        data_collection: "deny",
        zdr: true,
      },
    }),
  };
}

function buildGoogleConfig(modelId: string): ResolvedModelConfig {
  const googleApiKey = (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY
  )?.trim();
  if (!googleApiKey) {
    throw new Error("Primary AI provider is not configured.");
  }

  const google = createGoogleGenerativeAI({ apiKey: googleApiKey });

  return {
    provider: "google",
    modelId,
    model: google(modelId),
  };
}

/**
 * Resolves the primary Vercel AI SDK model based on environment configuration.
 *
 * Defaults to Google AI Studio (paid billing account) with `gemini-4-hydrogen`.
 * Switch primary directly to OpenRouter (AWS Bedrock ZDR, Claude Sonnet 5.5) with:
 *   INSIGHTS_AI_PROVIDER=openrouter
 */
export function getInsightsModel(overrides?: {
  provider?: InsightsAIProvider;
  modelId?: string;
}): ResolvedModelConfig {
  const rawProvider = (
    overrides?.provider ??
    process.env.INSIGHTS_AI_PROVIDER ??
    "google"
  )
    .trim()
    .toLowerCase();

  if (rawProvider !== "google" && rawProvider !== "openrouter") {
    throw new Error("Invalid AI provider configuration.");
  }

  if (rawProvider === "openrouter") {
    const modelId =
      overrides?.modelId?.trim() ||
      process.env.INSIGHTS_AI_MODEL?.trim() ||
      DEFAULT_OPENROUTER_BEDROCK_MODEL;
    return buildOpenRouterBedrockConfig(modelId);
  }

  const modelId =
    overrides?.modelId?.trim() ||
    process.env.INSIGHTS_AI_MODEL?.trim() ||
    DEFAULT_GOOGLE_MODEL;

  return buildGoogleConfig(modelId);
}

/**
 * Resolves the zero-data-retention fallback model: Claude Sonnet 5.5 routed
 * strictly to Amazon Bedrock via OpenRouter.
 * Returns null if the fallback provider is not configured or already primary.
 */
export function getFallbackInsightsModel(
  primaryProvider: InsightsAIProvider
): ResolvedModelConfig | null {
  if (primaryProvider !== "google") {
    return null;
  }

  if (!process.env.OPENROUTER_API_KEY?.trim()) {
    return null;
  }

  const fallbackModelId =
    process.env.INSIGHTS_FALLBACK_MODEL?.trim() ||
    DEFAULT_OPENROUTER_BEDROCK_MODEL;

  return buildOpenRouterBedrockConfig(fallbackModelId);
}
