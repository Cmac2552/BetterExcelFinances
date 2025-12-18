import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GoXCircleFill } from "react-icons/go";
import { TiPencil } from "react-icons/ti";
import { FaMoneyBill1 } from "react-icons/fa6";
import { SectionModal } from "./SectionModal";
import { FinancialSectionData, FinancialSectionItemData } from "../types";
import {
  deleteSection,
  deleteSectionItem,
  updateSectionItem,
} from "../lib/actions";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";

interface Props {
  section: FinancialSectionData;
  open: boolean;
  onSectionModify: (data: FinancialSectionData) => void;
  sectionDelete: (data: number) => void;
  date: Date;
}

export function FinancialSection({
  section,
  open,
  onSectionModify,
  sectionDelete,
  date,
}: Readonly<Props>) {
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
    newValue: number,
    value: FinancialSectionItemData
  ) => {
    if (newValue === value.value) {
      return;
    }

    try {
      const responseData = await updateSectionItem(
        value.id as number,
        Number.isNaN(newValue) ? 0 : newValue
      );
      const newSectionData = {
        ...sectionData,
        values: sectionData.values.map((value: FinancialSectionItemData) =>
          value.id === responseData.id ? responseData : value
        ),
      };
      onSectionModify(newSectionData);
    } catch (error) {
      console.error("somethingbroke", error);
    }
  };

  const debouncedOnChange = debounce(handleItemValueChange, 750);

  const onSectionDelete = async () => {
    await deleteSection(sectionData.id);
    sectionDelete(sectionData.id);
  };

  const removeSectionItem = async (value: FinancialSectionItemData) => {
    await deleteSectionItem(value.id as number);
    const newSectionData = {
      ...sectionData,
      values: sectionData.values.filter(
        (item: FinancialSectionItemData) => item.id !== value.id
      ),
    };
    onSectionModify(newSectionData);
  };
  return (
    <div className="my-4 w-1/3 h-full">
      <Card className="bg-[#141414] h-full w-[95%]">
        <CardHeader className="p-2">
          <div className="flex items-center justify-between group">
            <div className="w-[55%] overflow-hidden flex">
              {sectionData.assetClass === "DEBT" ? (
                <FaMoneyBill1 className="text-[#7B0323] text-2xl w-[2rem] h-[2rem]" />
              ) : (
                <FaMoneyBill1 className="text-[#00A896] text-2xl w-[2rem] h-[2rem]" />
              )}
              <span className="text-[#f4f0e1] text-2xl overflow-hidden text-ellipsis whitespace-nowrap ml-2">
                {section.title}
              </span>
            </div>
            <div className="flex justify-end invisible mr-1 text-[#f4f0e1] ml-auto group-hover:visible">
              <SectionModal
                date={date}
                onSectionAddition={onSectionModify}
                modalTitle="Add Account"
                trigger={
                  <Button title="Edit Account" size="icon-slim" variant="ghost">
                    <TiPencil />
                  </Button>
                }
                lineItemValues={sectionData.values.map((value) => value.value)}
                lineItemNames={sectionData.values.map((value) => value.label)}
                givenTitle={sectionData.title}
                givenAsset={sectionData.assetClass}
                givenId={sectionData.id}
              />

              <Button
                onClick={onSectionDelete}
                variant="ghost"
                size="icon-slim"
                title="Delete Account"
              >
                <GoXCircleFill />
              </Button>
            </div>
            <div className=" mr-1 text-[#f4f0e1] overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="text-[#f4f0e1] text-2xl whitespace-nowrap">
                ${sectionValue.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>
        {open && (
          <CardContent>
            <div className="w-full grid grid-cols-1">
              <div className="flex flex-col justify-center w-full items-center">
                {sectionData.values.map(
                  (value: FinancialSectionItemData, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-[4%_30%_55%_11%] w-full group"
                    >
                      <div></div>
                      <div className="flex items-center ">
                        <label
                          className="text-[#f4f0e1] mr-2"
                          key={index + value.label}
                        >
                          {value.label}
                        </label>
                      </div>
                      <NumericFormat
                        key={index + value.label + "currentyInput"}
                        id={value.label}
                        name={value.label}
                        value={value.value}
                        thousandSeparator={true}
                        prefix="$"
                        fixedDecimalScale={true}
                        allowNegative={false}
                        placeholder="Please enter a number"
                        onValueChange={(values) => {
                          debouncedOnChange(Number(values.floatValue), value);
                        }}
                        className="w-[90%] px-4 py-2 bg-[#1E2228] text-[#f4f0e1] border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-visible:ring-[#f4f0e1] placeholder-gray-400 my-1 mx-[10%]"
                      />
                      <Button
                        onClick={() => removeSectionItem(value)}
                        className="text-[#f4f0e1] ml-auto justify-self-center self-center invisible group-hover:visible"
                        variant="ghost"
                        size="icon"
                        title="Delete Account Item"
                      >
                        <GoXCircleFill />
                      </Button>
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
