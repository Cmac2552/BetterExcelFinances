"use client";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field";

export default function Input({
  label,
  sendData,
}: {
  label: string;
  sendData: Function;
}) {
  const [state, setValue] = useState(0);
  function handleBlur() {
    sendData(state);
  }
  return (
    <div className="flex items-center">
      <label className="text-white mr-2">{label}</label>
      <CurrencyInput
        id={label}
        name={label}
        placeholder="Please enter a number"
        defaultValue={0}
        decimalsLimit={2}
        prefix="$"
        onValueChange={(value, name, values) => {
          if (values?.float) {
            setValue(values?.float);
          }
        }}
        onBlur={handleBlur}
        className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 my-1"
      />
    </div>
  );
}
