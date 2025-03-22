import { useEffect, useState } from "react";

interface ChildComponentProps {
  onMonthChange: (data: string) => void;
}
export default function DateInput({ onMonthChange }: ChildComponentProps) {
  const [currentMonth, setCurrentMonth] = useState<string>("");

  useEffect(() => {
    if (currentMonth === "") {
      const now = new Date();
      const formattedMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;
      setCurrentMonth(formattedMonth);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentMonth(value);
    onMonthChange(value);
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
