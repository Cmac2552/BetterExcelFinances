"use server";

import Papa from "papaparse";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Transaction } from "@prisma/client";

type PrismaCreatedValues = "id" | "createdAt" | "updatedAt"
type UserTransactionDate = Omit<Transaction, PrismaCreatedValues>

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return session.user.id;
}

function parseCsv(fileText: string): Promise<Papa.ParseResult<any>> {
  return new Promise((resolve, reject) => {
    Papa.parse(fileText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (error: Error) => reject(error),
    });
  });
}

function transformDataForPrisma(
  csvData: any[],
  userId: string,
  headers: string[],
  statementMonth: string
): UserTransactionDate[] {
  const isDebitCreditFormat =
    headers.includes("Debit") && headers.includes("Credit");

  if (isDebitCreditFormat) {
    return csvData
      .map((row) => {
        const amount = Number.parseFloat(row.Debit) || 0;

        if (!row["Posted Date"] || amount === 0) return null;

        return {
          date: new Date(row["Posted Date"]),
          amount,
          description: row.Description,
          category: row.Category,
          userId,
          statementMonth
        };
      })
      .filter(
        (t): t is UserTransactionDate =>
          t !== null
      );
  } else {
    return csvData
      .map((row) => {
        if (!row["Post Date"] || !row.Amount || row.Amount < 0) return null;

        return {
          date: new Date(row["Post Date"]),
          amount: Number.parseFloat(row.Amount),
          description: row.Description,
          category: row.Category,
          userId,
          statementMonth
        };
      })
      .filter(
        (t): t is UserTransactionDate =>
          t !== null
      );
  }
}

async function saveTransactionsToDb(
  transactions: UserTransactionDate[]
) {
  if (transactions.length === 0) {
    console.log("No new transactions to save.");
    return;
  }
  try {
    await prisma.transaction.createMany({
      data: transactions,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("Error saving to database:", error);
    throw new Error("Failed to save transactions.");
  }
}

export async function saveTransactionToDb(
  transactions: {category:string, amount: number, description: string, date: Date, statementMonth: string}
) {
    const userId = await getAuthenticatedUserId();

  try {
    await prisma.transaction.create({
      data: {...transactions, userId},
    });
    revalidatePath("/upload")
  } catch (error) {
    console.error("Error saving to database:", error);
    throw new Error("Failed to save transactions.");
  }
}

export async function uploadCsv(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file uploaded");
    }

    const userId = await getAuthenticatedUserId();
    const fileText = await file.text();

    const results = await parseCsv(fileText);
    const parsedData = results.data;
    const headers = results.meta.fields || [];
    const statementMonth = formData.get("statementMonth") as string;

    const transactions = transformDataForPrisma(parsedData, userId, headers, statementMonth);
    await saveTransactionsToDb(transactions);

    revalidatePath("/upload");
    return { success: true };
  } catch (error) {
    console.error("Upload failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteTransaction(transactionId: number) {
  try {
    const userId = await getAuthenticatedUserId();

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found or user not authorized.");
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    revalidatePath("/upload");
    return { success: true };
  } catch (error) {
    console.error("Deletion failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Server action: aggregate last 6 statement months in a single DB query
export async function getLastSixMonths(month?: number, year?: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const today = new Date();
  const currentMonth = month ?? today.getUTCMonth() + 1;
  const currentYear = year ?? today.getUTCFullYear();

  const months: { month: number; year: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    d.setUTCMonth(d.getUTCMonth() - i);
    months.push({ month: d.getUTCMonth() + 1, year: d.getUTCFullYear() });
  }

  // compute entire inclusive span to fetch in one query
  const ranges = months.map((m) => {
    const startDate = new Date(Date.UTC(m.year, m.month - 2, 26, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(m.year, m.month - 1, 25, 23, 59, 59, 999));
    return { startDate, endDate };
  });

  let earliestStart = ranges[0].startDate;
  let latestEnd = ranges[0].endDate;
  for (const r of ranges) {
    if (r.startDate < earliestStart) earliestStart = r.startDate;
    if (r.endDate > latestEnd) latestEnd = r.endDate;
  }

  const txns = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: earliestStart, lte: latestEnd },
      amount: { gt: 0 },
    },
    select: { date: true, category: true, amount: true },
  });

  // build set of target months for quick membership
  const monthKeys = new Set(months.map((m) => `${m.year}-${m.month}`));

  // map key -> category -> amount
  const grouped: Record<string, Record<string, number>> = {};

  for (const t of txns) {
    const d = new Date(t.date);
    const day = d.getUTCDate();
    let stmtMonthIndex = d.getUTCMonth(); // 0-based
    let stmtYear = d.getUTCFullYear();
    if (day >= 26) {
      stmtMonthIndex = stmtMonthIndex + 1;
      if (stmtMonthIndex > 11) {
        stmtMonthIndex = 0;
        stmtYear += 1;
      }
    }
    const stmtMonth = stmtMonthIndex + 1;
    const key = `${stmtYear}-${stmtMonth}`;
    if (!monthKeys.has(key)) continue; // ignore dates outside our target 6 months window

    const cat = t.category || "Uncategorized";
    grouped[key] = grouped[key] || {};
    grouped[key][cat] = (grouped[key][cat] || 0) + Number(t.amount);
  }

  const results = months.map((m) => {
    const key = `${m.year}-${m.month}`;
    const agg = grouped[key] || {};
    const data = Object.entries(agg)
      .map(([category, amount]) => ({ category, amount: Number.parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);
    return { month: m.month, year: m.year, data };
  });

  return results;
}

