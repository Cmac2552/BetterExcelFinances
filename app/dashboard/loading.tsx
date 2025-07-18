import "ldrs/react/Tailspin.css";
import { Tailspin } from "ldrs/react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-[80%]">
      <Tailspin size="75" stroke="5" speed="0.9" color="#f4f0e1" />
    </div>
  );
}
