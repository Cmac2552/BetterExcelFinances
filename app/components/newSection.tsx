"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
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
interface NewSectionProps {
  date: Date;
  modalTitle: string;
  trigger: any;
  lineItemValues?: number[];
  lineItemNames?: string[];
  givenTitle?: string;
  giventAsset?: string;
  givenId?: number;
  onSectionAddition: (data: FinancialSectionData) => void;
}

enum AssetClass {
  ASSET = "ASSET",
  DEBT = "DEBT",
}

export default function NewSection({
  date,
  modalTitle,
  trigger,
  lineItemValues,
  lineItemNames,
  givenTitle,
  giventAsset,
  givenId,
  onSectionAddition,
}: NewSectionProps) {
  const [moneyInputs, setMoneyInputs] = useState<number[]>(
    lineItemValues || [0]
  );
  const [nameInputs, setNameInputs] = useState<string[]>([""]);
  const [title, setTitle] = useState("");
  const [assetClass, setAssetClass] = useState<boolean>(false);
  const { data: session } = useSession();
  const handleInputChange = (index: number, event: string | undefined) => {
    if (event) {
      const currentMoneyInputs = [...moneyInputs];
      currentMoneyInputs[index] = parseInt(event);
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
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">{modalTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-3">
            <input
              placeholder="Title"
              value={title}
              className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => setTitle(event.target.value)}
            />
            {moneyInputs.map((input, index) => (
              <div className="flex gap-2" key={index + "div"}>
                <input
                  key={index + "input"}
                  value={nameInputs[index]}
                  onChange={(event) => handleNameChange(index, event)}
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <CurrencyInput
                  key={index}
                  placeholder="$0"
                  value={moneyInputs[index]}
                  defaultValue={moneyInputs[index]}
                  decimalsLimit={2}
                  prefix="$"
                  onValueChange={(event) => handleInputChange(index, event)}
                  className="flex h-10 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-1/2"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-700 bg-gray-800 text-white hover:bg-gray-700 h-10 px-4 py-2"
            >
              Add Additional Item
            </button>
            <DialogFooter className="sm:justify-end">
              <span className="text-white">Asset</span>
              <Switch
                checked={assetClass}
                onCheckedChange={(checked) => onCheckedChange(checked)}
              />
              <span className="text-white">Debt</span>
              <DialogClose asChild>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-700 bg-gray-800 text-white hover:bg-gray-700 h-10 px-4 py-2"
                  onClick={(event) => handleDataClear(false)}
                >
                  Cancel
                </button>
              </DialogClose>
              <DialogClose asChild>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black hover:bg-gray-200 h-10 px-4 py-2 ml-2"
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
