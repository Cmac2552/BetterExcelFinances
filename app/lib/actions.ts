'use server';

import prisma from './prisma'; 
import { auth } from '../../auth';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client'; 

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

    const { id, title, fieldNames, fieldValues, month, assetClass } = data;

    const validations = [
      { condition: !title || typeof title !== 'string' || title.trim() === '', error: 'Title is required and must be a non-empty string.' },
      { condition: !month || !(month instanceof Date) || isNaN(month.valueOf()), error: 'Month is required and must be a valid Date object.' },
      { condition: !assetClass || (assetClass !== 'ASSET' && assetClass !== 'DEBT'), error: 'Asset class is required and must be either "ASSET" or "DEBT".' },
      { condition: !Array.isArray(fieldNames) || !Array.isArray(fieldValues), error: 'Field names and field values must be arrays.' },
      { condition: fieldNames.length !== fieldValues.length, error: 'Field names and values arrays must have the same length.' },
    ];

    for (const { condition, error } of validations) {
      if (condition) {
        return { error, success: false };
      }
    }

    for (let i = 0; i < fieldNames.length; i++) {
      if (typeof fieldNames[i] !== 'string' || fieldNames[i].trim() === '') {
        return { error: `Field name at index ${i} must be a non-empty string.`, success: false };
      }
      if (typeof fieldValues[i] !== 'number' || isNaN(fieldValues[i])) {
        return { error: `Field value at index ${i} must be a valid number.`, success: false };
      }
    }

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
        const data: SectionUpdateInput =  {
          title,
          month,
          assetClass,
          userId,
          values: {
            deleteMany: { sectionId: id }, 
            create: sectionItemsToCreate,
          },
        }
      const updatedSection = await updateSection(data, id);

      revalidatePath('/'); // Or a more specific path if you have one e.g. /dashboard
      return { success: true, section: updatedSection };
    } else {
      const data : SectionCreateInput =  {
        title,
        month,
        assetClass,
        userId,
        values: {
          create: sectionItemsToCreate,
        },
      }
      const newSection = await createNewSection(data);
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
