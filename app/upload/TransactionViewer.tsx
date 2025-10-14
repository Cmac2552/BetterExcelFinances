"use client";

import React, { useRef, useState } from "react";
import { Transaction } from "@prisma/client";

import { deleteTransaction, saveTransactionToDb } from "./actions";
import { Button } from "@/components/ui/button";
import { format, set } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { NumericFormat } from "react-number-format";

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
  // Use DOM refs for uncontrolled inputs (no re-renders while typing)
  const descriptionRef = useRef<HTMLInputElement | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const categoryRef = useRef<HTMLInputElement | null>(null);
  const [date, setDate] = useState<Date>(new Date());

  const handleSubmit = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    const description = descriptionRef.current?.value ?? "";
    const category = categoryRef.current?.value ?? "";

    console.log({ date, description, amount, category });
    await saveTransactionToDb({ category, amount, description, date });

    if (date) setDate(new Date());
    if (descriptionRef.current) descriptionRef.current.value = "";
    if (amount) setAmount(0);
    if (categoryRef.current) categoryRef.current.value = "";
  };

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
            <tr>
              <td className="py-2 px-4 border-b">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="primary">
                      <CalendarIcon />
                      {date ? (
                        format(date, "MM/dd/yyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      required
                    />
                  </PopoverContent>
                </Popover>
              </td>
              <td className="py-2 px-4 border-b">
                <input
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Description"
                  ref={descriptionRef}
                />
              </td>
              <td className="py-2 px-4 border-b">
                <NumericFormat
                  value={amount}
                  thousandSeparator={true}
                  prefix="$"
                  fixedDecimalScale={true}
                  allowNegative={false}
                  onValueChange={(vals) => {
                    setAmount(vals.floatValue ?? 0);
                  }}
                  placeholder="Amount"
                  className="flex h-10 rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-1/2"
                />
              </td>
              <td className="py-2 px-4 border-b">
                <input
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Category"
                  ref={categoryRef}
                />
              </td>
              <td className="py-2 px-4 border-b">
                <Button onClick={handleSubmit} variant="secondary">
                  Add
                </Button>
              </td>
            </tr>

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
