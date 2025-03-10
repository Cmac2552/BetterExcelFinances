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
  loading: boolean;
  setSections: (data: any[]) => void;
}

export default function FinancialInputs({
  sections,
  onMonthChange,
  onSectionAddition,
  date,
  loading,
  setSections,
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

  const importMonth = async () => {
    const response = await fetch(`api/copy-month?date=${date}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      setSections(await response.json());
    }
  };
  const onSectionModify = (updatedSection: any) => {
    const updatedSections = sections.map((section) => {
      return section.id === updatedSection.id ? updatedSection : section;
    });
    setSections(updatedSections);
  };

  const onSectionDelete = (sectionId: number) => {
    const updatedSections = sections.filter((section) => {
      return section.id !== sectionId;
    });
    setSections(updatedSections);
  };

  const gatherDataForMonth = () => {
    return sections.reduce(
      (finalValue: number, sectionData: FinancialSectionData) =>
        finalValue +
        sectionData.values.reduce(
          (finalValue: number, currentValue: FinancialSectionItemData) =>
            sectionData.assetClass === "ASSET"
              ? finalValue + currentValue.value
              : -1 * (finalValue + currentValue.value),
          0
        ),
      0
    );
  };
  return (
    <div className="flex flex-col justify-around ml-4">
      <div className="flex items-center gap-x-4">
        <div className="grid-cols-2">
          <DateInput onMonthChange={onMonthChange} />
          <NewSection date={date} onSectionAddition={onSectionAddition} />
        </div>
        <button className="text-white ml-auto" onClick={handleRefresh}>
          Add Month To Chart
        </button>
        <button className="text-white" onClick={importMonth}>
          Import Data From Previous Month
        </button>
        <button
          className="bg-white text-black px-6 py-2 rounded-lg font-medium border border-transparent hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 mr-4"
          onClick={() => setSectionsOpen(!sectionsOpen)}
        >
          Toggle All Sections
        </button>
      </div>
      {loading ? (
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      ) : (
        <div>
          <div className="flex flex-wrap w-full">
            {sections?.map((dataEntry: FinancialSectionData, index: number) => (
              <FinancialSection
                section={dataEntry}
                key={index + "Financial Input"}
                open={sectionsOpen}
                onSectionModify={onSectionModify}
                sectionDelete={onSectionDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
