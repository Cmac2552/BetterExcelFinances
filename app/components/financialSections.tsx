import { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";

export type FinancialSectionData = {
  id: number;
  month: Date;
  title: String;
  values: FinancialSectionItemData[];
  userId: string;
};

export type FinancialSectionItemData = {
  id?: number;
  label: string;
  value: number;
  sectionId?: number;
};

interface FinancialSectionProps {
  section: FinancialSectionData;
  open: boolean;
}

export default function FinancialSection({
  section,
  open,
}: FinancialSectionProps) {
  const [sectionData, setSectionData] = useState(section);
  useEffect(() => {
    setSectionData(section);
  }, [section]);
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
          parentId: section.id,
          sectionLabel: value.label,
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
    <div className="my-4 w-1/3">
      <h2 className="text-white text-2xl ">
        {section.title} - ${sectionValue.toLocaleString()}
      </h2>
      <div className="w-full grid grid-cols-1">
        <div className="flex flex-col justify-center w-full">
          {open &&
            sectionData.values.map(
              (value: FinancialSectionItemData, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-[4%_30%_55%_11%] w-full"
                >
                  <div></div>
                  <div className="flex items-center ">
                    <label
                      className="text-white mr-2"
                      key={index + value.label}
                    >
                      {value.label}
                    </label>
                  </div>
                  <CurrencyInput
                    key={index + value.label + "currentyInput"}
                    id={value.label}
                    name={value.label}
                    placeholder="Please enter a number"
                    defaultValue={value.value}
                    decimalsLimit={2}
                    prefix="$"
                    className="w-[90%] px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 my-1 mx-[10%]"
                    onBlur={(event) => handleItemValueChange(event, value)}
                  />
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
}
