"use client";
import { useEffect, useRef, useState } from "react";
import FinancialInputs from "./components/financialInputs.tsx";
import LineChart from "./components/Line.tsx";
import { FinancialSectionData } from "./components/financialSections.jsx";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function Home() {
  const [data, setData] = useState<FinancialSectionData[]>([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const previousDateRef = useRef<Date>(null);
  const { data: session } = useSession();
  const handleMonthChange = (month: string) => {
    const newMonth = new Date(month);
    const newDateUTC = new Date(
      newMonth.getUTCFullYear(),
      newMonth.getUTCMonth(),
      newMonth.getUTCDate(),
      newMonth.getUTCHours(),
      newMonth.getUTCMinutes(),
      newMonth.getUTCSeconds()
    );
    if (newDateUTC.getTime() !== date.getTime()) {
      setDate(newDateUTC);
      previousDateRef.current = date;
    }
  };
  const addSection = (newSection: any) => {
    setData((data) => [...data, newSection]);
  };
  const setSections = (sections: any[]) => {
    setData(sections);
  };

  const sortSections = (sections: FinancialSectionData[]) => {
    return sections.sort(
      (section1, section2) => section1.values.length - section2.values.length
    );
  };

  useEffect(() => {
    if (previousDateRef.current?.getTime() === date.getTime()) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sections?date=${date}`, {
          cache: "no-store", // Ensure fresh data on each request
        });
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await res.json();
        setData(sortSections(result));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    previousDateRef.current = date;
  }, [date]);
  return (
    <main className="min-h-screen">
      <div className="w-full h-[4rem] bg-gray-950 mb-4 flex items-center justify-between px-4">
        <h1 className="text-3xl text-white ml-4">BetterFinance</h1>
        <div className="flex gap-4">
          {!session ? (
            <button
              className="bg-white px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
              onClick={() => signIn("google")}
            >
              Log In
            </button>
          ) : (
            <button
              className="bg-white px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
              onClick={() => signOut()}
            >
              Log Out
            </button>
          )}
        </div>
      </div>
      <div className="z-10 w-full h-[40rem]">
        {loading && chartLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        ) : (
          <div>
            <LineChart lineLoading={setChartLoading} />
            <FinancialInputs
              sections={data}
              onMonthChange={handleMonthChange}
              onSectionAddition={addSection}
              date={date}
              setSections={setSections}
            />
          </div>
        )}
      </div>
    </main>
  );
}
