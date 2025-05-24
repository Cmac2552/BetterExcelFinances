import { FinancialSectionData, FinancialSectionItemData } from "../components/financialSections";
import { TableData } from "../components/Line";

export const generateNewTableData = (update: {
    date: Date;
    sectionValue: number;
  }, tableData: TableData[], date: Date) => {
    return tableData.map((monthData) => {
      if (
        monthData?.month ===
        monthNames[date.getUTCMonth()] + " " + date.getUTCFullYear()
      ) {
        return { ...monthData, value: update.sectionValue };
      }
      return monthData;
    });
  };

  export const gatherDataForMonth = (
      sectionsToProcess: FinancialSectionData[]
    ): number => {
      return sectionsToProcess.reduce(
        (grandTotal: number, sectionData: FinancialSectionData) => {
          const sectionItemsSum = sectionData.values.reduce(
            (sum: number, item: FinancialSectionItemData) => sum + item.value,
            0
          );
          const valueForThisSection =
            sectionData.assetClass === "ASSET"
              ? sectionItemsSum
              : -sectionItemsSum;
          return grandTotal + valueForThisSection;
        },
        0
      );
    };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];