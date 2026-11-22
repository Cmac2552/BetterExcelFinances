import { generateText, Output } from "ai";
import {
  FinancialHealthOutputSchema,
  type FinancialHealthOutput,
  type FinancialHealthPayload,
  type InsightTone,
} from "./schema";
import {
  buildHealthCheckSystemPrompt,
  buildHealthCheckUserPrompt,
} from "./prompts";
import {
  getFallbackInsightsModel,
  getInsightsModel,
  type InsightsAIProvider,
  type ResolvedModelConfig,
} from "./provider";
import { logSafeAIError } from "../ai/errors";

export interface GenerateHealthReportOptions {
  payload: FinancialHealthPayload;
  tone: InsightTone;
  provider?: InsightsAIProvider;
  modelId?: string;
}

export interface GenerateHealthReportResult {
  report: FinancialHealthOutput;
  provider: InsightsAIProvider;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
}

const PRIMARY_TIMEOUT_MS = 30_000;
const FALLBACK_TIMEOUT_MS = 25_000;

async function invokeStructuredGeneration(
  config: ResolvedModelConfig,
  tone: InsightTone,
  payload: FinancialHealthPayload,
  timeoutMs: number
): Promise<GenerateHealthReportResult> {
  const result = await generateText({
    model: config.model,
    system: buildHealthCheckSystemPrompt(tone),
    prompt: buildHealthCheckUserPrompt(payload),
    output: Output.object({
      schema: FinancialHealthOutputSchema,
    }),
    maxOutputTokens: 5000,
    temperature: tone === "CFO" ? 0.2 : 0.45,
    maxRetries: 1,
    abortSignal: AbortSignal.timeout(timeoutMs),
  });

  if (!result.output) {
    throw new Error("AI model did not return a structured financial health report.");
  }

  const categoryTotals = new Map<string, number>();
  for (const cat of payload.spending.categories) {
    categoryTotals.set(cat.category.toLowerCase(), cat.currentMonthTotal);
  }

  // Ground one-off amounts against actual month totals so LLM hallucinations
  // cannot corrupt Core Spending arithmetic in the UI.
  let remainingSpendBudget = Math.max(
    0,
    Math.round(payload.spending.currentMonthTotal)
  );
  const groundedOneOffs = result.output.notedOneOffs.map((o) => {
    const trimmedCategory = o.category.trim();
    const catCap = categoryTotals.get(trimmedCategory.toLowerCase());
    const rawRounded = Number.isFinite(o.amount) ? Math.max(0, Math.round(o.amount)) : 0;
    const cappedByCategory =
      catCap !== undefined ? Math.min(rawRounded, Math.round(catCap)) : rawRounded;
    const safeAmount = Math.min(cappedByCategory, remainingSpendBudget);
    remainingSpendBudget = Math.max(0, remainingSpendBudget - safeAmount);

    return {
      ...o,
      category: trimmedCategory,
      amount: safeAmount,
      note: o.note.trim(),
    };
  });

  const cleanedReport: FinancialHealthOutput = {
    ...result.output,
    headline: result.output.headline.trim(),
    netWorthSynthesis: result.output.netWorthSynthesis.trim(),
    spendingVsSixMonths: result.output.spendingVsSixMonths.map((s) => s.trim()),
    creepingCategories: result.output.creepingCategories.map((c) => ({
      ...c,
      category: c.category.trim(),
      trend: c.trend.trim(),
      note: c.note.trim(),
    })),
    notedOneOffs: groundedOneOffs,
    recommendations: result.output.recommendations.map((r) => ({
      ...r,
      title: r.title.trim(),
      detail: r.detail.trim(),
    })),
  };

  return {
    report: cleanedReport,
    provider: config.provider,
    model: config.modelId,
    inputTokens: result.usage?.inputTokens ?? null,
    outputTokens: result.usage?.outputTokens ?? null,
  };
}

/**
 * Pure generation entry point for monthly financial health reports.
 * Tries the primary provider (Google AI Studio) and automatically falls back
 * to Claude Sonnet 5.5 on Amazon Bedrock (ZDR via OpenRouter) on failure.
 * Decoupled from Prisma and Next.js so it can be called directly from an eval suite.
 */
export async function generateFinancialHealthReport({
  payload,
  tone,
  provider: providerOverride,
  modelId: modelIdOverride,
}: GenerateHealthReportOptions): Promise<GenerateHealthReportResult> {
  const hasExplicitOverride = Boolean(providerOverride || modelIdOverride);

  let primaryConfig: ResolvedModelConfig | null = null;
  let primaryError: unknown = null;

  try {
    primaryConfig = getInsightsModel({
      provider: providerOverride,
      modelId: modelIdOverride,
    });
  } catch (err) {
    primaryError = err;
    logSafeAIError("Primary insights provider initialization failed", err, {
      monthKey: payload.targetMonthKey,
    });
  }

  if (primaryConfig) {
    try {
      return await invokeStructuredGeneration(
        primaryConfig,
        tone,
        payload,
        PRIMARY_TIMEOUT_MS
      );
    } catch (err) {
      primaryError = err;
      logSafeAIError("Primary insights generation failed", err, {
        provider: primaryConfig.provider,
        model: primaryConfig.modelId,
        monthKey: payload.targetMonthKey,
      });
    }
  }

  if (!hasExplicitOverride) {
    const fallbackConfig = getFallbackInsightsModel(
      primaryConfig?.provider ?? "google"
    );

    if (fallbackConfig) {
      try {
        return await invokeStructuredGeneration(
          fallbackConfig,
          tone,
          payload,
          FALLBACK_TIMEOUT_MS
        );
      } catch (fallbackErr) {
        logSafeAIError("Fallback insights generation failed", fallbackErr, {
          provider: fallbackConfig.provider,
          model: fallbackConfig.modelId,
          monthKey: payload.targetMonthKey,
        });
        throw fallbackErr;
      }
    }
  }

  throw primaryError ?? new Error("Insights generation failed.");
}
