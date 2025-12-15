export type FinancialSectionData = {
    id: number;
    month: Date;
    title: string;
    values: FinancialSectionItemData[];
    userId: string;
    assetClass: string;
  };
  
export type FinancialSectionItemData = {
    id?: number;
    label: string;
    value: number;
    sectionId?: number;
  };

  export type TableData = {
    month: string;
    value: number;
  };

export type NetWorthCalculation = {
  totalNetWorth: number;
  totalAssets: number;
  totalDebts: number;
}

//not follwing camel case due to file categories
export type StatementRow = {
  Category: string;
  Description: string;
  Debit?: string;
  Amount?: string;
  'Post Date' ? : string;
  'Trans. Date' ? : string;
  'Transaction Date' ?: string;
  'Posted Date' ? : string;
}