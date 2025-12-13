"use client";
import { useState, useMemo } from "react";
import { LineChart } from "./Line";
import { FinancialSectionData, TableData } from "../types";
import { MonthDashboard } from "./MonthDashboard";
import { sortSections } from "../utils/accountUtils";
import { gatherDataForMonth, generateNewTableData } from "../utils/monthUtils";
import { updateTableData } from "../actions/financial";
import { calculateNetWorth, formatCurrency } from "../utils/currencyUtils";

interface Props {
  sections: FinancialSectionData[];
  tableDataInput: TableData[];
  date: Date;
}

export default function Dashboard({
  sections,
  tableDataInput,
  date,
}: Readonly<Props>) {
  const [tableData, setTableData] = useState<TableData[]>(tableDataInput);
  const [data, setData] = useState<FinancialSectionData[]>(sections);
  const netWorth = useMemo(() => calculateNetWorth(data), [data]);

  const postTableData = async (sections: FinancialSectionData[]) => {
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

  const addSection = async (newSection: FinancialSectionData) => {
    const newSections = [...data, newSection];
    setData(sortSections(newSections));
    await postTableData(newSections);
  };

  const setSections = async (newSections: FinancialSectionData[]) => {
    const sortedSections = sortSections(newSections);
    setData(sortedSections);
    await postTableData(sortedSections);
  };

  return (
    <div className="z-10 w-full h-[80%]">
      <div className="w-full flex items-center justify-center flex-col">
        <div className="w-full px-8 pt-8 flex flex-wrap justify-center items-start">
          <div className="w-[30%] min-w-[300px] pr-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[#f4f0e1] text-md font-medium tracking-wide uppercase">
                  {new Date(
                    date.getFullYear(),
                    date.getMonth() + 1,
                    1
                  ).toLocaleString("default", { month: "long" })}{" "}
                  Total Net Worth
                </p>
                <h2
                  className={`text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r text-ellipsis overflow-hidden text h-16 ${
                    netWorth.totalNetWorth >= 0
                      ? "from-[#00A896] to-[#f4f0e1]"
                      : "from-[#7B0323] to-[#f4f0e1]"
                  }`}
                >
                  {formatCurrency(netWorth.totalNetWorth)}
                </h2>
                <div
                  className={`h-1 w-16 rounded-full bg-gradient-to-r ${
                    netWorth.totalNetWorth >= 0
                      ? "from-[#00A896] to-[#f4f0e1]"
                      : "from-[#7B0323] to-[#f4f0e1]"
                  }`}
                ></div>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <p className="text-[#f4f0e1] text-xs font-medium tracking-wide uppercase">
                  Assets
                </p>
                <p className="text-2xl font-bold text-[#00A896]">
                  {formatCurrency(netWorth.totalAssets)}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <p className="text-[#f4f0e1] text-xs font-medium tracking-wide uppercase">
                  Debts
                </p>
                <p className="text-2xl font-bold text-[#7B0323]">
                  {formatCurrency(netWorth.totalDebts)}
                </p>
              </div>
            </div>
          </div>
          <div className="w-[60%] min-w-[400px] pl-6">
            <LineChart tableData={tableData} />
          </div>
        </div>

        <MonthDashboard
          key={date.toUTCString()}
          sections={data}
          date={date}
          setSections={setSections}
          addSection={addSection}
        />
      </div>
    </div>
  );
}
