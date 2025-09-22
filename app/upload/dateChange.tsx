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
import { format } from "date-fns";

type Props = Readonly<{
  currentMonth: number;
  currentYear: number;
}>;

export function DateChange({ currentMonth, currentYear }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));

  const handleDateChange = (event: Date) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("month", (event.getMonth() + 1).toString());
    newParams.set("year", event.getFullYear().toString());
    router.push(`/upload?${newParams.toString()}`);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "bg-[#f4f0e1] text-black px-2 py-2 rounded-lg font-medium border border-transparent hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 flex items-center",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM yyyy") : <span>Pick a month</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <MonthPicker onMonthSelect={handleDateChange} selectedMonth={date} />
      </PopoverContent>
    </Popover>
  );
}
