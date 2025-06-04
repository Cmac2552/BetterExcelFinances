'use server';

import prisma from './prisma'; // Adjusted path assuming prisma.ts is in the same directory
import { auth } from '../../auth';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client'; // Import Prisma for types if needed

// Define a type for SectionItem based on expected structure
interface SectionItemCreateInput {
  name: string;
  value: number;
}

export async function saveSection(data: {
  title: string;
  fieldNames: string[];
  fieldValues: number[];
  month: Date;
  assetClass: 'ASSET' | 'DEBT';
  id?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      // In a real app, you might throw an error or return a more structured error response
      return { error: 'Unauthorized', success: false };
    }
    const userId = session.user.id;

    const { id, title, fieldNames, fieldValues, month, assetClass } = data;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return { error: 'Title is required and must be a non-empty string.', success: false };
    }
    if (!month || !(month instanceof Date) || isNaN(month.valueOf())) {
        return { error: 'Month is required and must be a valid Date object.', success: false };
    }
    if (!assetClass || (assetClass !== 'ASSET' && assetClass !== 'DEBT')) {
        return { error: 'Asset class is required and must be either "ASSET" or "DEBT".', success: false };
    }
    if (!Array.isArray(fieldNames) || !Array.isArray(fieldValues)) {
        return { error: 'Field names and field values must be arrays.', success: false };
    }
    if (fieldNames.length !== fieldValues.length) {
      return { error: 'Field names and values arrays must have the same length.', success: false };
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
      name: name, // Assuming Prisma schema for SectionItem uses 'name'
      value: fieldValues[index],
    }));

    if (id) {
      // Update existing section
      // Check if section exists and belongs to the user
      const existingSection = await prisma.section.findFirst({
        where: { id, userId },
      });

      if (!existingSection) {
        return { error: 'Section not found or user not authorized to update this section.', success: false };
      }

      const updatedSection = await prisma.section.update({
        where: { id }, // id is unique, no need for userId here if we already checked ownership
        data: {
          title,
          month,
          assetClass,
          // For items, delete existing ones and create new ones
          // This simplifies logic compared to diffing items
          items: {
            deleteMany: { sectionId: id }, // Delete items associated with this section
            create: sectionItemsToCreate,
          },
        },
        include: {
          items: true, // Include the items in the response
        },
      });

      revalidatePath('/'); // Or a more specific path if you have one e.g. /dashboard
      return { success: true, section: updatedSection };
    } else {
      // Create new section
      const newSection = await prisma.section.create({
        data: {
          title,
          month,
          assetClass,
          userId,
          items: {
            create: sectionItemsToCreate,
          },
        },
        include: {
          items: true, // Include the items in the response
        },
      });
      revalidatePath('/'); // Or a more specific path
      return { success: true, section: newSection };
    }
  } catch (error) {
    console.error('Error saving section:', error);
    // Check for Prisma-specific errors if you want to provide more granular feedback
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Example: P2002 is unique constraint violation
      if (error.code === 'P2002') {
        return { error: 'A section with this identifier already exists.', success: false };
      }
    }
    return { error: 'Failed to save section due to a server error.', success: false };
  }
}
