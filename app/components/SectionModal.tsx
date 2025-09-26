"use client";
import { useEffect, useState, FormEvent } from "react";
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
import { GoXCircleFill } from "react-icons/go";
import { FinancialSectionData, FinancialSectionItemData } from "../types";
import { saveSection } from "../lib/actions"; // Server Action
import { Button } from "@/components/ui/button";

interface Props {
  date: Date;
  modalTitle: string;
  trigger: React.ReactNode;
  lineItemValues?: number[];
  lineItemNames?: string[];
  givenTitle?: string;
  givenAsset?: string; // Match server action type
  givenId?: number;
  onSectionAddition: (data: FinancialSectionData) => void;
}

export function SectionModal({
  date,
  modalTitle,
  trigger,
  lineItemValues,
  lineItemNames,
  givenTitle,
  givenAsset,
  givenId,
  onSectionAddition,
}: Readonly<Props>) {
  const [isOpen, setIsOpen] = useState(false);
  const [moneyInputs, setMoneyInputs] = useState<number[]>([0]);
  const [nameInputs, setNameInputs] = useState<string[]>([""]);
  const [title, setTitle] = useState("");
  // assetClass internal state: true for DEBT, false for ASSET
  const [assetClassIsDebt, setAssetClassIsDebt] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetFormStates = () => {
    setTitle("");
    setNameInputs([""]);
    setMoneyInputs([0]);
    setAssetClassIsDebt(false); // Default to ASSET
    setErrorMessage(null);
  };

  const populateFormForEditing = () => {
    if (givenId) {
      setTitle(givenTitle ?? "");
      setNameInputs(lineItemNames || [""]);
      setMoneyInputs(lineItemValues || [0]);
      setAssetClassIsDebt(givenAsset === "DEBT");
    } else {
      resetFormStates();
    }
  };

  useEffect(() => {
    if (isOpen) {
      populateFormForEditing();
    }
  }, [isOpen, givenId, givenTitle, givenAsset, lineItemNames, lineItemValues]);

  const handleInputChange = (index: number, value: number | undefined) => {
    const currentMoneyInputs = [...moneyInputs];
    currentMoneyInputs[index] = value ?? 0;
    setMoneyInputs(currentMoneyInputs);
  };

  const handleAddItem = () => {
    setMoneyInputs([...moneyInputs, 0]);
    setNameInputs([...nameInputs, ""]);
  };

  const handleNameChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const currentNameInputs = [...nameInputs];
    currentNameInputs[index] = event.target.value;
    setNameInputs(currentNameInputs);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      if (!givenId) {
        resetFormStates();
      }
    }
  };

  const clientHandleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Account Name is required.");
      setIsSubmitting(false);
      return;
    }
    if (
      nameInputs.some((name) => !name.trim()) ||
      moneyInputs.some((value) => isNaN(value))
    ) {
      setErrorMessage(
        "All item names must be filled and values must be valid numbers."
      );
      setIsSubmitting(false);
      return;
    }

    const currentAssetClass = assetClassIsDebt ? "DEBT" : "ASSET";
    const newDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );

    const actionData = {
      title: title,
      fieldNames: nameInputs.filter((name) => name.trim() !== ""),
      fieldValues: moneyInputs.slice(
        0,
        nameInputs.filter((name) => name.trim() !== "").length
      ),
      month: newDate,
      assetClass: currentAssetClass,
      ...(givenId && { id: givenId }),
    };

    if (actionData.fieldNames.length === 0) {
      setErrorMessage("At least one item must be added.");
      setIsSubmitting(false);
      return;
    }

    const result = await saveSection(actionData);

    if (result.success && result.section) {
      const financialSectionItems: FinancialSectionItemData[] =
        result.section.values.map((item) => ({
          id: item.id,
          label: item.label,
          value: item.value,
          sectionId: result.section.id,
        }));

      onSectionAddition({
        id: result.section.id,
        month: result.section.month,
        title: result.section.title,
        values: financialSectionItems,
        userId: result.section.userId,
        assetClass: result.section.assetClass,
      });
      setIsOpen(false);
      if (!givenId) {
        resetFormStates();
      }
    } else {
      console.error("Failed to save section:", result.error);
      setErrorMessage(result.error ?? "An unknown error occurred.");
    }
    setIsSubmitting(false);
  };

  const onSwitchCheckedChange = (checked: boolean) => {
    setAssetClassIsDebt(checked);
  };

  const handleRowRemove = (rowIndex: number) => {
    if (moneyInputs.length > 1) {
      setMoneyInputs(moneyInputs.filter((_, index) => index !== rowIndex));
      setNameInputs(nameInputs.filter((_, index) => index !== rowIndex));
    } else {
      setMoneyInputs([0]);
      setNameInputs([""]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-[#141414] border border-[#141414]">
        <DialogHeader>
          <DialogTitle className="text-[#f4f0e1]">{modalTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={clientHandleSubmit} className="flex flex-col space-y-4">
          <div className="grid flex-1 gap-3">
            <input
              name="title"
              placeholder="Account Name"
              value={title}
              className="flex h-10 w-full rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            {nameInputs.map((_, index) => (
              <div className="flex gap-2 items-center" key={`item-${index}`}>
                <input
                  name={`fieldNames[${index}]`}
                  value={nameInputs[index]}
                  placeholder="(e.g. Travel, Emergency Fund)"
                  onChange={(event) => handleNameChange(index, event)}
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <NumericFormat
                  name={`fieldValues[${index}]`}
                  value={moneyInputs[index]}
                  thousandSeparator={true}
                  prefix="$"
                  fixedDecimalScale={true}
                  allowNegative={false}
                  placeholder="Amount"
                  onValueChange={(values) => {
                    handleInputChange(index, values.floatValue);
                  }}
                  className="flex h-10 rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-1/2"
                />
                <Button
                  type="button"
                  onClick={() => handleRowRemove(index)}
                  className="text-[#f4f0e1]"
                  title="Remove Account Item"
                  variant="ghost"
                >
                  <GoXCircleFill />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={handleAddItem}
              variant="secondary"
              className="text-sm"
            >
              Add Additional Item
            </Button>
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            <DialogFooter className="sm:justify-end mt-4">
              <div className="self-center flex gap-1 justify-center items-center">
                <span className="text-[#f4f0e1]">Asset</span>
                <Switch
                  name="assetClass"
                  className="data-[state=unchecked]:bg-[#00A896] data-[state=checked]:bg-[#7B0323]"
                  checked={assetClassIsDebt}
                  onCheckedChange={onSwitchCheckedChange}
                />
                <span className="text-[#f4f0e1]">Debt</span>
              </div>

              <DialogClose asChild>
                <Button type="button" variant="secondary" className="text-sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                className="text-sm"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
