"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FinancialSectionData } from "./financialSections";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { NumericFormat } from "react-number-format";
interface NewSectionProps {
  date: Date;
  modalTitle: string;
  trigger: any;
  lineItemValues?: number[];
  lineItemNames?: string[];
  givenTitle?: string;
  givenAsset?: string;
  givenId?: number;
  onSectionAddition: (data: FinancialSectionData) => void;
}

enum AssetClass {
  ASSET = "ASSET",
  DEBT = "DEBT",
}

export default function SectionModal({
  date,
  modalTitle,
  trigger,
  lineItemValues,
  lineItemNames,
  givenTitle,
  givenAsset,
  givenId,
  onSectionAddition,
}: NewSectionProps) {
  const [moneyInputs, setMoneyInputs] = useState<number[]>(
    lineItemValues || [0]
  );
  const [nameInputs, setNameInputs] = useState<string[]>([""]);
  const [title, setTitle] = useState("");
  const [assetClass, setAssetClass] = useState<boolean>(givenAsset !== "ASSET");
  const { data: session } = useSession();
  const handleInputChange = (index: number, event: number) => {
    if (event) {
      const currentMoneyInputs = [...moneyInputs];
      currentMoneyInputs[index] = event;
      setMoneyInputs(currentMoneyInputs);
    }
  };
  const handleAddItem = () => {
    setMoneyInputs([...moneyInputs, 0]);
  };

  const handleNameChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const currentNameInputs = [...nameInputs];
    currentNameInputs[index] = event.target.value;
    setNameInputs(currentNameInputs);
  };

  const handleDataClear = (open: boolean) => {
    if (!open && !givenId) {
      setTitle("");
      setNameInputs([""]);
      setMoneyInputs([0]);
    }
  };

  useEffect(() => {
    if (lineItemValues) {
      setMoneyInputs(lineItemValues);
    }
    if (lineItemNames) {
      setNameInputs(lineItemNames);
    }
    if (givenTitle) {
      setTitle(givenTitle);
    }
  }, [lineItemNames, lineItemValues]);

  const handleSubmit = async (method: string, uri: string) => {
    try {
      if (!session) {
        console.log("Not Logged In");
        return;
      }
      const newDate = new Date(date.getUTCFullYear(), date.getUTCMonth());
      const response = await fetch(uri, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          fieldNames: nameInputs,
          fieldValues: moneyInputs,
          month: newDate,
          assetClass: assetClass ? AssetClass.DEBT : AssetClass.ASSET,
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();
        onSectionAddition({
          id: responseBody.id,
          month: date,
          title: title,
          values: responseBody.values,
          userId: session.user.id,
          assetClass: assetClass ? AssetClass.DEBT : AssetClass.ASSET,
        });
      }
    } catch (error) {
      console.log("ERROR", error);
    }
  };
  const handleAdjust = async () => {
    if (givenId) {
      await handleSubmit("PUT", "/api/section/" + givenId);
    } else {
      await handleSubmit("POST", "/api/section");
    }
  };

  const onCheckedChange = (checked: boolean) => {
    setAssetClass(checked);
  };

  return (
    <Dialog onOpenChange={(open) => handleDataClear(open)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#141414] border border-[#141414]">
        <DialogHeader>
          <DialogTitle className="text-[#f4f0e1]">{modalTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-3">
            <input
              placeholder="Account Name"
              value={title}
              className="flex h-10 w-full rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => setTitle(event.target.value)}
            />
            {moneyInputs.map((input, index) => (
              <div className="flex gap-2" key={index + "div"}>
                <input
                  key={index + "input"}
                  value={nameInputs[index]}
                  placeholder="(e.g. Travel, Emergency Fund)"
                  onChange={(event) => handleNameChange(index, event)}
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <NumericFormat
                  key={index + "currentyInput"}
                  value={moneyInputs[index]}
                  thousandSeparator={true}
                  prefix="$"
                  fixedDecimalScale={true}
                  allowNegative={false}
                  placeholder="Please enter a number"
                  onValueChange={(values) => {
                    handleInputChange(index, Number(values.floatValue));
                  }}
                  className="flex h-10 rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-1/2"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-700 bg-[#1E2228] text-[#f4f0e1] hover:bg-gray-700 h-10 px-4 py-2"
            >
              Add Additional Item
            </button>
            <DialogFooter className="sm:justify-end">
              <div className="self-center flex gap-1 justify-center items-center">
                <span className="text-[#f4f0e1]">Asset</span>
                <Switch
                  className="data-[state=unchecked]:bg-[#00A896] data-[state=checked]:bg-[#7B0323]"
                  checked={assetClass}
                  onCheckedChange={(checked) => onCheckedChange(checked)}
                />
                <span className="text-[#f4f0e1]">Debt</span>
              </div>

              <DialogClose asChild>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-700 bg-[#1E2228] text-[#f4f0e1] hover:bg-gray-700 h-10 px-4 py-2"
                  onClick={(event) => handleDataClear(false)}
                >
                  Cancel
                </button>
              </DialogClose>
              <DialogClose asChild>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#f4f0e1] text-black hover:bg-gray-200 h-10 px-4 py-2 ml-2"
                  onClick={handleAdjust}
                >
                  Submit
                </button>
              </DialogClose>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
