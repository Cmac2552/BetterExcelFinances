import { useState } from "react";
import CurrencyInput from "react-currency-input-field";

export type FinancialSectionData = {
  month: Date;
  title: String;
  values: FinancialSectionItemData[];
  userId: number;
};

type FinancialSectionItemData = {
  id: number;
  label: string;
  value: number;
  sectionId: number;
};

interface FinancialSectionProps {
  section: FinancialSectionData;
}

export default function FinancialSection({ section }: FinancialSectionProps) {
  const [sectionData, setSectionData] = useState(section);
  const sectionValue = sectionData.values.reduce(
    (finalValue: number, currentValue: FinancialSectionItemData) =>
      finalValue + currentValue.value,
    0
  );

  const handleItemValueChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    value: FinancialSectionItemData
  ) => {
    const newValue = parseInt(
      e.target.value.slice(1, e.target.value.length).replaceAll(",", "")
    );
    if (newValue === value.value) {
      return;
    }
    try {
      const response = await fetch("/api/section", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: value.id,
          value: newValue,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        const newSectionData = {
          ...sectionData,
          values: sectionData.values.map((value: FinancialSectionItemData) =>
            value.id === responseData.id ? responseData : value
          ),
        };
        setSectionData(newSectionData);
      }
    } catch (error) {
      console.log("somethingbroke", error);
    }
  };

  return (
    <div className="my-4">
      <h2 className="text-white text-2xl ">
        {section.title} - ${sectionValue.toLocaleString()}
      </h2>
      <div className="w-1/2 ml-2">
        <form>
          {sectionData.values.map(
            (value: FinancialSectionItemData, index: number) => (
              <div key={index} className="flex items-center">
                <label className="text-white mr-2" key={index + value.label}>
                  {value.label}
                </label>
                <CurrencyInput
                  key={index + value.label + "currentyInput"}
                  id={value.label}
                  name={value.label}
                  placeholder="Please enter a number"
                  defaultValue={value.value}
                  decimalsLimit={2}
                  prefix="$"
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 my-1 min-w-[15rem] mx-4"
                  onBlur={(event) => handleItemValueChange(event, value)}
                />
              </div>
            )
          )}
        </form>
      </div>
    </div>
  );
}
