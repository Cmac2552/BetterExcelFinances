import { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { GoXCircleFill } from "react-icons/go";
import { TiPencil } from "react-icons/ti";
import { FaMoneyBill1 } from "react-icons/fa6";
import NewSection from "./SectionModal";

export type FinancialSectionData = {
  id: number;
  month: Date;
  title: string;
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

interface SectionProps {
  section: FinancialSectionData;
  open: boolean;
  onSectionModify: (data: any) => void;
  sectionDelete: (data: number) => void;
  date: Date;
}

export default function FinancialSection({
  section,
  open,
  onSectionModify,
  sectionDelete,
  date,
}: SectionProps) {
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
      const response = await fetch("/api/sectionItem/" + value.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentid: section.id,
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

  const deleteSectionItem = async (value: FinancialSectionItemData) => {
    const response = await fetch("/api/sectionItem/" + value.id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const newSectionData = {
        ...sectionData,
        values: sectionData.values.filter(
          (item: FinancialSectionItemData) => item.id !== value.id
        ),
      };
      onSectionModify(newSectionData);
    }
  };
  return (
    <div className="my-4 w-1/3 h-full group">
      <Card className="bg-black h-full w-[95%]">
        <CardHeader className="p-2">
          <div className="flex items-center justify-between">
            <CardTitle>
              <div className="flex gap-1 items-center w-[80%]">
                {sectionData.assetClass === "DEBT" ? (
                  <FaMoneyBill1 className="text-red-500 text-2xl w-[2rem] h-[2rem]" />
                ) : (
                  <FaMoneyBill1 className="text-green-500 text-2xl w-[2rem] h-[2rem]" />
                )}
                <span className="text-white text-2xl overflow-hidden text-ellipsis whitespace-nowrap grow">
                  {section.title}
                </span>
                <span className="text-white text-2xl whitespace-nowrap">
                  ${sectionValue.toLocaleString()}
                </span>
              </div>
            </CardTitle>
            <div className="flex justify-end invisible mr-1 text-white w-full group-hover:visible">
              <NewSection
                date={date}
                onSectionAddition={onSectionModify}
                modalTitle="Add Account"
                trigger={
                  <button className="p-2 rounded-md border border-transparent hover:border-gray-400 hover:bg-gray-700 transition-all duration-300">
                    <TiPencil />
                  </button>
                }
                lineItemValues={sectionData.values.map((value) => value.value)}
                lineItemNames={sectionData.values.map((value) => value.label)}
                givenTitle={sectionData.title}
                giventAsset={sectionData.assetClass}
                givenId={sectionData.id}
              />

              <button
                onClick={onSectionDelete}
                className="p-2 rounded-md border border-transparent hover:border-gray-400 hover:bg-gray-700 transition-all duration-300"
              >
                <GoXCircleFill />
              </button>
            </div>
          </div>
        </CardHeader>
        {open && (
          <CardContent>
            <div className="w-full grid grid-cols-1 group">
              <div className="flex flex-col justify-center w-full items-center">
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

                      <button
                        onClick={() => deleteSectionItem(value)}
                        className=" text-white p-2 rounded-full border border-transparent hover:border-gray-400 hover:bg-gray-700 transition-all duration-300 ml-auto justify-self-center self-center"
                      >
                        <GoXCircleFill />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
