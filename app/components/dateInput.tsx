import { useEffect, useState } from "react";

interface ChildComponentProps {
  onMonthChange: (data: string) => void;
}
export default function DateInput({ onMonthChange }: ChildComponentProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    if (selectedMonth === "") {
      const now = new Date();
      const formattedMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;
      setSelectedMonth(formattedMonth);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedMonth(value);
    onMonthChange(value);
  };

  return (
    <input
      type="month"
      id="month-picker"
      name="month-picker"
      className=" px-4 py-2 bg-[#1E2228] text-[#f4f0e1] border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-visible:ring-[#f4f0e1]  w-[12rem]"
      value={selectedMonth}
      onChange={handleChange}
    />
  );
}
