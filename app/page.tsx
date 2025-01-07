"use client";
import { useEffect, useRef, useState } from "react";
import FinancialInputs from "./components/financialInputs.tsx";
import LineChart from "./components/Line.tsx";
import { FinancialSectionData } from "./components/financialSections.jsx";
import { signIn, signOut } from "next-auth/react";

export default function Home() {
  const [data, setData] = useState<FinancialSectionData[]>([]);
  const [date, setDate] = useState(new Date());
  const previousDateRef = useRef<Date>(null);
  const handleDataChange = (data: string) => {
    setDate(new Date(data));
  };
  const addSection = (newSection: any) => {
    setData((data) => [...data, newSection]);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (date !== null && previousDateRef.current !== date) {
        try {
          const res = await fetch(`/api/sections?date=${date}`, {
            cache: "no-store", // Ensure fresh data on each request
          });
          if (!res.ok) {
            throw new Error("Failed to fetch data");
          }
          previousDateRef.current = date;
          const result = await res.json();
          setData(result);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchData();
  }, [date]);
  return (
    <main className="min-h-screen">
      <div className="z-10 w-full h-[40rem]">
        <FinancialInputs
          sections={data}
          onMonthChange={handleDataChange}
          onSectionAddition={addSection}
          date={date}
        />
        <LineChart />
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
