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