import { FinancialSectionData, FinancialSectionItemData, TableData } from "../types";


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

  export const parseNewMonth = (monthInput:string, currentDate: Date) : Date => {
    const parts = monthInput.split("-");
    if (parts.length === 2) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);

      if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
        const newDateAtUTCMidnight = new Date(Date.UTC(year, month - 1, 1));

        if (currentDate.getTime() !== newDateAtUTCMidnight.getTime()) {
          return(newDateAtUTCMidnight);
        }
      } else {
        console.error("Invalid year or month parsed from input:", monthInput);
      }
    } else {
      console.error("Invalid month input format received:", monthInput);
    }
    return currentDate;
  }

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
