"use client";
import NewSection from "./newSection";
import DateInput from "./dateInput";
import FinancialSection, { FinancialSectionData } from "./financialSections";
interface FinancialInputProps {
  sections: FinancialSectionData[];
  onMonthChange: (data: string) => void;
  onSectionAddition: (data: FinancialSectionData) => void;
  date: Date;
}

export default function FinancialInputs({
  sections,
  onMonthChange,
  onSectionAddition,
  date,
}: FinancialInputProps) {
  return (
    <div className="flex flex-col justify-around ml-4">
      <div className="grid-cols-2">
        <DateInput onMonthChange={onMonthChange} />
        <NewSection data={date} onSectionAddition={onSectionAddition} />
      </div>
      <div className="flex flex-wrap w-full">
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
