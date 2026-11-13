"use client";

import React, { useMemo } from "react";

interface ChartData {
  category: string;
  amount: number;
}

interface Props {
  data: ChartData[];
  showShare?: boolean;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function CategorySpendingTable({ data, showShare = true }: Props) {
  const totalAmount = useMemo(
    () => data.reduce((acc, item) => acc + (item.amount > 0 ? item.amount : 0), 0),
    [data]
  );

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.amount - a.amount);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        No spending recorded
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#141414]">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            <th
              scope="col"
              className="py-2.5 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >
              Category
            </th>
            {showShare && (
              <th
                scope="col"
                className="py-2.5 px-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider w-20"
              >
                Share
              </th>
            )}
            <th
              scope="col"
              className="py-2.5 px-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider w-32"
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {sortedData.map(({ category, amount }) => {
            const pct = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : "0.0";

            return (
              <tr
                key={category}
                className="hover:bg-white/[0.03] transition-colors"
              >
                <td className="py-2.5 px-4 whitespace-nowrap text-sm font-medium text-[#f4f0e1]">
                  {category}
                </td>
                {showShare && (
                  <td className="py-2.5 px-4 whitespace-nowrap text-xs text-right text-gray-400 tabular-nums">
                    {pct}%
                  </td>
                )}
                <td className="py-2.5 px-4 whitespace-nowrap text-sm font-semibold text-right text-[#f4f0e1] tabular-nums font-mono">
                  {formatCurrency(amount)}
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
            {showShare && (
              <td className="py-3 px-4 whitespace-nowrap text-xs text-right text-gray-400 tabular-nums">
                100%
              </td>
            )}
            <td className="py-3 px-4 whitespace-nowrap text-sm font-bold text-right text-[#00A896] tabular-nums font-mono">
              {formatCurrency(totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
