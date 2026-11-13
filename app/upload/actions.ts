"use server";

import prisma from "@/app/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Transaction } from "@prisma/client";
import type {
  CategoryAmount,
  MonthCategorySpending,
  UserTransactionInput,
} from "@/app/utils/uploadUtils";
import {
  extractCategorySamples,
  generateMonthRange,
  parseCsv,
  transformDataForPrisma,
} from "@/app/utils/uploadUtils";
import { classifyCategoriesWithJev } from "@/app/lib/categorization/jevCategorizer";

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return session.user.id;
}

export async function getUserCategories(): Promise<string[]> {
  const userId = await getAuthenticatedUserId();
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return categories.map((c) => c.name);
}

export async function getCategoriesForMonth(statementMonth: string): Promise<string[]> {
  const userId = await getAuthenticatedUserId();

  const [txCategories, userCategories] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, statementMonth },
      distinct: ["category"],
      select: { category: true },
    }),
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { name: true },
    }),
  ]);

  const categorySet = new Set<string>();
  userCategories.forEach((c) => categorySet.add(c.name));
  txCategories.forEach((t) => {
    if (t.category) categorySet.add(t.category);
  });

  return Array.from(categorySet).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

export async function uploadCsv(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file uploaded");
    }

    const statementMonth = formData.get("statementMonth") as string;
    if (!statementMonth) {
      throw new Error("Statement month is required");
    }

    const userId = await getAuthenticatedUserId();
    const fileText = await file.text();

    const parseResult = await parseCsv(fileText);
    const parsedData = parseResult.data;
    const headers = parseResult.meta.fields || [];

    const rawTransactions = transformDataForPrisma(
      parsedData,
      userId,
      headers,
      statementMonth
    );

    if (rawTransactions.length === 0) {
      return {
        success: false,
        error: "No valid expense transactions found in this statement.",
      };
    }

    // Retrieve user-defined categories
    const userCategories = await prisma.category.findMany({
      where: { userId },
      select: { name: true },
    });
    const userCategoryNames = userCategories.map((c) => c.name);

    let transactionsToSave = rawTransactions;
    let mappingsApplied: Record<string, string> = {};
    let newlyCategorized = 0;

    if (userCategoryNames.length > 0) {
      const sampleDescriptions = extractCategorySamples(rawTransactions);
      const uniqueCsvCategories = Object.keys(sampleDescriptions);

      const categorization = await classifyCategoriesWithJev({
        unmappedCategories: uniqueCsvCategories,
        userCategories: userCategoryNames,
        sampleDescriptions,
      });

      mappingsApplied = categorization.mappings;

      transactionsToSave = rawTransactions.map((tx) => {
        const mappedCat = mappingsApplied[tx.category];
        if (
          mappedCat &&
          mappedCat !== tx.category &&
          mappedCat !== "Uncategorized"
        ) {
          newlyCategorized++;
          return { ...tx, category: mappedCat };
        }
        return mappedCat ? { ...tx, category: mappedCat } : tx;
      });
    }

    const saveResult = await prisma.transaction.createMany({
      data: transactionsToSave,
      skipDuplicates: true,
    });

    revalidatePath("/upload");
    revalidatePath("/dashboard");

    return {
      success: true,
      count: saveResult.count,
      totalParsed: transactionsToSave.length,
      newlyCategorized,
      mappingsApplied,
    };
  } catch (error) {
    console.error("Upload failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function saveTransactionToDb(transaction: {
  category: string;
  amount: number;
  description: string;
  date: Date;
  statementMonth: string;
}) {
  const userId = await getAuthenticatedUserId();

  try {
    await prisma.transaction.create({
      data: { ...transaction, userId },
    });
    revalidatePath("/upload");
    return { success: true };
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw new Error("Failed to save transaction.");
  }
}

export async function updateTransactionInDb(transaction: {
  category: string;
  amount: number;
  description: string;
  date: Date;
  statementMonth: string;
}) {
  return saveTransactionToDb(transaction);
}

export async function deleteTransaction(transactionId: number) {
  try {
    const userId = await getAuthenticatedUserId();

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found or unauthorized.");
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

type UpdatableTransactionFields = {
  category?: string;
  amount?: number;
  description?: string;
  date?: Date;
  statementMonth?: string;
};

export async function updateTransaction(
  id: number,
  data: UpdatableTransactionFields
) {
  try {
    const userId = await getAuthenticatedUserId();

    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found or unauthorized.");
    }

    const sanitizedData: UpdatableTransactionFields = {};
    if (data.category !== undefined) sanitizedData.category = data.category;
    if (data.amount !== undefined) sanitizedData.amount = data.amount;
    if (data.description !== undefined)
      sanitizedData.description = data.description;
    if (data.date !== undefined) sanitizedData.date = data.date;
    if (data.statementMonth !== undefined)
      sanitizedData.statementMonth = data.statementMonth;

    const updated = await prisma.transaction.update({
      where: { id },
      data: sanitizedData,
    });

    revalidatePath("/upload");
    return updated;
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
}

export async function changeCategory(id: number, category: string) {
  return updateTransaction(id, { category });
}

export async function fetchTransactionsForStatementMonth(
  statementMonth: string
): Promise<Transaction[]> {
  const userId = await getAuthenticatedUserId();

  return prisma.transaction.findMany({
    where: { userId, statementMonth },
    orderBy: [{ date: "desc" }, { amount: "desc" }],
  });
}

export async function fetchCategorySpendingLastNMonths(
  n: number,
  startMonth: number,
  startYear: number
): Promise<MonthCategorySpending[]> {
  const userId = await getAuthenticatedUserId();

  const months = generateMonthRange(n, startMonth, startYear);
  const statementMonths = months.map((m) => m.statementMonth);

  const groups = await prisma.transaction.groupBy({
    by: ["statementMonth", "category"],
    where: {
      userId,
      statementMonth: { in: statementMonths },
      amount: { gt: 0 },
    },
    _sum: { amount: true },
  });

  const spendingMap: Record<string, CategoryAmount[]> = {};
  for (const g of groups) {
    const sMonth = g.statementMonth;
    const amt = g._sum?.amount ?? 0;
    spendingMap[sMonth] = spendingMap[sMonth] ?? [];
    spendingMap[sMonth].push({
      category: g.category || "Uncategorized",
      amount: Number.parseFloat(amt.toFixed(2)),
    });
  }

  return months.map((m) => {
    const spendingAmounts = (spendingMap[m.statementMonth] ?? []).sort((a, b) =>
      a.category.localeCompare(b.category, undefined, { sensitivity: "base" })
    );
    return { statementMonth: m.statementMonth, label: m.label, spendingAmounts };
  });
}

export async function meanNMonthSpending(
  nMonths: number,
  startMonth: number,
  startYear: number
): Promise<CategoryAmount[]> {
  const userId = await getAuthenticatedUserId();

  const months = generateMonthRange(nMonths, startMonth, startYear);
  const statementMonths = months.map((m) => m.statementMonth);

  const sums = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      userId,
      statementMonth: { in: statementMonths },
      amount: { gt: 0 },
    },
    _sum: { amount: true },
  });

  return sums
    .map((sum) => ({
      category: sum.category || "Uncategorized",
      amount: Number.parseFloat(((sum._sum?.amount ?? 0) / nMonths).toFixed(2)),
    }))
    .sort((a, b) => b.amount - a.amount);
}
