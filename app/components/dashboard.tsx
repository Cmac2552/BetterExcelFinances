"use client";
import { useEffect, useRef, useState } from "react";
import FinancialInputs from "./financialInputs";
import LineChart, { TableData } from "./Line";
import { FinancialSectionData } from "./financialSections.jsx";
import { signOut } from "next-auth/react";
import { Tailspin } from "ldrs/react";
import "ldrs/react/Tailspin.css";
import NewSection from "./SectionModal";
import DateInput from "./dateInput";
import { gatherDataForMonth, generateNewTableData } from "../utils/monthUtils";
import { sortSections } from "../utils/accountUtils";

//currently god component
//NEEDS REFACTOR
export default function Dashboard() {
  const [data, setData] = useState<FinancialSectionData[]>([]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  });
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [allSectionsOpen, setAllSectionsOpen] = useState(false);
  const previousDateRef = useRef<Date>(null);

  const handleMonthChange = (monthInput: string) => {
    const parts = monthInput.split("-");
    if (parts.length === 2) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);

      if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
        const newDateAtUTCMidnight = new Date(Date.UTC(year, month - 1, 1));

        if (date.getTime() !== newDateAtUTCMidnight.getTime()) {
          setDate(newDateAtUTCMidnight);
        }
      } else {
        console.error("Invalid year or month parsed from input:", monthInput);
      }
    } else {
      console.error("Invalid month input format received:", monthInput);
    }
  };

  const addSection = (newSection: FinancialSectionData) => {
    const newSections = [...data, newSection];
    setData(sortSections(newSections));
    updateTableData(newSections);
  };

  const updateTableData = async (sections: any[]) => {
    const update = {
      date: date,
      sectionValue: gatherDataForMonth(sections),
    };
    const response = await fetch("/api/table-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update),
    });
    if (response.ok) {
      setTableData(generateNewTableData(update, tableData, date));
    }
  };

  const setSections = (newSections: FinancialSectionData[]) => {
    const sortedSections = sortSections(newSections);
    setData(sortedSections);
    updateTableData(sortedSections);
  };

  useEffect(() => {
    if (previousDateRef.current?.getTime() === date.getTime()) {
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sections?date=${date.toISOString()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const sectionDataResult = await res.json();
        setData(sortSections(sectionDataResult as FinancialSectionData[]));
        const tableDataResult = await fetch("/api/table-data", {
          cache: "no-store",
        });
        if (!tableDataResult.ok) {
          throw new Error("Failed to fetch Table Data");
        }
        const tableData = await tableDataResult.json();
        if (tableData.error) {
          throw new Error(tableData.error);
        }
        setTableData(tableData);
        previousDateRef.current = date;
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);
  return (
    <main className="min-h-screen">
      <div className="w-full h-[4rem] bg-[#141414] mb-4 flex items-center justify-between px-4 border-b-2 border-[#f4f0e1]">
        <h1 className="text-3xl text-[#f4f0e1] ml-4">BetterExcelFinances</h1>
        <div className="flex gap-4">
          <button
            className="bg-[#f4f0e1] px-4 py-2 rounded-md hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 font-medium"
            onClick={() => signOut()}
          >
            Log Out
          </button>
        </div>
      </div>
      <div className="z-10 w-full h-[40rem]">
        <div className="w-full flex items-center justify-center flex-col">
          <div className="w-full h-[450px]">
            <LineChart tableData={tableData} />
          </div>
          <div className="flex items-center gap-x-4 w-full pl-4 pr-2">
            <div className="grid grid-cols-2 gap-4">
              <DateInput onMonthChange={handleMonthChange} />
              <NewSection
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
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Tailspin size="75" stroke="5" speed="0.9" color="#f4f0e1" />
            </div>
          ) : (
            <div className="w-full">
              <FinancialInputs
                sections={data}
                date={date}
                setSections={setSections}
                allSectionsOpen={allSectionsOpen}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
