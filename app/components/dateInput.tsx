import { useEffect, useState } from "react";

interface ChildComponentProps {
  onMonthChange: (data: string) => void;
}
export default function dateInput({ onMonthChange }: ChildComponentProps) {
  const [currentMonth, setCurrentMonth] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    const formattedMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    setCurrentMonth(formattedMonth);
    onMonthChange(formattedMonth + "-15");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentMonth(value);
    onMonthChange(value + "-15");
  };
  return (
    <input
      type="month"
      id="month-picker"
      name="month-picker"
      className=" px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-[12rem]"
      value={currentMonth}
      onChange={handleChange}
    />
  );
}
