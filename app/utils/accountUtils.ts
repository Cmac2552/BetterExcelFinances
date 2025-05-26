import { FinancialSectionData } from "../types";

export const sortSections = (sections: FinancialSectionData[]) => {
    return [...sections].sort((a, b) => {
      const lengthDiff = a.values.length - b.values.length;
      if (lengthDiff !== 0) return lengthDiff;

      return a.title.localeCompare(b.title);
    });
  };