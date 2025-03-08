"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
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
interface NewSectionProps {
  date: Date;
  onSectionAddition: (data: FinancialSectionData) => void;
}

export default function AddButton({
  date,
  onSectionAddition,
}: NewSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [moneyInputs, setMoneyInputs] = useState<number[]>([0]);
  const [nameInputs, setNameInputs] = useState<string[]>([""]);
  const [title, setTitle] = useState("");
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

  const handleDataClear = () => {
    setTitle("");
    setNameInputs([""]);
    setMoneyInputs([0]);
  };

  const handleSubmit = async () => {
    try {
      if (!session) {
        console.log("Not Logged In");
        return;
      }
      const newDate = new Date(date.getUTCFullYear(), date.getUTCMonth());
      const response = await fetch("/api/section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          fieldNames: nameInputs,
          fieldValues: moneyInputs,
          month: newDate,
        }),
      });
      if (response.ok) {
        setIsOpen(false);
        const responseBody = await response.json();
        onSectionAddition({
          id: responseBody.id,
          month: date,
          title: title,
          values: responseBody.values,
          userId: session.user.id,
        });
        handleDataClear();
      }
    } catch (error) {
      console.log("ERROR", error);
    }
  };

  return (
    <Dialog onOpenChange={handleDataClear}>
      <DialogTrigger asChild>
        <button className="rounded-full w-10 h-10 inline-flex items-center justify-center text-sm font-medium bg-white text-black hover:bg-gray-200 m-4">
          +
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add Account</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <input
              placeholder="Title"
              value={title}
              className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => setTitle(event.target.value)}
            />
            {moneyInputs.map((input, index) => (
              <div className="flex gap-2" key={index + "div"}>
                <input
                  key={index + "input"}
                  value={nameInputs[index]}
                  onChange={(event) => handleNameChange(index, event)}
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <DialogClose asChild>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-700 bg-gray-800 text-white hover:bg-gray-700 h-10 px-4 py-2"
                  onClick={handleDataClear}
                >
                  Cancel
                </button>
              </DialogClose>
              <DialogClose asChild>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black hover:bg-gray-200 h-10 px-4 py-2 ml-2"
                  onClick={handleSubmit}
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
