"use client";
import NewSection from "./newSection";
import DateInput from "./dateInput";
import FinancialSection, {
  FinancialSectionData,
  FinancialSectionItemData,
} from "./financialSections";
import { useState } from "react";
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
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const handleRefresh = async () => {
    const response = await fetch("/api/table-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: date,
        sectionValue: gatherDataForMonth(),
      }),
    });
    if (response.ok) {
      console.log("ok");
    }
  };
  const gatherDataForMonth = () => {
    return sections.reduce(
      (finalValue: number, sectionData: FinancialSectionData) =>
        finalValue +
        sectionData.values.reduce(
          (finalValue: number, currentValue: FinancialSectionItemData) =>
            finalValue + currentValue.value,
          0
        ),
      0
    );
  };
  return (
    <div className="flex flex-col justify-around ml-4">
      <div className="grid-cols-2">
        <DateInput onMonthChange={onMonthChange} />
        <NewSection data={date} onSectionAddition={onSectionAddition} />
        <button className="text-white" onClick={handleRefresh}>
          Add To Table
        </button>
        <button
          onClick={() => setSectionsOpen(!sectionsOpen)}
          className="text-white"
        >
          Open Sections
        </button>
      </div>
      <div className="flex flex-wrap w-full">
        {sections?.map((dataEntry: FinancialSectionData, index: number) => (
          <FinancialSection
            section={dataEntry}
            key={index + "Financial Input"}
            open={sectionsOpen}
          />
        ))}
      </div>
    </div>
  );
}
