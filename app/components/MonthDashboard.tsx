"use client";
import { useState } from "react";
import { FinancialInputs } from "./financialInputs";
import { SectionModal } from "./SectionModal";
import { DateInput } from "./dateInput";
import { gatherDataForMonth, generateNewTableData } from "../utils/monthUtils";
import { sortSections } from "../utils/accountUtils";
import { updateTableData } from "../actions/financial";
import { FinancialSectionData, TableData } from "../types";

interface Props {
  sections: FinancialSectionData[];
  tableData: TableData[];
  setTableData: (data: TableData[]) => void;
  date: Date;
}
export function MonthDashboard({
  sections,
  tableData,
  setTableData,
  date,
}: Readonly<Props>) {
  const [data, setData] = useState<FinancialSectionData[]>(
    sortSections(sections)
  );
  const [allSectionsOpen, setAllSectionsOpen] = useState(false);

  const postTableData = async (sections: any[]) => {
    const update = {
      date: date,
      sectionValue: gatherDataForMonth(sections),
    };
    try {
      await updateTableData(update);
      setTableData(generateNewTableData(update, tableData, date));
    } catch {
      console.error("Error posting table data");
    }
  };

  const addSection = (newSection: FinancialSectionData) => {
    const newSections = [...data, newSection];
    setData(sortSections(newSections));
    postTableData(newSections);
  };

  const setSections = (newSections: FinancialSectionData[]) => {
    const sortedSections = sortSections(newSections);
    setData(sortedSections);
    postTableData(sortedSections);
  };

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
              <button className="bg-[#f4f0e1] text-black px-2 py-2 rounded-lg font-medium border border-transparent hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 mr-4">
                Add Account
              </button>
            }
          />
        </div>
        <button
          className="bg-[#f4f0e1] text-black px-6 py-2 rounded-lg font-medium border border-transparent hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 mr-4 ml-auto"
          onClick={() => setAllSectionsOpen(!allSectionsOpen)}
        >
          Toggle All Accounts
        </button>
      </div>

      <div className="w-full">
        <FinancialInputs
          sections={data}
          date={date}
          setSections={setSections}
          allSectionsOpen={allSectionsOpen}
        />
      </div>
    </>
  );
}
