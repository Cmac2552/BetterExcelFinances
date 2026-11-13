"use server";

import { auth } from "@/auth";
import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_STARTER_CATEGORIES = [
  "Groceries",
  "Dining Out",
  "Transportation",
  "Utilities",
  "Housing",
  "Shopping",
  "Entertainment",
  "Health & Wellness",
  "Travel",
];

async function requireAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function fetchUserCategories() {
  const userId = await requireAuthUserId();

  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string) {
  const userId = await requireAuthUserId();
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Category name cannot be empty");
  }

  if (trimmedName.length > 50) {
    throw new Error("Category name must be 50 characters or fewer");
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        userId,
      },
    });

    revalidatePath("/upload");
    revalidatePath("/dashboard");
    return { success: true, category };
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new Error(`Category "${trimmedName}" already exists`);
    }
    throw error;
  }
}

export async function createDefaultCategories() {
  const userId = await requireAuthUserId();

  const existingCategories = await prisma.category.findMany({
    where: { userId },
    select: { name: true },
  });

  const existingNames = new Set(
    existingCategories.map((c) => c.name.toLowerCase().trim())
  );

  const toCreate = DEFAULT_STARTER_CATEGORIES.filter(
    (name) => !existingNames.has(name.toLowerCase().trim())
  );

  if (toCreate.length === 0) {
    return { success: true, count: 0, message: "All default categories already exist" };
  }

  await prisma.category.createMany({
    data: toCreate.map((name) => ({
      name,
      userId,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/upload");
  revalidatePath("/dashboard");
  return { success: true, count: toCreate.length };
}

export async function updateCategory(id: number, name: string) {
  const userId = await requireAuthUserId();
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Category name cannot be empty");
  }

  if (trimmedName.length > 50) {
    throw new Error("Category name must be 50 characters or fewer");
  }

  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Category not found");
  }

  try {
    const category = await prisma.$transaction(async (tx) => {
      const updated = await tx.category.update({
        where: { id },
        data: { name: trimmedName },
      });

      if (existing.name !== trimmedName) {
        await tx.transaction.updateMany({
          where: { userId, category: existing.name },
          data: { category: trimmedName },
        });
      }

      return updated;
    });

    revalidatePath("/upload");
    revalidatePath("/dashboard");
    return { success: true, category };
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new Error(`Category "${trimmedName}" already exists`);
    }
    throw error;
  }
}

export async function deleteCategory(id: number) {
  const userId = await requireAuthUserId();

  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Category not found");
  }

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/upload");
  revalidatePath("/dashboard");
  return { success: true };
}
