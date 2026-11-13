"use client";

import React, { useState } from "react";
import { Transaction } from "@prisma/client";
import { DepthDonutChart } from "./DepthDonutChart";
import { TransactionViewer } from "./TransactionViewer";

interface ChartData {
  category: string;
  amount: number;
}

interface Props {
  transactions: Transaction[];
  statementMonth: string;
  categoryOptions: string[];
  chartData: ChartData[];
}

export function CurrentMonthView({
  transactions,
  statementMonth,
  categoryOptions,
  chartData,
}: Readonly<Props>) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  return (
    <div className="space-y-8">
      {/* Category Spending Depth Donut & Breakdown Card */}
      {chartData.length > 0 && (
        <section>
          <DepthDonutChart
            data={chartData}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </section>
      )}

      {/* Transactions Section */}
      <section>
        <TransactionViewer
          transactions={transactions}
          statementMonth={statementMonth}
          categoryOptions={categoryOptions}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>
    </div>
  );
}
