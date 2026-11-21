"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  PieChart as PieChartIcon,
  ArrowRight,
  Check,
  FileSpreadsheet,
  SlidersHorizontal,
} from "lucide-react";

type DemoTab = "jev" | "ledger" | "spending";

interface PipelineItem {
  id: string;
  merchant: string;
  bankCategory: string;
  amount: number;
  mappedCategory: string;
  confidence: number;
  color: string;
  ruleMatched?: string;
}

const PIPELINE_ITEMS: PipelineItem[] = [
  {
    id: "costco",
    merchant: "COSTCO WHSE #0418",
    bankCategory: "Merchandise",
    amount: 184.2,
    mappedCategory: "Groceries",
    confidence: 99,
    color: "#98FB98",
    ruleMatched: 'Note: "Costco always goes here"',
  },
  {
    id: "delta",
    merchant: "DELTA AIR LINES 0062",
    bankCategory: "Travel",
    amount: 412.0,
    mappedCategory: "Vacation",
    confidence: 98,
    color: "#A2CFFE",
    ruleMatched: 'Note: "Flights & hotels"',
  },
  {
    id: "uber",
    merchant: "UBER *TRIP HELP.UBER",
    bankCategory: "Services",
    amount: 28.4,
    mappedCategory: "Transportation",
    confidence: 97,
    color: "#F3E5AB",
    ruleMatched: 'Note: "Gas, tolls, Ubers"',
  },
  {
    id: "coned",
    merchant: "CON EDISON OF NY",
    bankCategory: "Gas & Electric",
    amount: 142.8,
    mappedCategory: "Utilities",
    confidence: 96,
    color: "#B0C4DE",
  },
  {
    id: "tj",
    merchant: "TRADER JOE'S #084",
    bankCategory: "Supermarkets",
    amount: 96.15,
    mappedCategory: "Groceries",
    confidence: 99,
    color: "#98FB98",
  },
];

interface MonthSnapshot {
  key: string;
  label: string;
  netWorth: number;
  delta: number;
  assets: { section: string; items: { label: string; value: number }[] }[];
  debts: { section: string; items: { label: string; value: number }[] }[];
  series: number[];
  months: string[];
}

const MONTH_SNAPSHOTS: MonthSnapshot[] = [
  {
    key: "sep",
    label: "Sep 2026",
    netWorth: 142850,
    delta: 3420,
    assets: [
      {
        section: "Cash & HYSA",
        items: [
          { label: "Chase Checking", value: 8450 },
          { label: "Ally High-Yield", value: 26200 },
        ],
      },
      {
        section: "Investments",
        items: [
          { label: "Vanguard 401(k)", value: 84600 },
          { label: "Roth IRA", value: 38200 },
        ],
      },
    ],
    debts: [
      {
        section: "Liabilities",
        items: [
          { label: "Sapphire Reserve", value: 2400 },
          { label: "Auto Loan", value: 12200 },
        ],
      },
    ],
    series: [128400, 131900, 135200, 139430, 142850],
    months: ["May", "Jun", "Jul", "Aug", "Sep"],
  },
  {
    key: "oct",
    label: "Oct 2026",
    netWorth: 148420,
    delta: 5570,
    assets: [
      {
        section: "Cash & HYSA",
        items: [
          { label: "Chase Checking", value: 9120 },
          { label: "Ally High-Yield", value: 27900 },
        ],
      },
      {
        section: "Investments",
        items: [
          { label: "Vanguard 401(k)", value: 86800 },
          { label: "Roth IRA", value: 38600 },
        ],
      },
    ],
    debts: [
      {
        section: "Liabilities",
        items: [
          { label: "Sapphire Reserve", value: 2150 },
          { label: "Auto Loan", value: 11850 },
        ],
      },
    ],
    series: [131900, 135200, 139430, 142850, 148420],
    months: ["Jun", "Jul", "Aug", "Sep", "Oct"],
  },
  {
    key: "nov",
    label: "Nov 2026",
    netWorth: 156190,
    delta: 7770,
    assets: [
      {
        section: "Cash & HYSA",
        items: [
          { label: "Chase Checking", value: 10240 },
          { label: "Ally High-Yield", value: 29450 },
        ],
      },
      {
        section: "Investments",
        items: [
          { label: "Vanguard 401(k)", value: 90100 },
          { label: "Roth IRA", value: 39800 },
        ],
      },
    ],
    debts: [
      {
        section: "Liabilities",
        items: [
          { label: "Sapphire Reserve", value: 1900 },
          { label: "Auto Loan", value: 11500 },
        ],
      },
    ],
    series: [135200, 139430, 142850, 148420, 156190],
    months: ["Jul", "Aug", "Sep", "Oct", "Nov"],
  },
];

const SPENDING_SLICES = [
  { name: "Groceries", amount: 642.35, color: "#98FB98", txCount: 11 },
  { name: "Vacation", amount: 528.0, color: "#A2CFFE", txCount: 3 },
  { name: "Dining Out", amount: 384.6, color: "#D98880", txCount: 14 },
  { name: "Transportation", amount: 268.4, color: "#F3E5AB", txCount: 9 },
  { name: "Utilities", amount: 214.8, color: "#B0C4DE", txCount: 4 },
];

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const CURRENCY_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function HeroProductDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>("jev");
  const [isPaused, setIsPaused] = useState(false);
  const [activePipelineIdx, setActivePipelineIdx] = useState(0);
  const [monthIdx, setMonthIdx] = useState(2);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Continuously step through active merchant row in the Jev AI pipeline
  useEffect(() => {
    if (activeTab !== "jev") return;
    const id = setInterval(() => {
      setActivePipelineIdx((prev) => (prev + 1) % PIPELINE_ITEMS.length);
    }, 2200);
    return () => clearInterval(id);
  }, [activeTab]);

  // Gently auto-cycle top-level tabs unless user has interacted
  useEffect(() => {
    if (isPaused) return;
    const tabs: DemoTab[] = ["jev", "ledger", "spending"];
    const id = setInterval(() => {
      setActiveTab((prev) => tabs[(tabs.indexOf(prev) + 1) % tabs.length]);
    }, 9500);
    return () => clearInterval(id);
  }, [isPaused]);

  const handleSelectTab = (tab: DemoTab) => {
    setIsPaused(true);
    setActiveTab(tab);
  };

  const activeItem = PIPELINE_ITEMS[activePipelineIdx];
  const snapshot = MONTH_SNAPSHOTS[monthIdx];

  const totalAssets = snapshot.assets.reduce(
    (sum, s) => sum + s.items.reduce((a, i) => a + i.value, 0),
    0
  );
  const totalDebts = snapshot.debts.reduce(
    (sum, s) => sum + s.items.reduce((a, i) => a + i.value, 0),
    0
  );

  // Build SVG path for Net Worth sparkline
  const chartW = 320;
  const chartH = 120;
  const minVal = Math.min(...snapshot.series) - 3000;
  const maxVal = Math.max(...snapshot.series) + 3000;
  const points = snapshot.series.map((val, i) => {
    const x = (i / (snapshot.series.length - 1)) * (chartW - 24) + 12;
    const y = chartH - 16 - ((val - minVal) / (maxVal - minVal)) * (chartH - 32);
    return { x, y, val };
  });
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${chartH} L ${points[0].x.toFixed(1)} ${chartH} Z`;

  // Donut calculations
  const totalSpend = SPENDING_SLICES.reduce((sum, s) => sum + s.amount, 0);
  const donutRadius = 62;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulativePercent = 0;
  const focusedSlice =
    SPENDING_SLICES.find((s) => s.name === hoveredSlice) ?? null;

  return (
    <div
      className="relative mx-auto max-w-6xl animate-landing-fade-up"
      onMouseEnter={() => setIsPaused(true)}
    >
      {/* Subtle architectural outer glow */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-[#f4f0e1]/15 via-[#f4f0e1]/[0.05] to-transparent" />

      <div className="relative overflow-hidden rounded-2xl border border-[#f4f0e1]/[0.1] bg-[#16181C] shadow-[0_32px_90px_-24px_rgba(0,0,0,0.85)]">
        {/* Window Top Chrome + Interactive Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f4f0e1]/[0.08] bg-[#141414] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f4f0e1]/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f4f0e1]/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f4f0e1]/15" />
            </div>
            <div className="hidden h-4 w-px bg-[#f4f0e1]/10 sm:block" />
            <span className="hidden font-mono text-[11px] tracking-tight text-[#f4f0e1]/45 sm:inline">
              betterexcelfinances.app /{" "}
              <span className="text-[#f4f0e1]/80">
                {activeTab === "jev"
                  ? "upload"
                  : activeTab === "ledger"
                  ? "dashboard"
                  : "spending"}
              </span>
            </span>
          </div>

          {/* Interactive View Switcher */}
          <div
            role="tablist"
            aria-label="Product preview modes"
            className="flex items-center gap-1 rounded-lg border border-[#f4f0e1]/[0.08] bg-[#1E2228]/70 p-1"
          >
            {(
              [
                { id: "jev", label: "AI Categorizer", icon: Sparkles },
                { id: "ledger", label: "Net Worth Ledger", icon: TrendingUp },
                { id: "spending", label: "Spending Mix", icon: PieChartIcon },
              ] as const
            ).map(({ id, label, icon: Icon }) => {
              const selected = activeTab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => handleSelectTab(id)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] ${
                    selected
                      ? "bg-[#f4f0e1] text-[#141414] shadow-sm"
                      : "text-[#f4f0e1]/65 hover:text-[#f4f0e1]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Content Area */}
        <div className="min-h-[410px] p-5 sm:p-7">
          {/* TAB 1: AI MERCHANT PIPELINE */}
          {activeTab === "jev" && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_232px_minmax(0,1fr)] lg:items-center">
              {/* Left: Raw CSV Rows */}
              <div className="min-w-0 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#f4f0e1]/50">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-[#00A896]" />
                    <span>statement_nov_2026.csv</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#f4f0e1]/40">
                    5 unique merchants
                  </span>
                </div>

                <div className="divide-y divide-[#f4f0e1]/[0.06] overflow-hidden rounded-xl border border-[#f4f0e1]/[0.08] bg-[#141414]">
                  {PIPELINE_ITEMS.map((item, idx) => {
                    const isActive = idx === activePipelineIdx;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setIsPaused(true);
                          setActivePipelineIdx(idx);
                        }}
                        className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-all duration-300 ${
                          isActive
                            ? "bg-[#1E2228] shadow-[inset_2px_0_0_#00A896]"
                            : "hover:bg-[#1E2228]/50"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`truncate font-mono text-xs font-medium ${
                                isActive ? "text-[#f4f0e1]" : "text-[#f4f0e1]/75"
                              }`}
                            >
                              {item.merchant}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#f4f0e1]/40">
                            <span>Bank label: {item.bankCategory}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="font-mono text-xs tabular-nums text-[#f4f0e1]/75">
                            {CURRENCY_CENTS.format(item.amount)}
                          </span>
                          <span
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                              isActive
                                ? "bg-[#00A896] shadow-[0_0_8px_#00A896]"
                                : "bg-[#f4f0e1]/15"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center: Animated AI Decision Connector */}
              <div className="flex flex-col items-center justify-center gap-3 py-2">
                <div className="hidden lg:block">
                  <svg
                    width="96"
                    height="24"
                    viewBox="0 0 96 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 12 H92"
                      stroke="rgba(244,240,225,0.14)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M4 12 H92"
                      stroke="#00A896"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                      className="animate-landing-dash"
                    />
                    <circle cx="90" cy="12" r="3" fill="#00A896" />
                  </svg>
                </div>

                <div className="w-full max-w-[232px] rounded-xl border border-[#00A896]/35 bg-[#141414] p-3.5 shadow-[0_0_32px_-12px_rgba(0,168,150,0.45)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#00A896] animate-landing-pulse-ring" />
                      <span className="text-[11px] font-semibold tracking-wide text-[#f4f0e1]">
                        AI ENGINE
                      </span>
                    </div>
                    <span className="rounded bg-[#00A896]/15 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-[#00A896]">
                      {activeItem.confidence}% conf
                    </span>
                  </div>
                  <p className="mt-2 truncate font-mono text-[10px] leading-relaxed text-[#f4f0e1]/55">
                    classify(&quot;{activeItem.merchant.slice(0, 15)}…&quot;)
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 rounded-md border border-[#f4f0e1]/[0.08] bg-[#1E2228] px-2 py-1.5 text-[11px] text-[#f4f0e1]/85">
                    <SlidersHorizontal className="h-3 w-3 shrink-0 text-[#00A896]" />
                    <span className="truncate">
                      {activeItem.ruleMatched ?? "Default semantic criteria"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Classified Budget Output */}
              <div className="min-w-0 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#f4f0e1]/50">
                    Your Budget Categories
                  </span>
                  <span className="font-mono text-[11px] text-[#00A896]">
                    Auto-mapped
                  </span>
                </div>

                {/* Active decision highlight card */}
                <div className="rounded-xl border border-[#f4f0e1]/[0.1] bg-[#141414] p-4">
                  <div className="flex items-center justify-between text-[11px] text-[#f4f0e1]/45">
                    <span>Routing decision</span>
                    <span className="font-mono">Merchant Classifier</span>
                  </div>

                  <div className="mt-3 flex flex-nowrap items-center gap-2 text-xs">
                    <span className="min-w-0 truncate rounded-md border border-[#f4f0e1]/10 bg-[#1E2228] px-2.5 py-1 font-mono text-[#f4f0e1]/80">
                      {activeItem.merchant}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#00A896]" />
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold text-[#141414] transition-colors duration-300"
                      style={{ backgroundColor: activeItem.color }}
                    >
                      <Check className="h-3 w-3 shrink-0" />
                      {activeItem.mappedCategory}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-[#f4f0e1]/[0.06] pt-3.5">
                    {["Groceries", "Vacation", "Transportation", "Utilities"].map(
                      (cat) => {
                        const catItems = PIPELINE_ITEMS.filter(
                          (p) => p.mappedCategory === cat
                        );
                        const catTotal = catItems.reduce(
                          (s, p) => s + p.amount,
                          0
                        );
                        const isTarget = activeItem.mappedCategory === cat;
                        const dotColor = catItems[0]?.color ?? "#D3D3D3";

                        return (
                          <div
                            key={cat}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all duration-300 ${
                              isTarget
                                ? "bg-[#1E2228] ring-1 ring-[#00A896]/40"
                                : "bg-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: dotColor }}
                              />
                              <span
                                className={
                                  isTarget
                                    ? "font-medium text-[#f4f0e1]"
                                    : "text-[#f4f0e1]/65"
                                }
                              >
                                {cat}
                              </span>
                              <span className="font-mono text-[10px] text-[#f4f0e1]/35">
                                {catItems.length} tx
                              </span>
                            </div>
                            <span className="font-mono tabular-nums text-[#f4f0e1]/85">
                              {CURRENCY_CENTS.format(catTotal)}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NET WORTH LEDGER */}
          {activeTab === "ledger" && (
            <div className="space-y-5">
              {/* Top Metric Bar + Month Selector */}
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#f4f0e1]/[0.08] pb-4">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#f4f0e1]/45">
                    Net Worth · {snapshot.label}
                  </span>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-3xl font-bold tracking-tight tabular-nums text-[#f4f0e1] sm:text-4xl">
                      {CURRENCY.format(snapshot.netWorth)}
                    </span>
                    <span className="rounded-md bg-[#00A896]/15 px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-[#00A896]">
                      +{CURRENCY.format(snapshot.delta)} MoM
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-[#f4f0e1]/[0.08] bg-[#141414] p-1">
                  {MONTH_SNAPSHOTS.map((m, idx) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => {
                        setIsPaused(true);
                        setMonthIdx(idx);
                      }}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        monthIdx === idx
                          ? "bg-[#1E2228] text-[#f4f0e1] ring-1 ring-[#f4f0e1]/15"
                          : "text-[#f4f0e1]/50 hover:text-[#f4f0e1]/80"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                {/* Asset & Debt Sections */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {snapshot.assets.map((sec) => (
                    <div
                      key={sec.section}
                      className="rounded-xl border border-[#f4f0e1]/[0.08] bg-[#141414] p-3.5"
                    >
                      <div className="flex items-center justify-between border-b border-[#f4f0e1]/[0.06] pb-2">
                        <span className="text-xs font-semibold text-[#f4f0e1]">
                          {sec.section}
                        </span>
                        <span className="h-2 w-2 rounded-full bg-[#00A896]" />
                      </div>
                      <div className="mt-2.5 space-y-2">
                        {sec.items.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="truncate text-[#f4f0e1]/60">
                              {item.label}
                            </span>
                            <span className="font-mono tabular-nums text-[#f4f0e1]">
                              {CURRENCY.format(item.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {snapshot.debts.map((sec) => (
                    <div
                      key={sec.section}
                      className="rounded-xl border border-[#7B0323]/40 bg-[#141414] p-3.5"
                    >
                      <div className="flex items-center justify-between border-b border-[#f4f0e1]/[0.06] pb-2">
                        <span className="text-xs font-semibold text-[#f4f0e1]">
                          {sec.section}
                        </span>
                        <span className="h-2 w-2 rounded-full bg-[#7B0323]" />
                      </div>
                      <div className="mt-2.5 space-y-2">
                        {sec.items.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="truncate text-[#f4f0e1]/60">
                              {item.label}
                            </span>
                            <span className="font-mono tabular-nums text-[#E06C84]">
                              -{CURRENCY.format(item.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live SVG Trajectory Chart */}
                <div className="flex flex-col justify-between rounded-xl border border-[#f4f0e1]/[0.08] bg-[#141414] p-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="uppercase tracking-wider text-[#f4f0e1]/45">
                      5-Month Trajectory
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-[#00A896]">
                        A: {CURRENCY.format(totalAssets)}
                      </span>
                      <span className="text-[#E06C84]">
                        D: {CURRENCY.format(totalDebts)}
                      </span>
                    </div>
                  </div>

                  <svg
                    viewBox={`0 0 ${chartW} ${chartH}`}
                    className="mt-3 h-32 w-full overflow-visible"
                    role="img"
                    aria-label="Net worth trajectory chart"
                  >
                    <defs>
                      <linearGradient id="nwAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00A896" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#00A896" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#nwAreaGrad)" />
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#00A896"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r={idx === points.length - 1 ? 4.5 : 3}
                        fill={idx === points.length - 1 ? "#f4f0e1" : "#141414"}
                        stroke="#00A896"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>

                  <div className="mt-1 flex items-center justify-between border-t border-[#f4f0e1]/[0.06] px-1 pt-2 font-mono text-[10px]">
                    {snapshot.months.map((m, idx) => (
                      <span
                        key={m}
                        className={
                          idx === snapshot.months.length - 1
                            ? "font-semibold text-[#f4f0e1]"
                            : "text-[#f4f0e1]/40"
                        }
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPENDING BREAKDOWN */}
          {activeTab === "spending" && (
            <div className="grid gap-6 md:grid-cols-[240px_1fr] md:items-center">
              {/* Interactive Donut */}
              <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
                <svg
                  viewBox="0 0 160 160"
                  className="h-full w-full -rotate-90"
                  role="img"
                  aria-label="Monthly spending by category"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r={donutRadius}
                    fill="none"
                    stroke="rgba(244,240,225,0.06)"
                    strokeWidth="16"
                  />
                  {SPENDING_SLICES.map((slice) => {
                    const fraction = slice.amount / totalSpend;
                    const dashLength = fraction * donutCircumference;
                    const dashOffset = -cumulativePercent * donutCircumference;
                    cumulativePercent += fraction;
                    const isFocused = hoveredSlice === slice.name;
                    const isDimmed = hoveredSlice !== null && !isFocused;

                    return (
                      <circle
                        key={slice.name}
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={isFocused ? 19 : 16}
                        strokeDasharray={`${dashLength - 2} ${donutCircumference}`}
                        strokeDashoffset={dashOffset}
                        className="cursor-pointer transition-all duration-300"
                        style={{ opacity: isDimmed ? 0.3 : 1 }}
                        onMouseEnter={() => setHoveredSlice(slice.name)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })}
                </svg>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#f4f0e1]/45">
                    {focusedSlice ? focusedSlice.name : "Nov Spend"}
                  </span>
                  <span className="mt-0.5 font-mono text-lg font-bold tabular-nums text-[#f4f0e1]">
                    {CURRENCY_CENTS.format(
                      focusedSlice ? focusedSlice.amount : totalSpend
                    )}
                  </span>
                  {focusedSlice && (
                    <span className="font-mono text-[11px] text-[#00A896]">
                      {Math.round((focusedSlice.amount / totalSpend) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Category Table */}
              <div className="overflow-hidden rounded-xl border border-[#f4f0e1]/[0.08] bg-[#141414]">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-[#f4f0e1]/[0.06] px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-[#f4f0e1]/45">
                  <span>Category</span>
                  <span className="text-right">Share</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="divide-y divide-[#f4f0e1]/[0.06]">
                  {SPENDING_SLICES.map((slice) => {
                    const pct = Math.round((slice.amount / totalSpend) * 100);
                    const isFocused = hoveredSlice === slice.name;
                    return (
                      <div
                        key={slice.name}
                        onMouseEnter={() => setHoveredSlice(slice.name)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        className={`grid cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 text-sm transition-colors ${
                          isFocused ? "bg-[#1E2228]" : "hover:bg-[#1E2228]/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2.5 w-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: slice.color }}
                          />
                          <span className="font-medium text-[#f4f0e1]">
                            {slice.name}
                          </span>
                          <span className="font-mono text-[11px] text-[#f4f0e1]/35">
                            {slice.txCount} items
                          </span>
                        </div>
                        <span className="font-mono text-xs tabular-nums text-[#f4f0e1]/55">
                          {pct}%
                        </span>
                        <span className="font-mono text-xs font-medium tabular-nums text-[#f4f0e1]">
                          {CURRENCY_CENTS.format(slice.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
