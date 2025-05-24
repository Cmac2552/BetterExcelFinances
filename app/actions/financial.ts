import { FinancialSectionData, TableData } from "../types";


export async function fetchSections(date: Date): Promise<FinancialSectionData[]> {
    const res = await fetch(`/api/sections?date=${date.toISOString()}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch sections");
    }
    
    return res.json();
  }

export async function fetchTableData(): Promise<TableData[]> {
    const tableDataResult = await fetch("/api/table-data", {
        cache: "no-store",
      });
      if (!tableDataResult.ok) {
        throw new Error("Failed to fetch Table Data");
      }
      const tableData = await tableDataResult.json();
      if (tableData.error) {
        throw new Error(tableData.error);
      }
      return tableData;
}

export async function updateTableData(update: { 
    date: Date; 
    sectionValue: number 
  }) {
    try {
      const response = await fetch("/api/table-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update table data");
      }
  
      return response.json();
    } catch (error) {
      console.error("Error in updateTableData:", error);
      throw error;
    }
  }