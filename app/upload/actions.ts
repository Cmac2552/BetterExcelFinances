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

