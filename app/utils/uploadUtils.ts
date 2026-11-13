import Papa from "papaparse";
import type { Transaction } from "@prisma/client";
import type {
  CategoryAmount,
  MonthCategorySpending,
  StatementRow,
} from "../types/financial";

export type { CategoryAmount, MonthCategorySpending };
export type PrismaCreatedValues = "id" | "createdAt" | "updatedAt";
export type UserTransactionInput = Omit<Transaction, PrismaCreatedValues>;

export function parseCsv(fileText: string): Promise<Papa.ParseResult<StatementRow>> {
  return new Promise((resolve, reject) => {
    Papa.parse<StatementRow>(fileText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (error: Error) => reject(error),
    });
  });
}

export function transformDataForPrisma(
  csvData: StatementRow[],
  userId: string,
  headers: string[],
  statementMonth: string
): UserTransactionInput[] {
  const isDebitCreditFormat =
    headers.includes("Debit") && headers.includes("Credit");
  const isChaseFormat = headers.includes("Memo");

  if (isDebitCreditFormat) {
    return csvData
      .map((row) => {
        const rawDebit = row.Debit?.replace(/[\$,]/g, "") ?? "0";
        const amount = Number.parseFloat(rawDebit);
        const postedDate = row["Posted Date"] || row["Transaction Date"];

        if (!postedDate || Number.isNaN(amount) || amount <= 0) return null;

        return {
          date: new Date(postedDate),
          amount,
          description: row.Description?.trim() || "Unknown Transaction",
          category: row.Category?.trim() || "Uncategorized",
          userId,
          statementMonth,
        };
      })
      .filter((t): t is UserTransactionInput => t !== null);
  } else if (isChaseFormat) {
    return csvData
      .map((row) => {
        const rawAmount = row.Amount?.replace(/[\$,]/g, "") ?? "0";
        // Chase represents sales as negative amounts (e.g. -50.00)
        const parsed = Number.parseFloat(rawAmount);
        const amount = -parsed;
        const postDate = row["Post Date"] || row["Transaction Date"];

        if (!postDate || Number.isNaN(amount) || amount <= 0) return null;

        return {
          date: new Date(postDate),
          amount,
          description: row.Description?.trim() || "Unknown Transaction",
          category: row.Category?.trim() || "Uncategorized",
          userId,
          statementMonth,
        };
      })
      .filter((t): t is UserTransactionInput => t !== null);
  } else {
    // Discover and standard formats
    return csvData
      .map((row) => {
        const rawAmount = row.Amount?.replace(/[\$,]/g, "") ?? "0";
        const amount = Number.parseFloat(rawAmount);
        const postDate = row["Post Date"] || row["Trans. Date"] || row["Transaction Date"];

        if (!postDate || Number.isNaN(amount) || amount <= 0) return null;

        return {
          date: new Date(postDate),
          amount,
          description: row.Description?.trim() || "Unknown Transaction",
          category: row.Category?.trim() || "Uncategorized",
          userId,
          statementMonth,
        };
      })
      .filter((t): t is UserTransactionInput => t !== null);
  }
}

/**
 * Extracts unique categories and a set of sample merchant descriptions for each category.
 */
export function extractCategorySamples(
  transactions: UserTransactionInput[]
): Record<string, string[]> {
  const categorySamples: Record<string, Set<string>> = {};

  for (const tx of transactions) {
    const cat = tx.category || "Uncategorized";
    if (!categorySamples[cat]) {
      categorySamples[cat] = new Set();
    }
    if (tx.description && categorySamples[cat].size < 6) {
      categorySamples[cat].add(tx.description);
    }
  }

  const result: Record<string, string[]> = {};
  for (const [cat, set] of Object.entries(categorySamples)) {
    result[cat] = Array.from(set);
  }

  return result;
}

export function generateMonthRange(
  n: number,
  startMonth: number,
  startYear: number
): { statementMonth: string; label: string }[] {
  const months: { statementMonth: string; label: string }[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(startYear, startMonth - 1, 1));
    d.setUTCMonth(d.getUTCMonth() - i);
    const month = d.getUTCMonth() + 1;
    const year = d.getUTCFullYear();
    const statementMonthStr = `${month}-${year}`;
    const label = d.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
    months.push({ statementMonth: statementMonthStr, label });
  }
  return months;
}
