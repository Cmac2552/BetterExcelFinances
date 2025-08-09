"use server";

import Papa from "papaparse";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Transaction } from "@prisma/client";

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
  headers: string[]
): Omit<Transaction, "id" | "createdAt" | "updatedAt">[] {
  const isDebitCreditFormat =
    headers.includes("Debit") && headers.includes("Credit");

  if (isDebitCreditFormat) {
    return csvData
      .map((row) => {
        const debit = parseFloat(row.Debit) || 0;
        const amount = debit 

        if (!row["Transaction Date"] || amount === 0) return null;

        return {
          date: new Date(row["Transaction Date"]),
          amount,
          description: row.Description,
          category: row.Category,
          userId,
        };
      })
      .filter(
        (t): t is Omit<Transaction, "id" | "createdAt" | "updatedAt"> =>
          t !== null
      );
  } else {
    return csvData
      .map((row) => {
        if (!row["Trans. Date"] || !row.Amount || row.Amount < 0) return null;

        return {
          date: new Date(row["Trans. Date"]),
          amount: parseFloat(row.Amount),
          description: row.Description,
          category: row.Category,
          userId,
        };
      })
      .filter(
        (t): t is Omit<Transaction, "id" | "createdAt" | "updatedAt"> =>
          t !== null
      );
  }
}

async function saveTransactionsToDb(
  transactions: Omit<Transaction, "id" | "createdAt" | "updatedAt">[]
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

    const transactions = transformDataForPrisma(parsedData, userId, headers);
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

