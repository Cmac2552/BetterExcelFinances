'use server';
import { z } from 'zod';
import prisma from './prisma'; 
import { auth } from '../../auth';
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

    const sectionItemsToCreate: SectionItemCreateInput[] = fieldNames.map((name : string, index : number) => ({
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
      const sectionData: SectionUpdateInput = { 
        title,
        month,
        assetClass,
        userId,
        values: {
          deleteMany: { sectionId: id },
          create: sectionItemsToCreate,
        },
      }
      const updatedSection = await updateSection(sectionData, id); 

      return { success: true, section: updatedSection };
    } else {
      const sectionData: SectionCreateInput = { 
        title,
        month,
        assetClass,
        userId,
        values: {
          create: sectionItemsToCreate,
        },
      }
      const newSection = await createNewSection(sectionData); 
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
      values: true,
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

export const copyMonth = async (dateString : string) => {
  const session = await auth();
      
  const date = new Date(dateString);
  const lastMonthFirstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
  const lastMonthLastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0, 23, 59, 59, 999));
  
  const original = await prisma.section.findMany({
      where:{
          userId:session?.user.id,
          month:{
              gte: lastMonthFirstDay,
              lte: lastMonthLastDay
          }
      },
      include: {
          values: true,
          },
  });

  const newValues = original.map((value) => {
    const modifiedValues = value.values.map((sectionItem) => {
      return {label: sectionItem.label, value: sectionItem.value};
    })
    return {month: date.toISOString(), values: modifiedValues, title: value.title, userId: value.userId, assetClass: value.assetClass};
  });
  const copiedSections = await createSectionsWithItems(newValues);
  return copiedSections
}

const createSectionsWithItems = async (data : {title : string, month:string, userId:string, assetClass:string, values:{label:string, value:number}[]}[]) => {
    return await Promise.all(
      data.map(section => 
        prisma.section.upsert({
          where: {title_month: {
            title:section.title,
            month:section.month
          }},
          update:{
            ...section,
            values: {
              create: section.values
            }
          }, 
          create:{
            ...section,
            values: {
              create: section.values
            }
          },
          include: {
            values: true
          }
        })
      )
    );
  };

export const deleteSectionItem = async (id:number) => {
  const sectionItem = await prisma.sectionItem.findUnique({
        where: { id: id },
      });
  
  if (!sectionItem) {
    throw new Error("Section Item Does Not Exist");
  }

  await prisma.sectionItem.delete({
    where: { id: id },
  });
}

export const deleteSection = async (id:number) => {
  console.log(id);
  const sectionItem = await prisma.section.findUnique({
        where: { id: id },
      });
  
  if (!sectionItem) {
    throw new Error("Section Item Does Not Exist");
  }
  
  await prisma.section.delete({
    where: { id: id },
  });
}

export const updateSectionItem = async (id:number, value: number) => {
  return await prisma.sectionItem.update({
      where: {id: id},
      data:{
          value: value
      }
  })
        
}