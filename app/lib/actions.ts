'use server';

import { z } from 'zod';
import prisma from './prisma'; 
import { auth } from '../../auth';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client'; 

// Zod schema for SectionItemCreateInput
const SectionItemCreateInputSchema = z.object({
  label: z.string(),
  value: z.number(),
});

// Zod schema for saveSection input data
const SaveSectionInputSchema = z.object({
  title: z.string().min(1, { message: "Title is required and must be a non-empty string." }),
  fieldNames: z.array(z.string().min(1, { message: "Field name must be a non-empty string." })),
  fieldValues: z.array(z.number()),
  month: z.date({ invalid_type_error: "Month is required and must be a valid Date object." }),
  assetClass: z.enum(["ASSET", "DEBT"], { errorMap: () => ({ message: 'Asset class must be either "ASSET" or "DEBT".' }) }),
  id: z.number().optional(),
}).refine(data => data.fieldNames.length === data.fieldValues.length, {
  message: "Field names and values arrays must have the same length.",
  path: ["fieldNames"], // you can specify a path for the error, e.g., relating to fieldNames
});

interface SectionItemCreateInput {
  label: string;
  value: number;
}

interface SectionUpdateInput {
  title: string;
  month: Date;
  assetClass: string;
  userId: string;
  values: {
    create: SectionItemCreateInput[];
    deleteMany: {sectionId: number}
  };
}

interface SectionCreateInput {
  title: string;
  month: Date;
  assetClass: string;
  userId: string;
  values: {
    create: SectionItemCreateInput[];
  };
}

export async function saveSection(data: {
  title: string;
  fieldNames: string[];
  fieldValues: number[];
  month: Date;
  assetClass: string;
  id?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized', success: false };
    }
    const userId = session.user.id;

    const result = SaveSectionInputSchema.safeParse(data);

    if (!result.success) {
      return { error: "Validation failed", issues: result.error.issues, success: false };
    }

    const { id, title, fieldNames, fieldValues, month, assetClass } = result.data;

    const sectionItemsToCreate: SectionItemCreateInput[] = fieldNames.map((name, index) => ({
      label: name,
      value: fieldValues[index],
    }));

    if (id) {
      const existingSection = await prisma.section.findFirst({
        where: { id, userId },
      });

      if (!existingSection) {
        return { error: 'Section not found or user not authorized to update this section.', success: false };
      }
      const sectionData: SectionUpdateInput = { // Renamed from data to avoid conflict with result.data
        title,
        month,
        assetClass,
        userId,
        values: {
          deleteMany: { sectionId: id },
          create: sectionItemsToCreate,
        },
      }
      const updatedSection = await updateSection(sectionData, id); // Use sectionData

      revalidatePath('/'); // Or a more specific path if you have one e.g. /dashboard
      return { success: true, section: updatedSection };
    } else {
      const sectionData: SectionCreateInput = { // Renamed from data to avoid conflict with result.data
        title,
        month,
        assetClass,
        userId,
        values: {
          create: sectionItemsToCreate,
        },
      }
      const newSection = await createNewSection(sectionData); // Use sectionData
      revalidatePath('/'); // Or a more specific path
      return { success: true, section: newSection };
    }
  } catch (error) {
    console.error('Error saving section:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Example: P2002 is unique constraint violation
      if (error.code === 'P2002') {
        return { error: 'A section with this identifier already exists.', success: false };
      }
    }
    return { error: 'Failed to save section due to a server error.', success: false };
  }
}

const createNewSection = async (data: SectionCreateInput) => {
  return await prisma.section.create({
    data,
    include: {
      values: true, // Include the items in the response
    },
  });
}

const updateSection = async (data: SectionUpdateInput, id: number) => {
  return await prisma.section.update({
    where: { id }, 
    data,
    include: {
      values: true, 
    },
  });
}
