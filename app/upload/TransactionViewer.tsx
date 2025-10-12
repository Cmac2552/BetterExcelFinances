"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Transaction } from "@prisma/client";

import { deleteTransaction } from "./actions";
import { Button } from "@/components/ui/button";

type Props = {
  transactions: Transaction[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function TransactionViewer({ transactions }: Readonly<Props>) {
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
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="py-2 px-4 border-b">
                  {t.date.toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">{t.description}</td>
                <td className="py-2 px-4 border-b">
                  {formatCurrency(t.amount)}
                </td>
                <td className="py-2 px-4 border-b">{t.category}</td>
                <td className="py-2 px-4 border-b">
                  <form
                    action={async () => {
                      await deleteTransaction(t.id);
                    }}
                  >
                    <Button type="submit" variant="secondary">
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
