"use server";

import { auth } from "@/auth";
import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  getPreviousMonthKeys,
  getUtcMonthBounds,
  parseMonthKey,
  toStatementMonth,
} from "@/app/lib/insights/monthKey";
import { buildFinancialHealthContext } from "@/app/lib/insights/aggregate";
import { generateFinancialHealthReport } from "@/app/lib/insights/generate";
import {
  FinancialHealthOutputSchema,
  InsightToneSchema,
  MAX_INSIGHTS_VERSIONS_PER_MONTH,
  type FinancialHealthOutput,
  type InsightTone,
  type MetricsSnapshot,
  type SavedHealthReport,
} from "@/app/lib/insights/schema";
import { logSafeAIError, SafeUserError } from "@/app/lib/ai/errors";

export interface InsightsReadiness {
  hasTransactions: boolean;
  transactionCount: number;
  hasNetWorth: boolean;
  sectionCount: number;
  isReady: boolean;
}

export interface InsightsPageData {
  monthKey: string;
  readiness: InsightsReadiness;
  currentDataHash: string | null;
  currentMetrics: MetricsSnapshot | null;
  reports: SavedHealthReport[];
}

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new SafeUserError("Unauthorized: Please sign in and try again.");
  }
  return session.user.id;
}

async function loadMonthContextForUser(userId: string, monthKey: string) {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) {
    throw new Error(`Invalid month format: ${monthKey}. Expected YYYY-MM.`);
  }

  const targetStatementMonth = toStatementMonth(monthKey);
  const priorMonthKeys = getPreviousMonthKeys(monthKey, 6);
  const previousMonthKey = priorMonthKeys[priorMonthKeys.length - 1];
  const priorStatementMonths = priorMonthKeys.map(toStatementMonth);

  const currentBounds = getUtcMonthBounds(monthKey);
  const prevBounds = getUtcMonthBounds(previousMonthKey);

  const [
    currentTransactions,
    priorGroups,
    categoryNotes,
    currentSections,
    previousSections,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        statementMonth: targetStatementMonth,
        amount: { gt: 0 },
      },
      select: {
        amount: true,
        description: true,
        category: true,
        statementMonth: true,
      },
    }),
    prisma.transaction.groupBy({
      by: ["statementMonth", "category"],
      where: {
        userId,
        statementMonth: { in: priorStatementMonths },
        amount: { gt: 0 },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.category.findMany({
      where: { userId },
      select: { name: true, description: true },
    }),
    prisma.section.findMany({
      where: {
        userId,
        month: {
          gte: currentBounds.firstDay,
          lte: currentBounds.lastDay,
        },
      },
      include: {
        values: {
          select: { label: true, value: true },
        },
      },
    }),
    prisma.section.findMany({
      where: {
        userId,
        month: {
          gte: prevBounds.firstDay,
          lte: prevBounds.lastDay,
        },
      },
      include: {
        values: {
          select: { label: true, value: true },
        },
      },
    }),
  ]);

  const hasTransactions = currentTransactions.length > 0;
  const hasNetWorth = currentSections.length > 0;

  const readiness: InsightsReadiness = {
    hasTransactions,
    transactionCount: currentTransactions.length,
    hasNetWorth,
    sectionCount: currentSections.length,
    isReady: hasTransactions && hasNetWorth,
  };

  if (!readiness.isReady) {
    return {
      readiness,
      context: null,
    };
  }

  const context = buildFinancialHealthContext({
    targetMonthKey: monthKey,
    currentMonthTransactions: currentTransactions,
    priorGroupedSpending: priorGroups.map((g) => ({
      statementMonth: g.statementMonth,
      category: g.category,
      total: g._sum.amount ?? 0,
      count: g._count._all,
    })),
    categoryNotes,
    currentSections: currentSections.map((s) => ({
      title: s.title,
      assetClass: s.assetClass,
      values: s.values,
    })),
    previousSections: previousSections.map((s) => ({
      title: s.title,
      assetClass: s.assetClass,
      values: s.values,
    })),
  });

  return { readiness, context };
}

function serializeReportRow(row: {
  id: number;
  monthKey: string;
  version: number;
  tone: string;
  reportData: Prisma.JsonValue;
  metricsSnapshot: Prisma.JsonValue;
  dataHash: string;
  model: string;
  provider: string;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: Date;
}): SavedHealthReport {
  const parsedTone = InsightToneSchema.safeParse(row.tone);
  const parsedReport = FinancialHealthOutputSchema.safeParse(row.reportData);

  return {
    id: row.id,
    monthKey: row.monthKey,
    version: row.version,
    tone: parsedTone.success ? parsedTone.data : "COACH",
    reportData: parsedReport.success
      ? parsedReport.data
      : (row.reportData as unknown as FinancialHealthOutput),
    metricsSnapshot: row.metricsSnapshot as unknown as MetricsSnapshot,
    dataHash: row.dataHash,
    model: row.model,
    provider: row.provider,
    inputTokens: row.inputTokens,
    outputTokens: row.outputTokens,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getInsightsPageData(
  monthKey: string
): Promise<InsightsPageData> {
  const userId = await getAuthenticatedUserId();

  const [{ readiness, context }, reportRows] = await Promise.all([
    loadMonthContextForUser(userId, monthKey),
    prisma.financialHealthReport.findMany({
      where: { userId, monthKey },
      orderBy: { version: "desc" },
    }),
  ]);

  return {
    monthKey,
    readiness,
    currentDataHash: context?.dataHash ?? null,
    currentMetrics: context?.metricsSnapshot ?? null,
    reports: reportRows.map(serializeReportRow),
  };
}

export async function generateInsightsForMonth(input: {
  monthKey: string;
  tone: InsightTone;
}): Promise<
  | { success: true; report: SavedHealthReport }
  | { success: false; error: string }
> {
  try {
    const userId = await getAuthenticatedUserId();

    const toneResult = InsightToneSchema.safeParse(input.tone);
    if (!toneResult.success) {
      return { success: false, error: "Invalid tone selection." };
    }
    if (!parseMonthKey(input.monthKey)) {
      return { success: false, error: "Invalid month selected." };
    }

    const { readiness, context } = await loadMonthContextForUser(
      userId,
      input.monthKey
    );

    if (!readiness.isReady || !context) {
      throw new SafeUserError(
        "Both Net Worth entries and Spending transactions are required for this month before running an insight."
      );
    }

    const existingCount = await prisma.financialHealthReport.count({
      where: { userId, monthKey: input.monthKey },
    });

    if (existingCount >= MAX_INSIGHTS_VERSIONS_PER_MONTH) {
      throw new SafeUserError(
        `You have reached the maximum of ${MAX_INSIGHTS_VERSIONS_PER_MONTH} health check versions for this month. Delete an existing version to generate a new one.`
      );
    }

    const generated = await generateFinancialHealthReport({
      payload: context.payload,
      tone: toneResult.data,
    });

    // Save as the next sequential version with retry on concurrent click
    let savedRow = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const [currentCount, latest] = await Promise.all([
        prisma.financialHealthReport.count({
          where: { userId, monthKey: input.monthKey },
        }),
        prisma.financialHealthReport.findFirst({
          where: { userId, monthKey: input.monthKey },
          orderBy: { version: "desc" },
          select: { version: true },
        }),
      ]);

      if (currentCount >= MAX_INSIGHTS_VERSIONS_PER_MONTH) {
        throw new SafeUserError(
          `You have reached the maximum of ${MAX_INSIGHTS_VERSIONS_PER_MONTH} health check versions for this month. Delete an existing version to generate a new one.`
        );
      }

      const nextVersion = (latest?.version ?? 0) + 1;

      try {
        savedRow = await prisma.financialHealthReport.create({
          data: {
            userId,
            monthKey: input.monthKey,
            version: nextVersion,
            tone: toneResult.data,
            reportData: generated.report as unknown as Prisma.InputJsonValue,
            metricsSnapshot:
              context.metricsSnapshot as unknown as Prisma.InputJsonValue,
            dataHash: context.dataHash,
            model: generated.model,
            provider: generated.provider,
            inputTokens: generated.inputTokens,
            outputTokens: generated.outputTokens,
          },
        });
        break;
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002" &&
          attempt < 2
        ) {
          continue;
        }
        throw err;
      }
    }

    if (!savedRow) {
      throw new Error("Could not save generated financial health report.");
    }

    revalidatePath("/insights");

    return {
      success: true,
      report: serializeReportRow(savedRow),
    };
  } catch (error) {
    if (error instanceof SafeUserError) {
      return {
        success: false,
        error: error.message,
      };
    }

    logSafeAIError("Failed to generate financial health report", error, {
      monthKey: input.monthKey,
    });

    return {
      success: false,
      error:
        "We couldn't generate your financial health report right now. Please try again in a moment.",
    };
  }
}

export async function deleteInsightReport(
  reportId: number
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!Number.isInteger(reportId) || reportId <= 0) {
      throw new SafeUserError("Invalid report selection.");
    }

    const deleted = await prisma.financialHealthReport.deleteMany({
      where: {
        id: reportId,
        userId,
      },
    });

    if (deleted.count === 0) {
      throw new SafeUserError("Report version not found.");
    }

    revalidatePath("/insights");
    return { success: true };
  } catch (error) {
    if (error instanceof SafeUserError) {
      return {
        success: false,
        error: error.message,
      };
    }

    logSafeAIError("Failed to delete financial health report", error);

    return {
      success: false,
      error: "We couldn't delete that report version right now. Please try again.",
    };
  }
}
