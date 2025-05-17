"use client";
import { useEffect, useRef, useState } from "react";
import FinancialInputs from "./financialInputs";
import LineChart from "./Line";
import {
  FinancialSectionData,
  FinancialSectionItemData,
} from "./financialSections.jsx";
import { signOut } from "next-auth/react";
import { Tailspin } from "ldrs/react";
import "ldrs/react/Tailspin.css";

export default function Dashboard() {
  const [data, setData] = useState<FinancialSectionData[]>([]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  });
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
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
    setData((currentData) => {
      const combinedData = [...currentData, newSection];
      const sortedNewData = sortSections(combinedData);
      setTableData(sortedNewData);
      return sortedNewData;
    });
  };

  const setTableData = async (sections: any[]) => {
    const response = await fetch("/api/table-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: date,
        sectionValue: gatherDataForMonth(sections),
      }),
    });
    if (response.ok) {
      console.log("ok");
    }
  };

  const setSections = (newSections: FinancialSectionData[]) => {
    const sortedSections = sortSections(newSections);
    setData(sortedSections);
    setTableData(sortedSections);
  };

  const gatherDataForMonth = (
    sectionsToProcess: FinancialSectionData[]
  ): number => {
    return sectionsToProcess.reduce(
      (grandTotal: number, sectionData: FinancialSectionData) => {
        const sectionItemsSum = sectionData.values.reduce(
          (sum: number, item: FinancialSectionItemData) => sum + item.value,
          0
        );
        const valueForThisSection =
          sectionData.assetClass === "ASSET"
            ? sectionItemsSum
            : -sectionItemsSum;
        return grandTotal + valueForThisSection;
      },
      0
    );
  };

  const sortSections = (sections: FinancialSectionData[]) => {
    return [...sections].sort((a, b) => {
      const lengthDiff = a.values.length - b.values.length;

      if (lengthDiff !== 0) return lengthDiff;

      return a.title.localeCompare(b.title);
    });
  };

  useEffect(() => {
    if (previousDateRef.current?.getTime() === date.getTime()) {
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(date.toISOString());
        const res = await fetch(`/api/sections?date=${date.toISOString()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await res.json();
        setData(sortSections(result as FinancialSectionData[]));
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
            className="bg-[#f4f0e1] px-4 py-2 rounded-md hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"
            onClick={() => signOut()}
          >
            Log Out
          </button>
        </div>
      </div>
      <div className="z-10 w-full h-[40rem]">
        {loading && chartLoading ? (
          <div className="flex justify-center items-center h-full">
            <Tailspin size="75" stroke="5" speed="0.9" color="#f4f0e1" />
          </div>
        ) : (
          <div className="w-full flex items-center justify-center flex-col">
            <div className="w-full h-full">
              <LineChart lineLoading={setChartLoading} />
            </div>
            <div className="w-full">
              <FinancialInputs
                sections={data}
                onMonthChange={handleMonthChange}
                onSectionAddition={addSection}
                date={date}
                setSections={setSections}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
