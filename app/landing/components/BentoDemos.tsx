"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// ---------------------------------------------------------------------------
// 1. Interactive Jev AI Personal Rules Sandbox
// ---------------------------------------------------------------------------
export function RulesSandboxCard() {
  const [costcoRule, setCostcoRule] = useState(true);
  const [flightRule, setFlightRule] = useState(true);

  const rows = [
    {
      merchant: "COSTCO WHSE #0418",
      bankCat: "Merchandise",
      amount: "$184.20",
      category: costcoRule ? "Groceries" : "Shopping",
      color: costcoRule ? "#98FB98" : "#D3D3D3",
      changed: costcoRule,
    },
    {
      merchant: "DELTA AIR LINES",
      bankCat: "Travel",
      amount: "$412.00",
      category: flightRule ? "Vacation" : "Travel",
      color: flightRule ? "#A2CFFE" : "#B0C4DE",
      changed: flightRule,
    },
    {
      merchant: "UBER *TRIP",
      bankCat: "Services",
      amount: "$28.40",
      category: "Transportation",
      color: "#F3E5AB",
      changed: false,
    },
    {
      merchant: "AMAZON MKTP US",
      bankCat: "Merchandise",
      amount: "$64.90",
      category: "Shopping",
      color: "#D3D3D3",
      changed: false,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between p-6 sm:p-8">
      <div>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#00A896]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Merchant-Level AI</span>
        </div>
        <h3 className="mt-2.5 text-xl font-semibold tracking-tight text-[#f4f0e1]">
          Your rules, applied per merchant — not per bank bucket.
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#f4f0e1]/60">
          Banks lump Costco and Amazon under the same &ldquo;Merchandise&rdquo; label.
          Add plain-English notes to any category and AI routes each merchant
          individually. Toggle a note below to test it.
        </p>
      </div>

      {/* Interactive Note Toggles */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCostcoRule((v) => !v)}
            aria-pressed={costcoRule}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] ${
              costcoRule
                ? "border-[#00A896]/50 bg-[#00A896]/15 text-[#f4f0e1]"
                : "border-[#f4f0e1]/10 bg-[#1E2228] text-[#f4f0e1]/55 hover:border-[#f4f0e1]/25"
            }`}
          >
            <span
              className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border transition-colors ${
                costcoRule
                  ? "border-[#00A896] bg-[#00A896] text-[#141414]"
                  : "border-[#f4f0e1]/30"
              }`}
            >
              {costcoRule && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            </span>
            <SlidersHorizontal className="h-3 w-3 text-[#00A896]" />
            <span>Groceries note: &ldquo;Costco always goes here&rdquo;</span>
          </button>

          <button
            type="button"
            onClick={() => setFlightRule((v) => !v)}
            aria-pressed={flightRule}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] ${
              flightRule
                ? "border-[#00A896]/50 bg-[#00A896]/15 text-[#f4f0e1]"
                : "border-[#f4f0e1]/10 bg-[#1E2228] text-[#f4f0e1]/55 hover:border-[#f4f0e1]/25"
            }`}
          >
            <span
              className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border transition-colors ${
                flightRule
                  ? "border-[#00A896] bg-[#00A896] text-[#141414]"
                  : "border-[#f4f0e1]/30"
              }`}
            >
              {flightRule && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            </span>
            <SlidersHorizontal className="h-3 w-3 text-[#00A896]" />
            <span>Vacation note: &ldquo;Flights &amp; airlines&rdquo;</span>
          </button>
        </div>

        {/* Live Re-routing Table */}
        <div className="divide-y divide-[#f4f0e1]/[0.06] overflow-hidden rounded-xl border border-[#f4f0e1]/[0.08] bg-[#141414]">
          {rows.map((row) => (
            <div
              key={row.merchant}
              className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2.5 sm:grid-cols-[1.2fr_0.75fr_auto]"
            >
              <div className="min-w-0">
                <div className="truncate font-mono text-xs font-medium text-[#f4f0e1]">
                  {row.merchant}
                </div>
                <div className="text-[11px] text-[#f4f0e1]/40">
                  CSV: {row.bankCat}
                </div>
              </div>

              <span className="hidden font-mono text-xs tabular-nums text-[#f4f0e1]/60 sm:block">
                {row.amount}
              </span>

              <div className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-[#f4f0e1]/25" />
                <span
                  className="inline-flex min-w-[108px] items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-[#141414] transition-all duration-300"
                  style={{ backgroundColor: row.color }}
                >
                  {row.changed && <Check className="h-3 w-3 shrink-0" />}
                  {row.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. One-Click Month Rollover Card
// ---------------------------------------------------------------------------
export function MonthRolloverCard() {
  const [imported, setImported] = useState(true);
  const [animating, setAnimating] = useState(false);

  const accounts = [
    { name: "Chase Checking", value: "$9,120", type: "asset" as const },
    { name: "Vanguard 401(k)", value: "$86,800", type: "asset" as const },
    { name: "Sapphire Reserve", value: "-$2,150", type: "debt" as const },
  ];

  const triggerRollover = () => {
    setImported(false);
    setAnimating(true);
    setTimeout(() => {
      setImported(true);
      setAnimating(false);
    }, 520);
  };

  return (
    <div className="flex h-full flex-col justify-between p-6 sm:p-8">
      <div>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#f4f0e1]/50">
          <Copy className="h-3.5 w-3.5 text-[#00A896]" />
          <span>Monthly Cadence</span>
        </div>
        <h3 className="mt-2.5 text-xl font-semibold tracking-tight text-[#f4f0e1]">
          Roll forward in one click.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#f4f0e1]/60">
          Never rebuild your account list from scratch. Copy last month&apos;s
          assets and debts forward, then update only the balances that changed.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-[#f4f0e1]/[0.08] bg-[#141414] px-3 py-2">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#f4f0e1]/70">
            <span>Oct 2026</span>
            <ArrowRight className="h-3 w-3 text-[#00A896]" />
            <span className="font-semibold text-[#f4f0e1]">Nov 2026</span>
          </div>

          <button
            type="button"
            onClick={triggerRollover}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#f4f0e1] px-2.5 py-1 text-[11px] font-semibold text-[#141414] transition-all hover:shadow-[0_0_16px_rgba(244,240,225,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1]"
          >
            <RefreshCw
              className={`h-3 w-3 ${animating ? "animate-spin" : ""}`}
            />
            <span>Replay Import</span>
          </button>
        </div>

        <div className="space-y-2">
          {accounts.map((acct, i) => (
            <div
              key={acct.name}
              style={{ transitionDelay: `${i * 70}ms` }}
              className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-xs transition-all duration-300 ${
                imported
                  ? "translate-x-0 border-[#f4f0e1]/[0.08] bg-[#141414] opacity-100"
                  : "-translate-x-3 border-[#f4f0e1]/[0.04] bg-[#141414]/40 opacity-30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    acct.type === "asset" ? "bg-[#00A896]" : "bg-[#7B0323]"
                  }`}
                />
                <span className="font-medium text-[#f4f0e1]">{acct.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`font-mono tabular-nums ${
                    acct.type === "asset"
                      ? "text-[#f4f0e1]/85"
                      : "text-[#E06C84]"
                  }`}
                >
                  {acct.value}
                </span>
                <span className="rounded bg-[#00A896]/15 px-1.5 py-0.5 font-mono text-[10px] text-[#00A896]">
                  {imported ? "synced" : "…"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Multi-Bank CSV Normalization Card
// ---------------------------------------------------------------------------
const STATEMENT_FORMATS = [
  {
    id: "negative",
    label: "Negative Sales",
    headers: "Post Date, Description, Category, Memo, Amount",
    rawRow: "11/14/2026, TRADER JOE'S #084, Groceries, , -96.15",
    normalizedDate: "2026-11-14 UTC",
    normalizedAmount: "+$96.15",
    note: "Inverts negative Memo sales",
  },
  {
    id: "debit-credit",
    label: "Debit / Credit",
    headers: "Posted Date, Description, Category, Debit, Credit",
    rawRow: "2026-11-12, UBER *TRIP, Other Travel, 28.40, ",
    normalizedDate: "2026-11-12 UTC",
    normalizedAmount: "+$28.40",
    note: "Detects Debit / Credit split",
  },
  {
    id: "standard",
    label: "Standard Amount",
    headers: "Trans. Date, Description, Amount, Category",
    rawRow: "11/09/2026, COSTCO WHSE #0418, 184.20, Merchandise",
    normalizedDate: "2026-11-09 UTC",
    normalizedAmount: "+$184.20",
    note: "Standard positive spending",
  },
];

export function CsvNormalizationCard() {
  const [formatIdx, setFormatIdx] = useState(0);
  const [userClicked, setUserClicked] = useState(false);

  useEffect(() => {
    if (userClicked) return;
    const id = setInterval(() => {
      setFormatIdx((prev) => (prev + 1) % STATEMENT_FORMATS.length);
    }, 3400);
    return () => clearInterval(id);
  }, [userClicked]);

  const current = STATEMENT_FORMATS[formatIdx];

  return (
    <div className="flex h-full flex-col justify-between p-6 sm:p-8">
      <div>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#f4f0e1]/50">
          <FileSpreadsheet className="h-3.5 w-3.5 text-[#00A896]" />
          <span>Zero-Config Parsing</span>
        </div>
        <h3 className="mt-2.5 text-xl font-semibold tracking-tight text-[#f4f0e1]">
          Drop any credit card statement CSV.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#f4f0e1]/60">
          Automatically detects credit card statement column schemas, normalizes
          dates to UTC, and safely skips duplicate rows on re-upload.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {/* Format Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {STATEMENT_FORMATS.map((fmt, idx) => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => {
                setUserClicked(true);
                setFormatIdx(idx);
              }}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                formatIdx === idx
                  ? "bg-[#f4f0e1] text-[#141414]"
                  : "border border-[#f4f0e1]/[0.08] bg-[#141414] text-[#f4f0e1]/60 hover:text-[#f4f0e1]"
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>

        {/* Raw CSV Preview */}
        <div className="rounded-xl border border-[#f4f0e1]/[0.08] bg-[#141414] p-3.5 font-mono text-[11px]">
          <div className="truncate text-[#f4f0e1]/35">{current.headers}</div>
          <div className="mt-1.5 truncate text-[#f4f0e1]/85">{current.rawRow}</div>

          <div className="mt-3 flex items-center justify-between border-t border-[#f4f0e1]/[0.06] pt-2.5 text-[11px]">
            <span className="text-[#00A896]">{current.note}</span>
            <span className="inline-flex items-center gap-1 text-[#f4f0e1]/55">
              <ShieldCheck className="h-3 w-3 text-[#00A896]" />
              deduped
            </span>
          </div>
        </div>

        {/* Normalized Output Pill */}
        <div className="flex items-center justify-between rounded-lg border border-[#00A896]/25 bg-[#00A896]/[0.07] px-3.5 py-2 font-mono text-xs">
          <span className="text-[#f4f0e1]/75">{current.normalizedDate}</span>
          <span className="font-semibold tabular-nums text-[#00A896]">
            {current.normalizedAmount}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Interactive Net Worth Assets vs. Debts Scrub Chart
// ---------------------------------------------------------------------------
const TRAJECTORY = [
  { month: "Jun", assets: 144200, debts: 17100 },
  { month: "Jul", assets: 147800, debts: 16400 },
  { month: "Aug", assets: 151500, debts: 15800 },
  { month: "Sep", assets: 157450, debts: 14600 },
  { month: "Oct", assets: 162420, debts: 14000 },
  { month: "Nov", assets: 169590, debts: 13400 },
];

export function NetWorthTrajectoryCard() {
  const [selectedIdx, setSelectedIdx] = useState(TRAJECTORY.length - 1);
  const active = TRAJECTORY[selectedIdx];
  const activeNetWorth = active.assets - active.debts;

  const w = 480;
  const h = 156;
  const padX = 22;
  const padY = 18;
  const netValues = TRAJECTORY.map((d) => d.assets - d.debts);
  const minNW = Math.min(...netValues) - 4000;
  const maxNW = Math.max(...netValues) + 4000;

  const coords = TRAJECTORY.map((d, i) => {
    const nw = d.assets - d.debts;
    const x = padX + (i / (TRAJECTORY.length - 1)) * (w - padX * 2);
    const y = h - padY - ((nw - minNW) / (maxNW - minNW)) * (h - padY * 2);
    return { x, y, nw, ...d };
  });

  const pathD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${h - padY} L ${coords[0].x.toFixed(1)} ${h - padY} Z`;

  return (
    <div className="flex h-full flex-col justify-between p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#f4f0e1]/50">
            <span className="h-2 w-2 rounded-full bg-[#00A896]" />
            <span>Assets vs. Debts</span>
          </div>
          <h3 className="mt-2.5 text-xl font-semibold tracking-tight text-[#f4f0e1]">
            Watch your net worth compound.
          </h3>
        </div>

        {/* Live Readout for Selected Month */}
        <div className="rounded-xl border border-[#f4f0e1]/[0.08] bg-[#141414] px-3.5 py-2 text-right">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#f4f0e1]/45">
            {active.month} 2026 Net Worth
          </div>
          <div className="font-mono text-lg font-bold tabular-nums text-[#f4f0e1]">
            {USD.format(activeNetWorth)}
          </div>
        </div>
      </div>

      {/* Interactive SVG Curve */}
      <div className="mt-5 rounded-xl border border-[#f4f0e1]/[0.08] bg-[#141414] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1.5 text-[#00A896]">
              <span className="h-2 w-2 rounded-full bg-[#00A896]" />
              Assets {USD.format(active.assets)}
            </span>
            <span className="flex items-center gap-1.5 text-[#E06C84]">
              <span className="h-2 w-2 rounded-full bg-[#7B0323]" />
              Debts {USD.format(active.debts)}
            </span>
          </div>
          <span className="text-[11px] text-[#f4f0e1]/40">
            Hover or click a month
          </span>
        </div>

        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-36 w-full overflow-visible"
          role="img"
          aria-label="Interactive 6 month net worth curve"
        >
          <defs>
            <linearGradient id="bentoNwFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00A896" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#00A896" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal guidelines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padX}
              x2={w - padX}
              y1={padY + ratio * (h - padY * 2)}
              y2={padY + ratio * (h - padY * 2)}
              stroke="rgba(244,240,225,0.05)"
              strokeDasharray="3 4"
            />
          ))}

          {/* Active vertical crosshair */}
          <line
            x1={coords[selectedIdx].x}
            x2={coords[selectedIdx].x}
            y1={padY}
            y2={h - padY}
            stroke="rgba(244,240,225,0.18)"
            strokeDasharray="3 3"
          />

          <path d={areaD} fill="url(#bentoNwFill)" />
          <path
            d={pathD}
            fill="none"
            stroke="#00A896"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coords.map((pt, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <g
                key={pt.month}
                className="cursor-pointer"
                onMouseEnter={() => setSelectedIdx(idx)}
                onClick={() => setSelectedIdx(idx)}
              >
                {/* Larger invisible hit area */}
                <rect
                  x={pt.x - 28}
                  y={0}
                  width={56}
                  height={h}
                  fill="transparent"
                />
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={9}
                    fill="#00A896"
                    fillOpacity="0.18"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 4.5 : 3}
                  fill={isSelected ? "#f4f0e1" : "#141414"}
                  stroke="#00A896"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y={h - 2}
                  textAnchor="middle"
                  className="font-mono text-[10px]"
                  fill={isSelected ? "#f4f0e1" : "rgba(244,240,225,0.4)"}
                >
                  {pt.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
