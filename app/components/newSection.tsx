"use client";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field";

export default function AddButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputs, setInputs] = useState<number[]>([0]);
  const handleInputChange = (index: number, event: number) => {
    const currentInputs = [...inputs];

    if (!isNaN(event)) {
      currentInputs[index] = event;
      setInputs(currentInputs);
    }
  };

  const handleAddInput = (index: number) => {
    if (!isNaN(inputs[index])) {
      setInputs([...inputs, 0]);
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
        <input placeholder="Title" />
        {inputs.map((input, index) => (
          <CurrencyInput
            key={index}
            placeholder="Please enter a number"
            defaultValue={input}
            decimalsLimit={2}
            prefix="$"
            onValueChange={(event) => handleInputChange(index, event)}
            onBlur={() => handleAddInput(index)}
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 my-1"
          />
        ))}
      </div>
    </>
  );
}
