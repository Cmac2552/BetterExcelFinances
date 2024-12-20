"use client";
import { useState } from "react";
import NewSection from "./newSection";
import DateInput from "./dateInput";
import FinancialSection, { FinancialSectionData } from "./financialSections";
interface FinancialInputProps {
  sections: FinancialSectionData[];
}

export default function FinancialInputs({ sections }: FinancialInputProps) {
  const [date, setDate] = useState(new Date());
  const handleDataChange = (data: string) => {
    setDate(new Date(data));
  };
  return (
    <div className="flex flex-col justify-around ml-4">
      <div className="grid-cols-2">
        <DateInput onMonthChange={handleDataChange} />
        <NewSection data={date} />
      </div>
      <div className="flex">
        {sections?.map((dataEntry: FinancialSectionData, index: number) => (
          <FinancialSection
            section={dataEntry}
            key={index + "Financial Input"}
          />
        ))}
      </div>
    </div>
  );
}
