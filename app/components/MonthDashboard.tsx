"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FinancialInputs } from "./financialInputs";
import { SectionModal } from "./SectionModal";
import { DateInput } from "./dateInput";
import { FinancialSectionData } from "../types";

interface Props {
  sections: FinancialSectionData[];
  date: Date;
  setSections: (sections: FinancialSectionData[]) => void;
  addSection: (section: FinancialSectionData) => void;
}
export function MonthDashboard({
  sections,
  date,
  setSections,
  addSection,
}: Readonly<Props>) {
  const [allSectionsOpen, setAllSectionsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-x-4 w-full pl-4 pr-2">
        <div className="grid grid-cols-2 gap-4">
          <DateInput date={date} />
          <SectionModal
            date={date}
            onSectionAddition={addSection}
            modalTitle="Add Account"
            givenAsset={"ASSET"}
            trigger={
              <Button variant="primary" size="lg" className="mr-4">
                Add Account
              </Button>
            }
          />
        </div>
        <Button
          className="mr-4 ml-auto"
          variant="primary"
          size="lg"
          onClick={() => setAllSectionsOpen(!allSectionsOpen)}
        >
          Toggle All Accounts
        </Button>
      </div>

      <div className="w-full">
        <FinancialInputs
          sections={sections}
          date={date}
          setSections={setSections}
          allSectionsOpen={allSectionsOpen}
        />
      </div>
    </>
  );
}
