"use client";

import React, { useState, useMemo } from "react";
import { Transaction } from "@prisma/client";
import { changeCategory, deleteTransaction } from "./actions";
import { Button } from "@/components/ui/button";
import { NewTransactionRow } from "./NewTransactionRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  transactions: Transaction[];
  statementMonth: string;
  categoryOptions: string[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Consistent UTC date formatting to avoid server vs client locale/timezone hydration mismatches
function formatDate(date: Date | string) {
  const d = new Date(date);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return `${month}/${day}/${year}`;
}

export function TransactionViewer({
  transactions,
  statementMonth,
  categoryOptions,
  selectedCategory: controlledCategory,
  onSelectCategory,
}: Readonly<Props>) {
  const [internalCategory, setInternalCategory] = useState<string>("ALL");
  const selectedCategory = controlledCategory ?? internalCategory;

  const handleSelectCategory = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  // Union of user categories and any categories present on existing transactions
  const availableCategories = useMemo(() => {
    const set = new Set<string>(categoryOptions);
    for (const t of transactions) {
      if (t.category) set.add(t.category);
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [categoryOptions, transactions]);

  // Count of transactions per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of transactions) {
      const cat = t.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [transactions]);

  // Filtered transactions based on selected category
  const filteredTransactions = useMemo(() => {
    if (selectedCategory === "ALL") return transactions;
    return transactions.filter(
      (t) => (t.category || "Uncategorized") === selectedCategory
    );
  }, [transactions, selectedCategory]);

  return (
    <div>
      {/* Header with inline Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Transactions</h2>
          {selectedCategory !== "ALL" && (
            <span className="text-sm text-gray-400">
              Filtered: <span className="text-white font-medium">{selectedCategory}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-[200px]">
            <Select value={selectedCategory} onValueChange={handleSelectCategory}>
              <SelectTrigger className="w-full bg-[#1E2228] border-gray-700 text-[#f4f0e1]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-[#f4f0e1]">
                <SelectItem
                  value="ALL"
                  className="focus:bg-transparent focus:border-black focus:border-2"
                >
                  All Categories ({transactions.length})
                </SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem
                    key={`filter-${cat}`}
                    value={cat}
                    className="focus:bg-transparent focus:border-black focus:border-2"
                  >
                    {cat} {categoryCounts[cat] ? `(${categoryCounts[cat]})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory !== "ALL" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSelectCategory("ALL")}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Date</th>
              <th className="py-2 px-4 border-b text-left">Description</th>
              <th className="py-2 px-4 border-b text-left">Amount</th>
              <th className="py-2 px-4 border-b text-left">Category</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <NewTransactionRow statementMonth={statementMonth} />
            {filteredTransactions.map((t) => (
              <tr key={t.id}>
                <td className="py-2 px-4 border-b" suppressHydrationWarning>
                  {formatDate(t.date)}
                </td>
                <td className="py-2 px-4 border-b">{t.description}</td>
                <td className="py-2 px-4 border-b">
                  {formatCurrency(t.amount)}
                </td>
                <td className="py-2 px-4 border-b w-[15rem]">
                  <Select
                    value={t.category}
                    onValueChange={async (value) => {
                      await changeCategory(t.id, value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#f4f0e1]">
                      {availableCategories.map((value) => {
                        return (
                          <SelectItem
                            className="focus:bg-transparent focus:border-black focus:border-2"
                            key={`${t.id}-${value}`}
                            value={value}
                          >
                            {value}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-2 px-4 border-b">
                  <form
                    action={async () => {
                      await deleteTransaction(t.id);
                    }}
                  >
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      className="w-[4rem]"
                    >
                      Delete
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
