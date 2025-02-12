"use client";
import { useEffect, useRef, useState } from "react";
import FinancialInputs from "./components/financialInputs.tsx";
import LineChart from "./components/Line.tsx";
import { FinancialSectionData } from "./components/financialSections.jsx";
import { signIn, signOut } from "next-auth/react";

export default function Home() {
  const [data, setData] = useState<FinancialSectionData[]>([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const previousDateRef = useRef<Date>(null);
  const handleDataChange = (data: string) => {
    const newDate = new Date(data);
    if (newDate.getTime() !== date.getTime()) {
      setDate(newDate);
      previousDateRef.current = date;
    }
  };
  const addSection = (newSection: any) => {
    setData((data) => [...data, newSection]);
  };

  useEffect(() => {
    if (!date || previousDateRef.current?.getTime() === date.getTime()) return;
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
        setData(result);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);
  return (
    <main className="min-h-screen">
      <div className="w-full h-[4rem] bg-gray-950 mb-4 flex items-center">
        <h1 className="text-3xl text-white ml-4">BetterExcel</h1>
      </div>
      <div className="z-10 w-full h-[40rem]">
        <LineChart />
        <FinancialInputs
          sections={data.sort(
            (section1, section2) =>
              section1.values.length - section2.values.length
          )}
          onMonthChange={handleDataChange}
          onSectionAddition={addSection}
          date={date}
          loading={loading}
        />
        <button className="bg-white" onClick={() => signIn("google")}>
          Log In
        </button>
        <button className="bg-white" onClick={() => signOut()}>
          Log Out
        </button>
      </div>
    </main>
  );
}
