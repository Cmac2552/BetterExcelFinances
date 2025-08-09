"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Transaction } from "@prisma/client";

import { deleteTransaction } from "./actions";

type Props = {
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function TransactionViewer({
  transactions,
  currentMonth,
  currentYear,
}: Readonly<Props>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actualCurrentYear = new Date().getFullYear();

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(name, value);
    router.push(`/upload?${newParams.toString()}`);
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <select
          name="month"
          value={currentMonth}
          onChange={handleDateChange}
          className="bg-gray-800 text-white p-2 rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select
          name="year"
          value={currentYear}
          onChange={handleDateChange}
          className="bg-gray-800 text-white p-2 rounded"
        >
          {Array.from({ length: 10 }, (_, i) => {
            const year = actualCurrentYear - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
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
                    <button
                      type="submit"
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Delete
                    </button>
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
