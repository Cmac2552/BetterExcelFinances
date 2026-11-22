"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CalendarIcon,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Briefcase,
  Compass,
  Layers,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MonthPicker } from "@/components/ui/monthpicker";
import {
  deleteInsightReport,
  generateInsightsForMonth,
  type InsightsPageData,
} from "@/app/actions/insights";
import {
  formatMonthKeyLabel,
  parseMonthKey,
  toMonthKey,
} from "@/app/lib/insights/monthKey";
import {
  MAX_INSIGHTS_VERSIONS_PER_MONTH,
  type HealthStatus,
  type InsightTone,
  type SavedHealthReport,
} from "@/app/lib/insights/schema";

interface Props {
  initialData: InsightsPageData;
}

function formatMoney(value: number, showDecimals = false): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatSignedMoney(value: number, showDecimals = false): string {
  if (value > 0) return `+${formatMoney(value, showDecimals)}`;
  return formatMoney(value, showDecimals);
}

const STATUS_STYLES: Record<
  HealthStatus,
  { label: string; badgeClass: string; barClass: string }
> = {
  strong: {
    label: "Strong",
    badgeClass:
      "bg-[#00A896]/15 text-[#00A896] border border-[#00A896]/40",
    barClass: "from-[#00A896] to-[#f4f0e1]",
  },
  watch: {
    label: "Watch",
    badgeClass:
      "bg-amber-500/15 text-amber-300 border border-amber-400/40",
    barClass: "from-amber-400 to-[#f4f0e1]",
  },
  concern: {
    label: "Action Needed",
    badgeClass:
      "bg-[#7B0323]/30 text-rose-200 border border-[#7B0323]",
    barClass: "from-[#7B0323] to-[#f4f0e1]",
  },
};

export function InsightsClient({ initialData }: Readonly<Props>) {
  const router = useRouter();
  const [reports, setReports] = useState<SavedHealthReport[]>(
    initialData.reports
  );
  const [selectedVersion, setSelectedVersion] = useState<number | null>(
    initialData.reports[0]?.version ?? null
  );
  const [tone, setTone] = useState<InsightTone>(
    initialData.reports[0]?.tone ?? "COACH"
  );
  const [error, setError] = useState<string | null>(null);
  const [monthOpen, setMonthOpen] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isGenerating, startGenerateTransition] = useTransition();

  const parsedMonth = parseMonthKey(initialData.monthKey);
  const monthLabel = formatMonthKeyLabel(initialData.monthKey, "long");
  const pickerDate = parsedMonth
    ? new Date(parsedMonth.year, parsedMonth.month - 1, 15)
    : new Date();

  const activeReport =
    reports.find((r) => r.version === selectedVersion) ?? reports[0] ?? null;

  const latestReport = reports[0] ?? null;
  const nextVersionNumber = (latestReport?.version ?? 0) + 1;
  const hasReachedVersionLimit =
    reports.length >= MAX_INSIGHTS_VERSIONS_PER_MONTH;

  const isLatestStale =
    Boolean(latestReport) &&
    Boolean(initialData.currentDataHash) &&
    latestReport?.dataHash !== initialData.currentDataHash;

  const handleMonthSelect = (picked: Date) => {
    const nextKey = toMonthKey(picked.getFullYear(), picked.getMonth() + 1);
    setMonthOpen(false);
    router.push(`/insights?month=${nextKey}`);
  };

  const handleGenerate = () => {
    setError(null);
    setConfirmingDeleteId(null);
    startGenerateTransition(async () => {
      const res = await generateInsightsForMonth({
        monthKey: initialData.monthKey,
        tone,
      });

      if (!res.success) {
        setError(res.error);
        return;
      }

      setReports((prev) => [res.report, ...prev]);
      setSelectedVersion(res.report.version);
    });
  };

  const handleDeleteVersion = async (reportToDelete: SavedHealthReport) => {
    setError(null);
    setDeletingId(reportToDelete.id);

    try {
      const res = await deleteInsightReport(reportToDelete.id);
      if (!res.success) {
        setError(res.error);
        return;
      }

      const remaining = reports.filter((r) => r.id !== reportToDelete.id);
      setReports(remaining);
      setConfirmingDeleteId(null);
      if (activeReport?.id === reportToDelete.id) {
        setSelectedVersion(remaining[0]?.version ?? null);
      }
    } catch {
      setError("We couldn't delete that report version right now. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const uploadHref = parsedMonth
    ? `/upload?month=${parsedMonth.month}&year=${parsedMonth.year}`
    : "/upload";
  const dashboardHref = `/dashboard?month=${initialData.monthKey}`;

  return (
    <div className="container mx-auto max-w-5xl px-4 pb-16 pt-4 text-[#f4f0e1] space-y-6">
      {/* Header + Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-gray-800 pb-6">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
            Monthly Financial Health
          </p>
          <h2 className="text-3xl font-bold text-[#f4f0e1]">{monthLabel}</h2>
          <p className="text-sm text-gray-400">
            Spending trends, core burn vs. one-offs, and monthly net worth
            movement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Picker */}
          <Popover open={monthOpen} onOpenChange={setMonthOpen}>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="default">
                <CalendarIcon className="h-4 w-4" />
                {formatMonthKeyLabel(initialData.monthKey, "short")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#f4f0e1] text-black border-gray-700">
              <MonthPicker
                onMonthSelect={handleMonthSelect}
                selectedMonth={pickerDate}
                className="bg-[#f4f0e1]"
              />
            </PopoverContent>
          </Popover>

          {/* Tone Toggle */}
          <div
            role="group"
            aria-label="Insight tone"
            className="inline-flex rounded-md border border-gray-700 bg-[#1E2228] p-0.5"
          >
            <button
              type="button"
              onClick={() => setTone("COACH")}
              disabled={isGenerating}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] ${
                tone === "COACH"
                  ? "bg-[#f4f0e1] text-black"
                  : "text-[#f4f0e1] hover:bg-gray-700/60"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              Coach
            </button>
            <button
              type="button"
              onClick={() => setTone("CFO")}
              disabled={isGenerating}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] ${
                tone === "CFO"
                  ? "bg-[#f4f0e1] text-black"
                  : "text-[#f4f0e1] hover:bg-gray-700/60"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              CFO
            </button>
          </div>

          {/* Generate CTA */}
          <span
            className="relative inline-flex group"
            tabIndex={hasReachedVersionLimit ? 0 : undefined}
            aria-describedby={
              hasReachedVersionLimit ? "version-limit-tooltip" : undefined
            }
          >
            <Button
              variant="primary"
              size="default"
              onClick={handleGenerate}
              disabled={
                !initialData.readiness.isReady ||
                isGenerating ||
                hasReachedVersionLimit
              }
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : reports.length === 0 ? (
                "Run Health Check"
              ) : (
                `Generate v${nextVersionNumber}`
              )}
            </Button>
            {hasReachedVersionLimit && (
              <span
                id="version-limit-tooltip"
                role="tooltip"
                className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-64 rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-xs leading-relaxed text-[#f4f0e1] shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                You&apos;ve reached the limit of{" "}
                {MAX_INSIGHTS_VERSIONS_PER_MONTH} versions for this month.
                Delete an older version to generate a new one.
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-[#7B0323] bg-[#7B0323]/20 p-4 text-sm text-rose-100">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-300 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to generate insight</p>
            <p className="text-rose-200/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Readiness Gate (when Net Worth or Spending is missing for this month) */}
      {!initialData.readiness.isReady && (
        <Card className="bg-[#1E2228] border border-gray-700 text-[#f4f0e1]">
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold text-[#f4f0e1]">
              Finish {monthLabel} data to unlock this reading
            </h3>
            <p className="text-sm text-gray-400">
              Financial health readings require both Net Worth entries and
              statement-month Spending transactions for the selected month.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-[#141414] p-4">
              <div className="flex items-center gap-3">
                {initialData.readiness.hasNetWorth ? (
                  <CheckCircle2 className="h-5 w-5 text-[#00A896]" />
                ) : (
                  <XCircle className="h-5 w-5 text-[#7B0323]" />
                )}
                <div>
                  <p className="font-medium text-sm">Net Worth Accounts</p>
                  <p className="text-xs text-gray-400">
                    {initialData.readiness.hasNetWorth
                      ? `${initialData.readiness.sectionCount} account${
                          initialData.readiness.sectionCount === 1 ? "" : "s"
                        } entered`
                      : "No accounts entered yet"}
                  </p>
                </div>
              </div>
              {!initialData.readiness.hasNetWorth && (
                <Button variant="secondary" size="sm" asChild>
                  <Link href={dashboardHref}>
                    Add <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-[#141414] p-4">
              <div className="flex items-center gap-3">
                {initialData.readiness.hasTransactions ? (
                  <CheckCircle2 className="h-5 w-5 text-[#00A896]" />
                ) : (
                  <XCircle className="h-5 w-5 text-[#7B0323]" />
                )}
                <div>
                  <p className="font-medium text-sm">Spending Transactions</p>
                  <p className="text-xs text-gray-400">
                    {initialData.readiness.hasTransactions
                      ? `${initialData.readiness.transactionCount} transaction${
                          initialData.readiness.transactionCount === 1
                            ? ""
                            : "s"
                        } entered`
                      : "No transactions for this month"}
                  </p>
                </div>
              </div>
              {!initialData.readiness.hasTransactions && (
                <Button variant="secondary" size="sm" asChild>
                  <Link href={uploadHref}>
                    Upload <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version Strip (v1, v2, v3...) */}
      {reports.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-800 bg-[#1E2228]/70 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 mr-1">
              <Layers className="h-3.5 w-3.5" />
              Versions
            </span>
            {reports.map((rep) => {
              const isSelected = activeReport?.version === rep.version;
              return (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => {
                    setSelectedVersion(rep.version);
                    setConfirmingDeleteId(null);
                  }}
                  disabled={deletingId !== null}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] ${
                    isSelected
                      ? "border-[#f4f0e1] bg-[#f4f0e1] text-black"
                      : "border-gray-700 bg-[#141414] text-[#f4f0e1] hover:border-gray-500"
                  }`}
                >
                  <span className="font-semibold">v{rep.version}</span>
                  <span
                    className={
                      isSelected ? "text-black/75" : "text-gray-400"
                    }
                  >
                    · {rep.tone === "CFO" ? "CFO" : "Coach"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {isLatestStale && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 text-amber-200">
                <RefreshCw className="h-3 w-3" />
                Month data changed since v{latestReport?.version}
              </span>
            )}
            {activeReport && (
              <span>
                Run{" "}
                {format(new Date(activeReport.createdAt), "MMM d, yyyy h:mm a")}
              </span>
            )}
            {activeReport && (
              confirmingDeleteId === activeReport.id ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[#7B0323] bg-[#7B0323]/20 px-2 py-0.5 text-rose-100">
                  <span>Delete v{activeReport.version}?</span>
                  <button
                    type="button"
                    disabled={deletingId === activeReport.id}
                    onClick={() => handleDeleteVersion(activeReport)}
                    className="rounded bg-[#7B0323] px-1.5 py-0.5 font-semibold text-white hover:bg-[#96042b] disabled:opacity-50"
                  >
                    {deletingId === activeReport.id ? "Deleting..." : "Confirm"}
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === activeReport.id}
                    onClick={() => setConfirmingDeleteId(null)}
                    className="rounded px-1.5 py-0.5 text-gray-300 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDeleteId(activeReport.id)}
                  disabled={isGenerating || deletingId !== null}
                  title={`Delete v${activeReport.version}`}
                  aria-label={`Delete version ${activeReport.version}`}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-[#141414] px-2 py-1 text-gray-400 transition-colors hover:border-[#7B0323] hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isGenerating && (
        <Card className="bg-[#1E2228] border border-gray-700 p-6 space-y-4 animate-pulse">
          <div className="h-5 w-32 rounded bg-gray-700" />
          <div className="h-6 w-3/4 rounded bg-gray-700" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="h-20 rounded bg-[#141414]" />
            <div className="h-20 rounded bg-[#141414]" />
            <div className="h-20 rounded bg-[#141414]" />
          </div>
          <div className="h-24 rounded bg-[#141414]" />
        </Card>
      )}

      {/* Ready Empty State */}
      {!isGenerating && initialData.readiness.isReady && !activeReport && (
        <Card className="bg-[#1E2228] border border-gray-700 p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#00A896]/15 border border-[#00A896]/30">
            <Sparkles className="h-6 w-6 text-[#00A896]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-[#f4f0e1]">
              Ready for your {monthLabel} reading
            </h3>
            <p className="text-sm text-gray-400">
              Found {initialData.readiness.transactionCount} transactions and{" "}
              {initialData.readiness.sectionCount} net worth accounts. Pick{" "}
              <span className="text-[#f4f0e1]">Coach</span> or{" "}
              <span className="text-[#f4f0e1]">CFO</span> above and run your
              first check-in.
            </p>
          </div>
          <div>
            <Button variant="primary" size="lg" onClick={handleGenerate}>
              Run Health Check (v1)
            </Button>
          </div>
        </Card>
      )}

      {/* Active Report Display */}
      {!isGenerating && activeReport && (
        <ReportView report={activeReport} />
      )}
    </div>
  );
}

function ReportView({ report }: Readonly<{ report: SavedHealthReport }>) {
  const { reportData, metricsSnapshot } = report;
  const statusStyle =
    STATUS_STYLES[reportData.status] ?? STATUS_STYLES.watch;

  const spendVsAvgLabel =
    metricsSnapshot.baselineAverageSpend !== null
      ? `vs. ${formatMoney(metricsSnapshot.baselineAverageSpend)} (${
          metricsSnapshot.baselineMonthsAvailable
        }-mo avg)`
      : "No prior baseline months";

  const spendDeltaBadge =
    metricsSnapshot.spendDeltaPct !== null
      ? `${metricsSnapshot.spendDeltaPct > 0 ? "+" : ""}${Math.round(
          metricsSnapshot.spendDeltaPct
        )}%`
      : null;

  const oneOffsTotal = reportData.notedOneOffs.reduce(
    (sum, item) => sum + (item.amount > 0 ? item.amount : 0),
    0
  );
  const coreSpend = Math.max(
    0,
    Math.round(metricsSnapshot.currentMonthSpend - oneOffsTotal)
  );
  const coreSpendDeltaPct =
    metricsSnapshot.baselineAverageSpend !== null &&
    metricsSnapshot.baselineAverageSpend > 0
      ? Math.round(
          ((coreSpend - metricsSnapshot.baselineAverageSpend) /
            metricsSnapshot.baselineAverageSpend) *
            100
        )
      : null;

  const coreSpendSubtext =
    oneOffsTotal > 0
      ? reportData.notedOneOffs.length === 1
        ? `Excl. ${formatMoney(oneOffsTotal)} ${reportData.notedOneOffs[0].category}`
        : `Excl. ${formatMoney(oneOffsTotal)} in one-offs`
      : "No one-off spikes noted";

  return (
    <div className="space-y-6">
      {/* Headline Verdict */}
      <Card className="bg-[#1E2228] border border-gray-700 overflow-hidden">
        <div
          className={`h-1 w-full bg-gradient-to-r ${statusStyle.barClass}`}
        />
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ${statusStyle.badgeClass}`}
              >
                {statusStyle.label}
              </span>
              <span className="text-xs uppercase tracking-wide text-gray-400">
                v{report.version} ·{" "}
                {report.tone === "CFO" ? "CFO Brief" : "Coach Check-In"}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {report.model}
            </span>
          </div>

          <p className="text-lg md:text-xl font-medium leading-relaxed text-[#f4f0e1]">
            {reportData.headline}
          </p>

          {/* Compact Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-700/80">
            <div className="rounded-lg bg-[#141414] border border-gray-800 p-4 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Month Spending
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold font-mono tabular-nums text-[#f4f0e1]">
                  {formatMoney(metricsSnapshot.currentMonthSpend)}
                </p>
                {spendDeltaBadge && (
                  <span
                    className={`text-xs font-semibold font-mono ${
                      (metricsSnapshot.spendDeltaPct ?? 0) > 5
                        ? "text-rose-300"
                        : "text-[#00A896]"
                    }`}
                  >
                    {spendDeltaBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{spendVsAvgLabel}</p>
            </div>

            <div className="rounded-lg bg-[#141414] border border-gray-800 p-4 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Core Spending
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold font-mono tabular-nums text-[#f4f0e1]">
                  {formatMoney(coreSpend)}
                </p>
                {coreSpendDeltaPct !== null && (
                  <span
                    className={`text-xs font-semibold font-mono ${
                      coreSpendDeltaPct > 5
                        ? "text-rose-300"
                        : "text-[#00A896]"
                    }`}
                  >
                    {coreSpendDeltaPct > 0 ? "+" : ""}
                    {coreSpendDeltaPct}%
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{coreSpendSubtext}</p>
            </div>

            <div className="rounded-lg bg-[#141414] border border-gray-800 p-4 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Total Net Worth
              </p>
              <div className="flex items-baseline gap-2">
                <p
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    metricsSnapshot.totalNetWorth >= 0
                      ? "text-[#00A896]"
                      : "text-rose-300"
                  }`}
                >
                  {formatMoney(metricsSnapshot.totalNetWorth)}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                {metricsSnapshot.netWorthDelta !== null ? (
                  <span
                    className={
                      metricsSnapshot.netWorthDelta >= 0
                        ? "text-[#00A896]"
                        : "text-rose-300"
                    }
                  >
                    {formatSignedMoney(metricsSnapshot.netWorthDelta)} vs. last
                    month
                  </span>
                ) : (
                  "No prior month snapshot"
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending vs. 6 Months */}
      <Card className="bg-[#141414] border border-gray-800">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-[#f4f0e1]">
            Spending vs. 6-Month Baseline
          </h3>
        </CardHeader>
        <CardContent className="pt-1">
          <ul className="space-y-2.5">
            {reportData.spendingVsSixMonths.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-[#f4f0e1]/90"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00A896]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Category Deep Dive: Creeping Up vs. One-Offs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#141414] border border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-300" />
              <h3 className="text-sm font-medium uppercase tracking-wide text-[#f4f0e1]">
                Creeping Up
              </h3>
            </div>
          </CardHeader>
          <CardContent className="pt-1 space-y-3">
            {reportData.creepingCategories.length === 0 ? (
              <p className="text-sm text-gray-400">
                No multi-month upward category creep flagged this month.
              </p>
            ) : (
              reportData.creepingCategories.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#7B0323]/60 bg-[#1E2228] p-3.5 space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-[#f4f0e1]">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono whitespace-nowrap text-rose-200 bg-[#7B0323]/30 px-2 py-0.5 rounded">
                      {item.trend.trim()}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-300">
                    {item.note}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border border-gray-800">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium uppercase tracking-wide text-[#f4f0e1]">
              Noted One-Off Spikes
            </h3>
          </CardHeader>
          <CardContent className="pt-1 space-y-3">
            {reportData.notedOneOffs.length === 0 ? (
              <p className="text-sm text-gray-400">
                No notable one-off spikes stood out this month.
              </p>
            ) : (
              reportData.notedOneOffs.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-700 bg-[#1E2228] p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-[#f4f0e1]">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono text-[#00A896]">
                      {formatMoney(item.amount)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-300">
                    {item.note}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Net Worth Movement */}
      <Card className="bg-[#141414] border border-gray-800">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-[#f4f0e1]">
            Net Worth Movement
          </h3>
        </CardHeader>
        <CardContent className="pt-1">
          <p className="text-sm leading-relaxed text-[#f4f0e1]/90">
            {reportData.netWorthSynthesis}
          </p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-[#1E2228] border border-gray-700">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-[#f4f0e1]">
            Next Month&apos;s Focus
          </h3>
        </CardHeader>
        <CardContent className="pt-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportData.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-700 bg-[#141414] p-4 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#00A896]/20 text-xs font-bold text-[#00A896]">
                  {idx + 1}
                </span>
                <h4 className="font-semibold text-sm text-[#f4f0e1]">
                  {rec.title}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-gray-300">
                {rec.detail}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
