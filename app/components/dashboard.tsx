"use client";
import { useState, useMemo } from "react";
import { LineChart } from "./Line";
import { FinancialSectionData, TableData } from "../types";
import { MonthDashboard } from "./MonthDashboard";
import { sortSections } from "../utils/accountUtils";
import { gatherDataForMonth, generateNewTableData } from "../utils/monthUtils";
import { updateTableData } from "../actions/financial";

interface Props {
  sections: FinancialSectionData[];
  tableDataInput: TableData[];
  date: Date;
}
interface NetWorthCalculation {
  totalNetWorth: number;
  totalAssets: number;
  totalDebts: number;
}

function calculateNetWorth(
  sections: FinancialSectionData[]
): NetWorthCalculation {
  let totalAssets = 0;
  let totalDebts = 0;

  sections.forEach((section) => {
    const sectionTotal = section.values.reduce(
      (sum, item) => sum + item.value,
      0
    );
    if (section.assetClass?.toLowerCase() === "asset") {
      totalAssets += sectionTotal;
    } else if (section.assetClass?.toLowerCase() === "debt") {
      totalDebts += Math.abs(sectionTotal);
    }
  });

  return {
    totalNetWorth: totalAssets - totalDebts,
    totalAssets,
    totalDebts,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function Dashboard({
  sections,
  tableDataInput,
  date,
}: Readonly<Props>) {
  const [tableData, setTableData] = useState<TableData[]>(tableDataInput);
  const [data, setData] = useState<FinancialSectionData[]>(sections);
  const netWorth = useMemo(() => calculateNetWorth(data), [data]);

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
    <div className="z-10 w-full h-[80%]">
      <div className="w-full flex items-center justify-center flex-col">
        <div className="w-full pl-[7rem] pt-8 flex flex-wrap justify-center gap-6">
          <div className="w-90  flex-shrink-0">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[#f4f0e1] text-md font-medium tracking-wide uppercase">
                  Total Net Worth
                </p>
                <h2
                  className={`text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
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
          <div className="flex-1 h-[450px] min-w-[800px]">
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
