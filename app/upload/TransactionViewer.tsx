"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Transaction } from "@prisma/client";
import { changeCategory, deleteTransaction, updateTransaction } from "./actions";
import { Button } from "@/components/ui/button";
import { NewTransactionRow } from "./NewTransactionRow";
import { CategoryCombobox } from "./CategoryCombobox";
import { NumericFormat } from "react-number-format";
import { Check, Pencil, X } from "lucide-react";
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
  const router = useRouter();
  const [internalCategory, setInternalCategory] = useState<string>("ALL");
  const selectedCategory = controlledCategory ?? internalCategory;

  // Inline amount editing state
  const [editingAmountId, setEditingAmountId] = useState<number | null>(null);
  const [editAmountValue, setEditAmountValue] = useState<number | undefined>(
    undefined
  );
  const [isSavingAmount, setIsSavingAmount] = useState(false);

  // Optimistic edits so updated values show immediately while router.refresh() completes
  const [optimisticEdits, setOptimisticEdits] = useState<
    Record<number, { amount?: number; category?: string }>
  >({});

  useEffect(() => {
    setOptimisticEdits({});
  }, [transactions]);

  const startEditingAmount = (t: Transaction) => {
    const currentAmount = optimisticEdits[t.id]?.amount ?? t.amount;
    setEditingAmountId(t.id);
    setEditAmountValue(currentAmount);
  };

  const cancelEditingAmount = () => {
    setEditingAmountId(null);
    setEditAmountValue(undefined);
  };

  const saveAmount = async (t: Transaction) => {
    if (isSavingAmount) return;
    if (
      editAmountValue === undefined ||
      !Number.isFinite(editAmountValue) ||
      editAmountValue < 0
    ) {
      cancelEditingAmount();
      return;
    }

    const rounded = Number.parseFloat(editAmountValue.toFixed(2));
    const currentAmount = optimisticEdits[t.id]?.amount ?? t.amount;
    if (rounded === currentAmount) {
      cancelEditingAmount();
      return;
    }

    setOptimisticEdits((prev) => ({
      ...prev,
      [t.id]: { ...prev[t.id], amount: rounded },
    }));
    cancelEditingAmount();
    setIsSavingAmount(true);

    try {
      await updateTransaction(t.id, { amount: rounded });
      router.refresh();
    } catch (error) {
      console.error("Failed to update transaction amount:", error);
      setOptimisticEdits((prev) => {
        const next = { ...prev };
        if (next[t.id]) {
          const { amount: _, ...rest } = next[t.id];
          next[t.id] = rest;
        }
        return next;
      });
    } finally {
      setIsSavingAmount(false);
    }
  };

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
            <NewTransactionRow
              statementMonth={statementMonth}
              categoryOptions={availableCategories}
            />
            {filteredTransactions.map((t) => {
              const isEditingAmount = editingAmountId === t.id;
              const displayAmount = optimisticEdits[t.id]?.amount ?? t.amount;
              const displayCategory =
                optimisticEdits[t.id]?.category ?? t.category;

              return (
                <tr key={t.id}>
                  <td className="py-2 px-4 border-b" suppressHydrationWarning>
                    {formatDate(t.date)}
                  </td>
                  <td className="py-2 px-4 border-b">{t.description}</td>
                  <td className="py-2 px-4 border-b">
                    {isEditingAmount ? (
                      <div className="flex items-center gap-1.5">
                        <NumericFormat
                          value={editAmountValue ?? ""}
                          thousandSeparator={true}
                          prefix="$"
                          fixedDecimalScale={false}
                          decimalScale={2}
                          allowNegative={false}
                          autoFocus
                          disabled={isSavingAmount}
                          onValueChange={(vals) => {
                            setEditAmountValue(vals.floatValue);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveAmount(t);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              cancelEditingAmount();
                            }
                          }}
                          className="h-8 w-28 rounded-md border border-gray-600 bg-[#1E2228] px-2.5 py-1 text-sm text-[#f4f0e1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1]"
                        />
                        <button
                          type="button"
                          onClick={() => saveAmount(t)}
                          disabled={isSavingAmount}
                          title="Save amount"
                          className="p-1 rounded text-emerald-400 hover:bg-emerald-950/50 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditingAmount}
                          disabled={isSavingAmount}
                          title="Cancel"
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditingAmount(t)}
                        title="Click to edit amount"
                        className="group inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 -ml-1.5 hover:bg-white/10 transition-colors text-left"
                      >
                        <span className="tabular-nums font-mono">
                          {formatCurrency(displayAmount)}
                        </span>
                        <Pencil className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b w-[15rem]">
                    <CategoryCombobox
                      value={displayCategory}
                      options={availableCategories}
                      onChange={async (value) => {
                        setOptimisticEdits((prev) => ({
                          ...prev,
                          [t.id]: { ...prev[t.id], category: value },
                        }));
                        try {
                          await changeCategory(t.id, value);
                          router.refresh();
                        } catch (error) {
                          console.error("Failed to update category:", error);
                          setOptimisticEdits((prev) => {
                            const next = { ...prev };
                            if (next[t.id]) {
                              const { category: _, ...rest } = next[t.id];
                              next[t.id] = rest;
                            }
                            return next;
                          });
                        }
                      }}
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <form
                      action={async () => {
                        await deleteTransaction(t.id);
                        router.refresh();
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
