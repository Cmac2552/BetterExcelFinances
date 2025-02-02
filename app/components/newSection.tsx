"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { FinancialSectionData } from "./financialSections";

interface NewSectionProps {
  data: Date;
  onSectionAddition: (data: FinancialSectionData) => void;
}

export default function AddButton({
  data,
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

  const handleSubmit = async () => {
    try {
      if (!session) {
        console.log("Not Logged In");
        return;
      }
      const response = await fetch("/api/section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          fieldNames: nameInputs,
          fieldValues: moneyInputs,
          month: data,
        }),
      });
      if (response.ok) {
        setIsOpen(false);
        const responseBody = await response.json();
        onSectionAddition({
          id: responseBody.id,
          month: data,
          title: title,
          values: responseBody.values,
          userId: session.user.id,
        });
        setTitle("");
        setNameInputs([""]);
        setMoneyInputs([0]);
      }
    } catch (error) {
      console.log("ERROR", error);
    }
  };

  return (
    <>
      <button
        className="w-11 h-11 bg-white m-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        +
      </button>
      <div hidden={!isOpen}>
        <input
          placeholder="Title"
          value={title}
          className=" px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-[12rem]"
          onChange={(event) => setTitle(event.target.value)}
        />
        {moneyInputs.map((input, index) => (
          <div className="flex" key={index + "div"}>
            <input
              key={index + "input"}
              value={nameInputs[index]}
              onChange={(event) => handleNameChange(index, event)}
              className=" px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-[12rem]"
            />
            <CurrencyInput
              key={index}
              placeholder="$0"
              value={moneyInputs[index]}
              defaultValue={moneyInputs[index]}
              decimalsLimit={2}
              prefix="$"
              onValueChange={(event) => handleInputChange(index, event)}
              className="w-1/4 px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 my-1"
            />
          </div>
        ))}
        <button className="h-11 bg-white m-4" onClick={handleAddItem}>
          Add Additional Item
        </button>
        <button className="h-11 bg-white m-4" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </>
  );
}
