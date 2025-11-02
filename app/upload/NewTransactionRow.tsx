"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { NumericFormat } from "react-number-format";
import { saveTransactionToDb } from "./actions";

type Props = {
  statementMonth: string;
};

export function NewTransactionRow({ statementMonth }: Readonly<Props>) {
  const descriptionRef = useRef<HTMLInputElement | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const categoryRef = useRef<HTMLInputElement | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    const description = descriptionRef.current?.value ?? "";
    const category = categoryRef.current?.value ?? "";

    try {
      if (date) {
        await saveTransactionToDb({
          category,
          amount,
          description,
          date,
          statementMonth,
        });
      } else {
        throw new Error("Date undefined");
      }

      // reset inputs
      setDate(undefined);
      if (descriptionRef.current) descriptionRef.current.value = "";
      setAmount(0);
      if (categoryRef.current) categoryRef.current.value = "";
    } catch (error) {
      console.error("Failed to save transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <tr>
      <td className="py-2 px-4 border-b">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="primary">
              <CalendarIcon />
              {date ? (
                <span>{format(date, "MM/dd/yyyy")}</span>
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
              className="bg-[#f4f0e1]"
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
      <td className="py-2 px-4 border-b ">
        <NumericFormat
          value={amount}
          thousandSeparator={true}
          prefix="$"
          fixedDecimalScale={false}
          decimalScale={2}
          allowNegative={false}
          onValueChange={(vals) => {
            setAmount(vals.floatValue ?? 0);
          }}
          placeholder="Amount"
          className="flex h-10 rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-4/5"
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
        <Button
          onClick={handleSubmit}
          variant="secondary"
          size={"sm"}
          className="w-[4rem]"
          disabled={isLoading}
        >
          Add
        </Button>
      </td>
    </tr>
  );
}
