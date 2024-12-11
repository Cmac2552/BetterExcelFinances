"use client";
import { useState } from "react";
import NewSection from "./newSection";
import DateInput from "./dateInput";

export default function FinancialInputs() {
  const [date, setDate] = useState(new Date());
  const handleDataChange = (data: string) => {
    setDate(new Date(data));
  };
  return (
    // make this a grid
    <div className="flex flex-col justify-around">
      <div className="grid-cols-2">
        <DateInput onDataChange={handleDataChange} />
        <NewSection data={date} />
      </div>
      {/* <FinancialSection /> */}
      {/* <FinancialSection />
      <FinancialSection /> */}
    </div>
  );
}
