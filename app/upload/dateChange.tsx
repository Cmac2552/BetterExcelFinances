"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { MonthPicker } from "@/components/ui/monthpicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = Readonly<{
  currentMonth: number;
  currentYear: number;
}>;

export function DateChange({ currentMonth, currentYear }: Props) {
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
    <div className="flex gap-2">
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
    // <Popover>
    //   <PopoverTrigger asChild>
    //     <Button
    //       variant={"outline"}
    //       className={cn(
    //         "w-[280px] justify-start text-left font-normal text-black"
    //       )}
    //     >
    //       <CalendarIcon className="mr-2 h-4 w-4" />
    //       {<span>Pick a month</span>}
    //     </Button>
    //   </PopoverTrigger>
    //   <PopoverContent className="w-auto p-0">
    //     <MonthPicker />
    //   </PopoverContent>
    // </Popover>
  );
}
