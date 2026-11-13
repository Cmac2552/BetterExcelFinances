"use client";

import React, { useState, useMemo, useId } from "react";

export interface CategorySpendingItem {
  category: string;
  amount: number;
}

interface Props {
  data: CategorySpendingItem[];
  total?: number;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

interface PaletteColor {
  base: string;
  bright: string;
  glow: string;
}

// Color palette harmonized with the dashboard (#00A896, #7B0323, #f4f0e1)
const PALETTE: PaletteColor[] = [
  { base: "#008778", bright: "#00A896", glow: "rgba(0, 168, 150, 0.35)" }, // Brand Teal
  { base: "#0284C7", bright: "#38BDF8", glow: "rgba(56, 189, 248, 0.35)" }, // Sky Blue
  { base: "#DC2626", bright: "#F87171", glow: "rgba(248, 113, 113, 0.35)" }, // Coral Red
  { base: "#D97706", bright: "#FBBF24", glow: "rgba(251, 191, 36, 0.35)" }, // Warm Amber
  { base: "#7C3AED", bright: "#A78BFA", glow: "rgba(167, 139, 250, 0.35)" }, // Violet
  { base: "#EA580C", bright: "#FB923C", glow: "rgba(251, 146, 60, 0.35)" }, // Orange
  { base: "#61021C", bright: "#7B0323", glow: "rgba(123, 3, 35, 0.35)" },   // Brand Debt Burgundy
  { base: "#475569", bright: "#94A3B8", glow: "rgba(148, 163, 184, 0.35)" }, // Slate
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Precision rounding helper to prevent SSR vs client floating-point hydration mismatches
function round(num: number, decimals = 3): number {
  const factor = 10 ** decimals;
  return Math.round(num * factor) / factor;
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const rad = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: round(cx + r * Math.cos(rad)),
    y: round(cy + r * Math.sin(rad)),
  };
}

function describeAnnularSector(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
) {
  const span = Math.min(359.999, Math.max(0.1, endAngle - startAngle));
  const effectiveEnd = startAngle + span;

  const p1 = polarToCartesian(cx, cy, rOuter, effectiveEnd);
  const p2 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p3 = polarToCartesian(cx, cy, rInner, startAngle);
  const p4 = polarToCartesian(cx, cy, rInner, effectiveEnd);

  const largeArcFlag = span > 180 ? 1 : 0;

  return [
    `M ${p2.x} ${p2.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${p1.x} ${p1.y}`,
    `L ${p4.x} ${p4.y}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${p3.x} ${p3.y}`,
    "Z",
  ].join(" ");
}

export function DepthDonutChart({
  data,
  total,
  selectedCategory = "ALL",
  onSelectCategory,
}: Readonly<Props>) {
  const rawId = useId();
  const chartId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const calculatedTotal = useMemo(() => {
    const raw = total ?? data.reduce((sum, item) => sum + item.amount, 0);
    return Math.round(raw * 100) / 100;
  }, [total, data]);

  // SVG dimensions
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 138;
  const rInner = 92;
  const rMid = (rOuter + rInner) / 2;

  // Calculate slice angles and offsets
  const slices = useMemo(() => {
    let currentAngle = 0;
    const count = data.length;

    return data.map((item, index) => {
      const fraction = calculatedTotal > 0 ? item.amount / calculatedTotal : 0;
      const span = fraction * 360;

      const sliceStart = round(currentAngle);
      const sliceEnd = round(currentAngle + span);
      const midAngle = (sliceStart + sliceEnd) / 2;

      currentAngle += span;

      const gap = count > 1 && span > 5 ? 3.0 : Math.min(span * 0.3, 1.0);
      const startAngle = round(sliceStart + gap / 2);
      const endAngle = round(Math.max(startAngle + 0.4, sliceEnd - gap / 2));

      const palette = PALETTE[index % PALETTE.length];
      const rad = ((midAngle - 90) * Math.PI) / 180;
      const popDistance = 8;
      const popX = round(Math.cos(rad) * popDistance);
      const popY = round(Math.sin(rad) * popDistance);

      return {
        ...item,
        index,
        palette,
        fraction,
        percentage: (fraction * 100).toFixed(1),
        startAngle,
        endAngle,
        midAngle,
        popX,
        popY,
        path: describeAnnularSector(cx, cy, rInner, rOuter, startAngle, endAngle),
        hitPath: describeAnnularSector(
          cx,
          cy,
          rInner - 10,
          rOuter + 16,
          sliceStart,
          sliceEnd
        ),
        highlightPath: describeAnnularSector(
          cx,
          cy,
          rInner + (rOuter - rInner) * 0.65,
          rOuter - 2,
          startAngle + 0.2,
          endAngle - 0.2
        ),
      };
    });
  }, [data, calculatedTotal, cx, cy, rInner, rOuter]);

  const activeItem = useMemo(() => {
    const target = hoveredCategory || (selectedCategory !== "ALL" ? selectedCategory : null);
    if (!target) return null;
    return slices.find((s) => s.category === target);
  }, [hoveredCategory, selectedCategory, slices]);

  if (!data || data.length === 0 || calculatedTotal <= 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Category Spending</h2>
          {selectedCategory !== "ALL" && (
            <span className="text-sm text-gray-400">
              Filtered: <span className="text-white font-medium">{selectedCategory}</span>
            </span>
          )}
        </div>

        {selectedCategory !== "ALL" && onSelectCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory("ALL")}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Main Layout: Donut on Left, Clean Table on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: Depth Donut Visualizer */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative select-none">
          <div className="relative w-[320px] h-[320px] flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full overflow-visible"
              onMouseLeave={() => setHoveredCategory(null)}
              style={{ filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.45))" }}
              suppressHydrationWarning
            >
              <defs>
                {slices.map((slice) => {
                  const rad = ((slice.midAngle - 90) * Math.PI) / 180;
                  const x1 = round(50 + Math.cos(rad) * 45, 2);
                  const y1 = round(50 + Math.sin(rad) * 45, 2);
                  const x2 = round(50 - Math.cos(rad) * 45, 2);
                  const y2 = round(50 - Math.sin(rad) * 45, 2);

                  return (
                    <linearGradient
                      key={`grad-${slice.category}`}
                      id={`${chartId}-grad-${slice.index}`}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                    >
                      <stop offset="0%" stopColor={slice.palette.bright} />
                      <stop offset="100%" stopColor={slice.palette.base} />
                    </linearGradient>
                  );
                })}
              </defs>

              {/* Recessed Base Track */}
              <circle
                cx={cx}
                cy={cy}
                r={rMid}
                fill="none"
                stroke="#121212"
                strokeWidth={rOuter - rInner + 8}
                className="pointer-events-none"
              />
              <circle
                cx={cx}
                cy={cy}
                r={rOuter + 4}
                fill="none"
                stroke="#262626"
                strokeWidth="1"
                className="pointer-events-none"
              />
              <circle
                cx={cx}
                cy={cy}
                r={rInner - 4}
                fill="none"
                stroke="#1f1f1f"
                strokeWidth="1"
                className="pointer-events-none"
              />

              {/* Animated Visual Slices */}
              {slices.map((slice) => {
                const isSelected = selectedCategory === slice.category;
                const isHovered = hoveredCategory === slice.category;
                const isActive = isSelected || isHovered;

                const transformStyle = isActive
                  ? `translate(${slice.popX}px, ${slice.popY}px) scale(1.02)`
                  : "translate(0px, 0px) scale(1)";

                return (
                  <g
                    key={`visual-${slice.category}`}
                    className="pointer-events-none transition-all duration-200"
                    style={{
                      transformOrigin: `${cx}px ${cy}px`,
                      transform: transformStyle,
                      filter: isActive
                        ? `drop-shadow(0 0 12px ${slice.palette.glow})`
                        : undefined,
                    }}
                  >
                    <path
                      d={slice.path}
                      fill={`url(#${chartId}-grad-${slice.index})`}
                      stroke={isActive ? "#FFFFFF" : "rgba(20, 20, 20, 0.7)"}
                      strokeWidth={isActive ? 1.6 : 0.8}
                    />

                    {/* Specular ridge highlight */}
                    <path
                      d={slice.highlightPath}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {/* Stationary Hit Targets */}
              {slices.map((slice) => {
                const isSelected = selectedCategory === slice.category;

                return (
                  <path
                    key={`hit-${slice.category}`}
                    d={slice.hitPath}
                    fill="transparent"
                    className="cursor-pointer"
                    style={{ pointerEvents: "all" }}
                    onMouseEnter={() => setHoveredCategory(slice.category)}
                    onClick={() => {
                      if (!onSelectCategory) return;
                      onSelectCategory(isSelected ? "ALL" : slice.category);
                    }}
                  />
                );
              })}

              {/* Neutral Center Zone */}
              <circle
                cx={cx}
                cy={cy}
                r={rInner - 10}
                fill="transparent"
                style={{ pointerEvents: "all" }}
                onMouseEnter={() => setHoveredCategory(null)}
              />
            </svg>

            {/* Clean Center Hole Metric (Matching Dashboard Typography) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-36 h-36 rounded-full bg-[#141414] border border-gray-800 flex flex-col items-center justify-center text-center p-2 transition-all">
                {activeItem ? (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 block font-medium truncate max-w-[110px]">
                      {activeItem.category}
                    </span>
                    <span className="text-xl font-bold text-white block mt-0.5">
                      {formatCurrency(activeItem.amount)}
                    </span>
                    <span
                      className="text-xs font-semibold block mt-0.5"
                      style={{ color: activeItem.palette.bright }}
                    >
                      {activeItem.percentage}%
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 block font-medium">
                      Total
                    </span>
                    <span className="text-xl font-bold text-white block mt-0.5">
                      ${calculatedTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Elevated Financial Table aligned with CategorySpendingTable */}
        <div className="md:col-span-7 overflow-x-auto rounded-lg border border-white/10 bg-[#141414]">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th
                  scope="col"
                  className="py-2.5 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="py-2.5 px-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider w-20"
                >
                  Share
                </th>
                <th
                  scope="col"
                  className="py-2.5 px-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider w-32"
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {slices.map((slice) => {
                const isSelected = selectedCategory === slice.category;
                const isHovered = hoveredCategory === slice.category;

                return (
                  <tr
                    key={slice.category}
                    onClick={() => {
                      if (!onSelectCategory) return;
                      onSelectCategory(isSelected ? "ALL" : slice.category);
                    }}
                    onMouseEnter={() => setHoveredCategory(slice.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-white/10 text-white"
                        : isHovered
                        ? "bg-white/[0.04]"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className="py-2.5 px-4 whitespace-nowrap text-sm font-medium text-[#f4f0e1] flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: slice.palette.bright }}
                      />
                      <span>{slice.category}</span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-xs text-right text-gray-400 tabular-nums">
                      {slice.percentage}%
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-sm font-semibold text-right text-[#f4f0e1] tabular-nums font-mono">
                      {formatCurrency(slice.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-white/20 bg-white/[0.02]">
                <td className="py-3 px-4 whitespace-nowrap text-sm font-bold text-[#f4f0e1]">
                  Total
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-xs text-right text-gray-400 tabular-nums font-medium">
                  100%
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm font-bold text-right text-[#00A896] tabular-nums font-mono">
                  {formatCurrency(calculatedTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
