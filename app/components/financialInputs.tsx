"use client";

import { FinancialSectionData } from "../types";
import FinancialSection from "./financialSections";

interface FinancialInputProps {
  sections: FinancialSectionData[];
  date: Date;
  setSections: (data: any[]) => void;
  allSectionsOpen: boolean;
  handleSectionMouseLeave: () => void;
  handleDeleteSection: (sectionId: number) => void;
}

export default function FinancialInputs({
  sections,
  date,
  setSections,
  allSectionsOpen,
  handleSectionMouseLeave,
  handleDeleteSection,
}: Readonly<FinancialInputProps>) {
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

  return (
    <div className="flex flex-col justify-around ml-4">
      <div className="flex flex-wrap w-full">
        {sections?.length === 0 && (
          <div className="w-full flex justify-center">
            <button
              onClick={importMonth}
              className="bg-[#f4f0e1] text-black px-6 py-2 rounded-lg font-medium border border-transparent hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 mr-4"
            >
              Import Data From Previous Month
            </button>
          </div>
        )}
        {sections?.map((dataEntry: FinancialSectionData, index: number) => (
          <FinancialSection
            section={dataEntry}
            key={index + "Financial Input"}
            open={allSectionsOpen}
            onSectionModify={onSectionModify} // This internal onSectionModify calls setSections (for deferred sort)
            sectionDelete={handleDeleteSection} // This is passed directly from Dashboard (for immediate delete)
            date={date}
            handleSectionMouseLeave={handleSectionMouseLeave}
          />
        ))}
      </div>
    </div>
  );
}
