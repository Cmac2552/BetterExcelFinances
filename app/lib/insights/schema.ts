import { z } from "zod";

export const MAX_INSIGHTS_VERSIONS_PER_MONTH = 5;

export const InsightToneSchema = z.enum(["COACH", "CFO"]);
export type InsightTone = z.infer<typeof InsightToneSchema>;

export const HealthStatusSchema = z.enum(["strong", "watch", "concern"]);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

/**
 * Strict, concise output schema enforced via AI SDK structured output.
 * Kept pure (no Prisma/Next imports) so it can be reused directly in an eval suite.
 */
export const FinancialHealthOutputSchema = z.object({
  status: HealthStatusSchema.describe(
    "Overall monthly financial health rating: 'strong' (healthy), 'watch' (minor drift/caution), or 'concern' (meaningful overspending or net worth drag)."
  ),
  headline: z
    .string()
    .describe(
      "A single punchy 1-2 sentence overall verdict for the month, written strictly in the requested tone, without listing every account delta."
    ),
  spendingVsSixMonths: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe(
      "2-3 crisp bullets (<= 22 words each) covering total spending, core spending excluding one-offs, and what stayed steady vs. the prior baseline (whole dollars)."
    ),
  creepingCategories: z
    .array(
      z.object({
        category: z.string(),
        trend: z
          .string()
          .describe(
            "Ultra-short single-line badge (max 26 chars) in whole dollars, e.g. '$267 → $585 (5 mos)' or '$58 → $131 (+126%)'."
          ),
        note: z
          .string()
          .describe(
            "1 concise sentence in the requested tone explaining why this looks like recurring creep (frequency, run-rate, or habit shift)."
          ),
      })
    )
    .max(3)
    .describe(
      "Up to 3 categories showing steady upward drift over recent months (e.g. rising month-over-month or increasing transaction frequency). Empty array if none."
    ),
  notedOneOffs: z
    .array(
      z.object({
        category: z.string(),
        amount: z
          .number()
          .finite()
          .nonnegative()
          .describe(
            "Rounded whole-dollar amount of the one-off spend (subtracted from total spending to compute Core Spending in the UI)."
          ),
        note: z
          .string()
          .describe(
            "1 concise sentence acknowledging the understandable spike (e.g. vacation, annual bill, single large purchase) and why it is distinct from habitual creep."
          ),
      })
    )
    .max(2)
    .describe(
      "Up to 2 notable one-off/lumpy category spikes that are understandable and distinct from habitual creep. Empty array if none."
    ),
  netWorthSynthesis: z
    .string()
    .describe(
      "2-3 crisp sentences focused on what moved Net Worth this month (investments, liquid cash/sinking funds, and debt changes) on its own merits, without forcing spending correlation."
    ),
  recommendations: z
    .array(
      z.object({
        title: z
          .string()
          .describe("Short action headline (3-6 words)."),
        detail: z
          .string()
          .describe(
            "1 concise, specific sentence in the requested tone referencing an actual category, account, or whole-dollar target for next month. No generic finance platitudes."
          ),
      })
    )
    .min(1)
    .max(3)
    .describe("2-3 concrete, dollar-grounded recommendations for next month."),
});

export type FinancialHealthOutput = z.infer<typeof FinancialHealthOutputSchema>;

export interface CategoryMonthPoint {
  monthKey: string;
  label: string;
  total: number;
  transactionCount: number;
}

export interface CategoryTrendInput {
  category: string;
  userNotes: string | null;
  currentMonthTotal: number;
  currentMonthCount: number;
  priorMonthsAvg: number; // average over available baseline months
  deltaVsBaseline: number;
  pctVsBaseline: number | null;
  monthlyHistory: CategoryMonthPoint[]; // oldest -> newest (prior months + current)
  topTransactionsThisMonth?: {
    description: string;
    amount: number;
  }[];
}

export interface NetWorthSectionInput {
  title: string;
  assetClass: "ASSET" | "DEBT" | string;
  total: number;
  previousMonthTotal: number | null;
  delta: number | null;
  items: {
    label: string;
    value: number;
    previousMonthValue: number | null;
    delta: number | null;
  }[];
}

export interface NetWorthMonthInput {
  monthKey: string;
  totalAssets: number;
  totalDebts: number;
  totalNetWorth: number;
  previousMonthKey: string;
  hasPreviousMonth: boolean;
  previousTotalAssets: number | null;
  previousTotalDebts: number | null;
  previousTotalNetWorth: number | null;
  netWorthDelta: number | null;
  assetsDelta: number | null;
  debtsDelta: number | null;
  sections: NetWorthSectionInput[];
}

export interface FinancialHealthPayload {
  targetMonthKey: string;
  targetMonthLabel: string;
  baselineMonthsAvailable: number; // 0..6
  spending: {
    currentMonthTotal: number;
    currentMonthTransactionCount: number;
    priorMonthsWithData: number;
    priorAverageTotal: number | null;
    deltaVsPriorAverage: number | null;
    pctVsPriorAverage: number | null;
    monthlyTotals: {
      monthKey: string;
      label: string;
      total: number;
      transactionCount: number;
    }[];
    categories: CategoryTrendInput[];
  };
  netWorth: NetWorthMonthInput;
}

export interface MetricsSnapshot {
  monthKey: string;
  monthLabel: string;
  currentMonthSpend: number;
  baselineAverageSpend: number | null;
  baselineMonthsAvailable: number;
  spendDeltaPct: number | null;
  totalNetWorth: number;
  previousNetWorth: number | null;
  netWorthDelta: number | null;
  totalAssets: number;
  totalDebts: number;
}

export interface SavedHealthReport {
  id: number;
  monthKey: string;
  version: number;
  tone: InsightTone;
  reportData: FinancialHealthOutput;
  metricsSnapshot: MetricsSnapshot;
  dataHash: string;
  model: string;
  provider: string;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: string; // ISO string for client serialization
}
