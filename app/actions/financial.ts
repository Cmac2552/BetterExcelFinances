"use server"
import { auth } from "@/auth";
import { FinancialSectionData, TableData } from "../types";
import prisma from "../lib/prisma";


export async function fetchSections(date: Date): Promise<FinancialSectionData[]> {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized: No valid session found");
    }

    const firstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    
    return prisma.section.findMany({
        where:{
            userId:session?.user?.id,
            month:{
                gte: firstDay,
                lte: lastDay
            }
        },
        include: {
            values: true, // Include the related SectionItem values
          },
    });
  }

export async function fetchTableData(): Promise<TableData[]> {
  const session = await auth();
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 10, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()+1, 0, 23, 59, 59, 999));
  const tableData = await prisma.tableData.findMany({
     where:{
        userId:session?.user.id,
        date:{
           gte: startDate,
           lte: endDate
        }
     }
  })
  const formattedData = mapDatesAndDbDate(getNext12MonthsWithYears(startDate), tableData);
  return formattedData;
}

function mapDatesAndDbDate(dates: string[], dbDate:{date:Date, sectionValue:number}[]) {
  const dbMap = new Map();
  dbDate.forEach(({ date, sectionValue }) => {
     const monthYear = `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
     dbMap.set(monthYear, sectionValue);
  });

const formattedData = dates.map((monthYear) => {
 return {
   month: monthYear,
   value: dbMap.get(monthYear) ?? 0
 };
});
return formattedData;
}

function getNext12MonthsWithYears(startDate = new Date()) {
  const startMonthIndex = startDate.getUTCMonth() - 1;
  const startYear = startDate.getUTCFullYear();  
  const next12Months = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (startMonthIndex + i) % 12;
    const year = startYear + Math.floor((startMonthIndex + i) / 12);
    next12Months.push(`${monthNames[monthIndex]} ${year}`);
  }
  return next12Months;
}
const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export async function updateTableData(update: { date: Date; sectionValue: number }) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: No valid session found");
  }

  try {
    const submittedDate = new Date(update.date);
    const normalizedDate = new Date(Date.UTC(submittedDate.getUTCFullYear(), submittedDate.getUTCMonth(), 15, 0, 0, 0, 0));

    await prisma.tableData.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: normalizedDate,
        },
      },
      update: { sectionValue: update.sectionValue },
      create: { sectionValue: update.sectionValue, date: update.date, userId: session.user.id },
    });
  } catch (error) {
    console.error("Error in updateTableData:", error);
    throw error;
  }
}