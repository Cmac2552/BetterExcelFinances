"use client";

import { Button } from "@/components/ui/button";
import { copyMonth } from "../lib/actions";
import { FinancialSectionData } from "../types";
import { FinancialSection } from "./financialSections";

interface Props {
  sections: FinancialSectionData[];
  date: Date;
  setSections: (data: FinancialSectionData[]) => void;
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
  const onSectionModify = (updatedSection: FinancialSectionData) => {
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
            <Button
              onClick={importMonth}
              className="mr-4"
              size="lg"
              variant="primary"
            >
              Import Data From Previous Month
            </Button>
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
