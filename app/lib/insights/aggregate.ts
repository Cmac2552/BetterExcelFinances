import { createHash } from "crypto";
import {
  scrubOptionalTextForAI,
  scrubTextForAI,
} from "../ai/scrub";
import {
  formatMonthKeyLabel,
  getPreviousMonthKeys,
  toStatementMonth,
} from "./monthKey";

const MAX_CATEGORIES_IN_PAYLOAD = 40;
const MAX_SECTIONS_IN_PAYLOAD = 40;
const MAX_ITEMS_PER_SECTION = 40;
import type {
  CategoryMonthPoint,
  CategoryTrendInput,
  FinancialHealthPayload,
  MetricsSnapshot,
  NetWorthSectionInput,
} from "./schema";

export interface RawTransactionRow {
  amount: number;
  description: string;
  category: string;
  statementMonth: string;
}

export interface RawGroupedSpendingRow {
  statementMonth: string;
  category: string;
  total: number;
  count: number;
}

export interface RawCategoryNote {
  name: string;
  description: string | null;
}

export interface RawSectionWithItems {
  title: string;
  assetClass: string;
  values: {
    label: string;
    value: number;
  }[];
}

function round2(n: number): number {
  return Number.parseFloat(n.toFixed(2));
}

function computeSectionTotals(sections: RawSectionWithItems[]) {
  let totalAssets = 0;
  let totalDebts = 0;

  for (const section of sections) {
    const sum = section.values.reduce((acc, item) => acc + item.value, 0);
    if (section.assetClass === "ASSET") {
      totalAssets += sum;
    } else {
      totalDebts += sum;
    }
  }

  return {
    totalAssets,
    totalDebts,
    totalNetWorth: totalAssets - totalDebts,
  };
}

/**
 * Pure aggregator that converts database rows into a compact, deterministic
 * FinancialHealthPayload + MetricsSnapshot + SHA-256 fingerprint.
 * Decoupled from Prisma so it can be unit-tested or reused in eval fixtures.
 */
export function buildFinancialHealthContext(params: {
  targetMonthKey: string;
  currentMonthTransactions: RawTransactionRow[];
  priorGroupedSpending: RawGroupedSpendingRow[];
  categoryNotes: RawCategoryNote[];
  currentSections: RawSectionWithItems[];
  previousSections: RawSectionWithItems[];
}): {
  payload: FinancialHealthPayload;
  metricsSnapshot: MetricsSnapshot;
  dataHash: string;
} {
  const {
    targetMonthKey,
    currentMonthTransactions,
    priorGroupedSpending,
    categoryNotes,
    currentSections,
    previousSections,
  } = params;

  const priorMonthKeys = getPreviousMonthKeys(targetMonthKey, 6);
  const previousMonthKey = priorMonthKeys[priorMonthKeys.length - 1];
  const allMonthKeys = [...priorMonthKeys, targetMonthKey];

  const statementMonthToKey = new Map<string, string>();
  for (const mk of allMonthKeys) {
    statementMonthToKey.set(toStatementMonth(mk), mk);
  }

  // Map: category -> monthKey -> { total, count }
  const categoryMonthMap = new Map<
    string,
    Map<string, { total: number; count: number }>
  >();

  // Map: monthKey -> { total, count }
  const monthTotalsMap = new Map<string, { total: number; count: number }>();
  for (const mk of allMonthKeys) {
    monthTotalsMap.set(mk, { total: 0, count: 0 });
  }

  // Record prior 6 months from grouped DB rows
  for (const row of priorGroupedSpending) {
    const mk = statementMonthToKey.get(row.statementMonth);
    if (!mk || mk === targetMonthKey) continue;

    const cat = scrubTextForAI(row.category || "", 60) || "Uncategorized";
    const amt = round2(row.total);
    if (amt <= 0) continue;

    let catMonths = categoryMonthMap.get(cat);
    if (!catMonths) {
      catMonths = new Map();
      categoryMonthMap.set(cat, catMonths);
    }
    const existing = catMonths.get(mk) ?? { total: 0, count: 0 };
    catMonths.set(mk, {
      total: round2(existing.total + amt),
      count: existing.count + row.count,
    });

    const mTotal = monthTotalsMap.get(mk)!;
    mTotal.total = round2(mTotal.total + amt);
    mTotal.count += row.count;
  }

  // Record current month from full transactions list so we can also pull top outliers
  const currentTxByCategory = new Map<
    string,
    { description: string; amount: number }[]
  >();

  for (const tx of currentMonthTransactions) {
    if (tx.amount <= 0) continue;
    const cat = scrubTextForAI(tx.category || "", 60) || "Uncategorized";
    const amt = round2(tx.amount);

    let catMonths = categoryMonthMap.get(cat);
    if (!catMonths) {
      catMonths = new Map();
      categoryMonthMap.set(cat, catMonths);
    }
    const existing = catMonths.get(targetMonthKey) ?? { total: 0, count: 0 };
    catMonths.set(targetMonthKey, {
      total: round2(existing.total + amt),
      count: existing.count + 1,
    });

    const mTotal = monthTotalsMap.get(targetMonthKey)!;
    mTotal.total = round2(mTotal.total + amt);
    mTotal.count += 1;

    const list = currentTxByCategory.get(cat) ?? [];
    list.push({
      description: scrubTextForAI(tx.description || "", 100) || "Transaction",
      amount: amt,
    });
    currentTxByCategory.set(cat, list);
  }

  // Baseline calculations over prior months that actually have recorded spend
  const priorMonthsWithDataKeys = priorMonthKeys.filter(
    (mk) => (monthTotalsMap.get(mk)?.total ?? 0) > 0
  );
  const priorMonthsWithData = priorMonthsWithDataKeys.length;

  const currentMonthSummary = monthTotalsMap.get(targetMonthKey)!;
  const priorTotalSum = priorMonthsWithDataKeys.reduce(
    (sum, mk) => sum + (monthTotalsMap.get(mk)?.total ?? 0),
    0
  );
  const priorAverageTotal =
    priorMonthsWithData > 0 ? round2(priorTotalSum / priorMonthsWithData) : null;
  const deltaVsPriorAverage =
    priorAverageTotal !== null
      ? round2(currentMonthSummary.total - priorAverageTotal)
      : null;
  const pctVsPriorAverage =
    priorAverageTotal !== null && priorAverageTotal > 0
      ? round2(
          ((currentMonthSummary.total - priorAverageTotal) / priorAverageTotal) *
            100
        )
      : null;

  // User category notes lookup (case-insensitive, scrubbed for AI)
  const notesLookup = new Map<string, string>();
  for (const c of categoryNotes) {
    const scrubbedName = scrubTextForAI(c.name || "", 60).toLowerCase();
    const scrubbedNote = scrubOptionalTextForAI(c.description, 300);
    if (scrubbedName && scrubbedNote) {
      notesLookup.set(scrubbedName, scrubbedNote);
    }
  }

  // Build category trend list (sorted deterministically by current month spend desc, then name)
  const categories: CategoryTrendInput[] = Array.from(categoryMonthMap.entries())
    .map(([category, monthMap]) => {
      const currentEntry = monthMap.get(targetMonthKey) ?? {
        total: 0,
        count: 0,
      };
      const priorSum = priorMonthsWithDataKeys.reduce(
        (sum, mk) => sum + (monthMap.get(mk)?.total ?? 0),
        0
      );
      const priorAvg =
        priorMonthsWithData > 0 ? round2(priorSum / priorMonthsWithData) : 0;
      const delta = round2(currentEntry.total - priorAvg);
      const pct =
        priorAvg > 0
          ? round2(((currentEntry.total - priorAvg) / priorAvg) * 100)
          : null;

      const monthlyHistory: CategoryMonthPoint[] = allMonthKeys.map((mk) => {
        const entry = monthMap.get(mk) ?? { total: 0, count: 0 };
        return {
          monthKey: mk,
          label: formatMonthKeyLabel(mk, "short"),
          total: round2(entry.total),
          transactionCount: entry.count,
        };
      });

      const shouldIncludeTopTx =
        currentEntry.total > 0 &&
        (delta >= 40 ||
          (pct !== null && pct >= 15) ||
          priorAvg === 0 ||
          currentEntry.total >= 300);

      const topTransactionsThisMonth = shouldIncludeTopTx
        ? (currentTxByCategory.get(category) ?? [])
            .slice()
            .sort(
              (a, b) =>
                b.amount - a.amount || a.description.localeCompare(b.description)
            )
            .slice(0, 5)
        : undefined;

      return {
        category,
        userNotes: notesLookup.get(category.toLowerCase()) ?? null,
        currentMonthTotal: round2(currentEntry.total),
        currentMonthCount: currentEntry.count,
        priorMonthsAvg: priorAvg,
        deltaVsBaseline: delta,
        pctVsBaseline: pct,
        monthlyHistory,
        ...(topTransactionsThisMonth && topTransactionsThisMonth.length > 0
          ? { topTransactionsThisMonth }
          : {}),
      };
    })
    .sort(
      (a, b) =>
        b.currentMonthTotal - a.currentMonthTotal ||
        a.category.localeCompare(b.category)
    )
    .slice(0, MAX_CATEGORIES_IN_PAYLOAD);

  // Net worth breakdown (Account -> Subcategory, with MoM deltas)
  const currentNwTotals = computeSectionTotals(currentSections);
  const hasPreviousMonth = previousSections.length > 0;
  const previousNwTotals = hasPreviousMonth
    ? computeSectionTotals(previousSections)
    : null;

  const prevSectionMap = new Map<string, RawSectionWithItems>();
  for (const sec of previousSections) {
    prevSectionMap.set(
      `${sec.assetClass}::${sec.title.trim().toLowerCase()}`,
      sec
    );
  }

  const matchedPrevKeys = new Set<string>();

  const sections: NetWorthSectionInput[] = currentSections
    .slice()
    .sort((a, b) =>
      a.assetClass === b.assetClass
        ? a.title.localeCompare(b.title)
        : a.assetClass.localeCompare(b.assetClass)
    )
    .map((sec) => {
      const key = `${sec.assetClass}::${sec.title.trim().toLowerCase()}`;
      const prevSec = prevSectionMap.get(key);
      if (prevSec) matchedPrevKeys.add(key);

      const secTotal = sec.values.reduce((acc, item) => acc + item.value, 0);
      const prevSecTotal = prevSec
        ? prevSec.values.reduce((acc, item) => acc + item.value, 0)
        : hasPreviousMonth
          ? 0
          : null;

      const prevItemsMap = new Map<string, number>();
      if (prevSec) {
        for (const item of prevSec.values) {
          prevItemsMap.set(item.label.trim().toLowerCase(), item.value);
        }
      }

      const items = sec.values
        .slice()
        .sort((a, b) => a.label.localeCompare(b.label))
        .slice(0, MAX_ITEMS_PER_SECTION)
        .map((item) => {
          const prevVal = prevSec
            ? (prevItemsMap.get(item.label.trim().toLowerCase()) ?? 0)
            : hasPreviousMonth
              ? 0
              : null;
          return {
            label: scrubTextForAI(item.label || "", 80) || "Account",
            value: item.value,
            previousMonthValue: prevVal,
            delta: prevVal !== null ? item.value - prevVal : null,
          };
        });

      return {
        title: scrubTextForAI(sec.title || "", 80) || "Account Group",
        assetClass: sec.assetClass,
        total: secTotal,
        previousMonthTotal: prevSecTotal,
        delta: prevSecTotal !== null ? secTotal - prevSecTotal : null,
        items,
      };
    });

  // Include any sections that existed last month but were closed/removed this month
  if (hasPreviousMonth) {
    for (const prevSec of previousSections) {
      const key = `${prevSec.assetClass}::${prevSec.title.trim().toLowerCase()}`;
      if (matchedPrevKeys.has(key)) continue;

      const prevSecTotal = prevSec.values.reduce(
        (acc, item) => acc + item.value,
        0
      );
      sections.push({
        title: scrubTextForAI(prevSec.title || "", 80) || "Account Group",
        assetClass: prevSec.assetClass,
        total: 0,
        previousMonthTotal: prevSecTotal,
        delta: -prevSecTotal,
        items: prevSec.values
          .slice()
          .sort((a, b) => a.label.localeCompare(b.label))
          .slice(0, MAX_ITEMS_PER_SECTION)
          .map((item) => ({
            label: scrubTextForAI(item.label || "", 80) || "Account",
            value: 0,
            previousMonthValue: item.value,
            delta: -item.value,
          })),
      });
    }
  }

  const boundedSections = sections.slice(0, MAX_SECTIONS_IN_PAYLOAD);

  const targetMonthLabel = formatMonthKeyLabel(targetMonthKey, "long");

  const payload: FinancialHealthPayload = {
    targetMonthKey,
    targetMonthLabel,
    baselineMonthsAvailable: priorMonthsWithData,
    spending: {
      currentMonthTotal: round2(currentMonthSummary.total),
      currentMonthTransactionCount: currentMonthSummary.count,
      priorMonthsWithData,
      priorAverageTotal,
      deltaVsPriorAverage,
      pctVsPriorAverage,
      monthlyTotals: allMonthKeys.map((mk) => {
        const entry = monthTotalsMap.get(mk)!;
        return {
          monthKey: mk,
          label: formatMonthKeyLabel(mk, "short"),
          total: round2(entry.total),
          transactionCount: entry.count,
        };
      }),
      categories,
    },
    netWorth: {
      monthKey: targetMonthKey,
      totalAssets: currentNwTotals.totalAssets,
      totalDebts: currentNwTotals.totalDebts,
      totalNetWorth: currentNwTotals.totalNetWorth,
      previousMonthKey,
      hasPreviousMonth,
      previousTotalAssets: previousNwTotals?.totalAssets ?? null,
      previousTotalDebts: previousNwTotals?.totalDebts ?? null,
      previousTotalNetWorth: previousNwTotals?.totalNetWorth ?? null,
      netWorthDelta: previousNwTotals
        ? currentNwTotals.totalNetWorth - previousNwTotals.totalNetWorth
        : null,
      assetsDelta: previousNwTotals
        ? currentNwTotals.totalAssets - previousNwTotals.totalAssets
        : null,
      debtsDelta: previousNwTotals
        ? currentNwTotals.totalDebts - previousNwTotals.totalDebts
        : null,
      sections: boundedSections,
    },
  };

  const metricsSnapshot: MetricsSnapshot = {
    monthKey: targetMonthKey,
    monthLabel: targetMonthLabel,
    currentMonthSpend: payload.spending.currentMonthTotal,
    baselineAverageSpend: payload.spending.priorAverageTotal,
    baselineMonthsAvailable: priorMonthsWithData,
    spendDeltaPct: payload.spending.pctVsPriorAverage,
    totalNetWorth: payload.netWorth.totalNetWorth,
    previousNetWorth: payload.netWorth.previousTotalNetWorth,
    netWorthDelta: payload.netWorth.netWorthDelta,
    totalAssets: payload.netWorth.totalAssets,
    totalDebts: payload.netWorth.totalDebts,
  };

  const dataHash = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  return { payload, metricsSnapshot, dataHash };
}
