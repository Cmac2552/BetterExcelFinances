import { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

export type FinancialSectionData = {
  id: number;
  month: Date;
  title: String;
  values: FinancialSectionItemData[];
  userId: string;
  assetClass: string;
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
  onSectionModify: (data: any) => void;
  sectionDelete: (data: number) => void;
}

export default function FinancialSection({
  section,
  open,
  onSectionModify,
  sectionDelete,
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
      const response = await fetch("/api/section/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const responseData = await response.json();
        const newSectionData = {
          ...sectionData,
          values: sectionData.values.map((value: FinancialSectionItemData) =>
            value.id === responseData.id ? responseData : value
          ),
        };
        onSectionModify(newSectionData);
      }
    } catch (error) {
      console.log("somethingbroke", error);
    }
  };

  const onSectionDelete = async () => {
    const response = await fetch("/api/section/" + sectionData.id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.log("damn that sucks");
    }
    sectionDelete(sectionData.id);
  };

  return (
    <div className="my-4 w-1/3 h-full">
      <Card className="bg-black h-full w-[95%]">
        <CardHeader className="p-2">
          <div className="w-full flex items-center">
            <CardTitle>
              <span className="text-white text-2xl max-w-[85%] whitespace-nowrap overflow-hidden text-ellipsis">
                {section.title}
              </span>
              <span className="text-white text-2xl">
                ${sectionValue.toLocaleString()}
              </span>
            </CardTitle>
            {sectionData.assetClass === "DEBT" ? (
              <FaArrowTrendDown className="text-red-500 text-2xl" />
            ) : (
              <FaArrowTrendUp className="text-green-500 text-2xl" />
            )}
          </div>
        </CardHeader>
        {open && (
          <CardContent>
            <div className="w-full grid grid-cols-1">
              <div className="flex flex-col justify-center w-full">
                {sectionData.values.map(
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
            <div className="flex justify-end text-white w-full">
              <button onClick={onSectionDelete}>X</button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
