"use client";

import { copyMonth } from "../lib/actions";
import { FinancialSectionData } from "../types";
import { FinancialSection } from "./financialSections";

interface Props {
  sections: FinancialSectionData[];
  date: Date;
  setSections: (data: any[]) => void;
  allSectionsOpen: boolean;
}

export function FinancialInputs({
  sections,
  date,
  setSections,
  allSectionsOpen,
}: Readonly<Props>) {
  const importMonth = async () => {
    setSections(await copyMonth(date.toUTCString()));
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
            onSectionModify={onSectionModify}
            sectionDelete={onSectionDelete}
            date={date}
          />
        ))}
      </div>
    </div>
  );
}
