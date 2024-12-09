import { useState } from "react";
import AddButton from "./addButton";
import FinancialSection from "./financialSections";
import NewSection from "./newSection";

export default function FinancialInputs() {
  return (
    // make this a grid
    <div className="flex flex-col justify-around">
      <div className="grid-cols-2 ">
        <input
          type="month"
          id="month-picker"
          name="month-picker"
          className=" px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-[12rem]"
        />
        <NewSection />
      </div>
      <FinancialSection />
      {/* <FinancialSection />
      <FinancialSection /> */}
    </div>
  );
}
