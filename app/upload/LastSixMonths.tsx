"use client";

import { useState } from "react";
import { CategorySpendingTable } from "./CategorySpendingTable";

type MonthData = { month: number; year: number; data: { category: string; amount: number }[] };

export function LastSixMonths({ initialMonths }: { readonly initialMonths: MonthData[] }) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const m of initialMonths) map[`${m.year}-${m.month}`] = true;
    return map;
  });

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {initialMonths.map((m) => {
          const key = `${m.year}-${m.month}`;
          const open = openMap[key] ?? true;
          return (
            <div key={key} className="bg-gray-800 p-4 rounded">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold mb-2">
                  {m.month}/{m.year}
                </h3>
                <button
                  className="text-xs text-slate-300 px-2 py-1 bg-slate-700 rounded"
                  onClick={() => setOpenMap((prev) => ({ ...prev, [key]: !open }))}
                >
                  {open ? "Hide" : "Show"}
                </button>
              </div>
              {open && <CategorySpendingTable data={m.data} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
