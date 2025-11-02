"use client";

import React from "react";
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
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function TransactionViewer({
  transactions,
  statementMonth,
  categoryOptions,
}: Readonly<Props>) {
  return (
    <div>
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
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="py-2 px-4 border-b">
                  {t.date.toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">{t.description}</td>
                <td className="py-2 px-4 border-b">
                  {formatCurrency(t.amount)}
                </td>
                <td className="py-2 px-4 border-b w-[15rem]">
                  <Select
                    defaultValue={t.category}
                    onValueChange={async (value) => {
                      await changeCategory(t.id, value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#f4f0e1]">
                      {categoryOptions.map((value) => {
                        return (
                          <SelectItem
                            className="focus:bg-transparent focus:border-black focus:border-2"
                            key={t.id + value}
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
