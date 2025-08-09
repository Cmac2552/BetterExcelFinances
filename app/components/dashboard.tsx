"use client";
import { useState } from "react";
import { LineChart } from "./Line";
import { FinancialSectionData, TableData } from "../types";
import { MonthDashboard } from "./MonthDashboard";

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

  return (
    <div className="z-10 w-full h-[80%]">
      <div className="w-full flex items-center justify-center flex-col">
        <div className="w-full h-[450px]">
          <LineChart tableData={tableData} />
        </div>
        <MonthDashboard
          key={date.toUTCString()}
          sections={sections}
          tableData={tableData}
          setTableData={setTableData}
          date={date}
        />
      </div>
    </div>
  );
}
