import { prisma } from "../../lib/prisma";
import { auth } from "@/auth"

const monthNames = [
   "January", "February", "March", "April", "May", "June", 
   "July", "August", "September", "October", "November", "December"
 ];
 
export async function POST(request) {
 try {
    const data = await request.json();
    const session = await auth();

    const submissionData = { ...data };
    
    const submittedDate = new Date(submissionData.date)
    const normalizedDate = new Date(Date.UTC(submittedDate.getUTCFullYear(), submittedDate.getUTCMonth(), 15, 0, 0, 0, 0));
    submissionData.date = normalizedDate;
    submissionData.userId = session.user.id;

    const newTableData = await prisma.tableData.upsert({
      where:{userId_date: { 
         userId: submissionData.userId,
         date: submissionData.date,
       },},
      update:{...submissionData},
      create:{...submissionData}
    });

    return new Response(JSON.stringify(newTableData), {status:200});
 }
 catch(error) {
    console.log(error);
    return new Response(JSON.stringify({error:"Error creating Table Data Entry"}, {status:500}))
 }
}

export async function GET() {
   try{
      const session = await auth();
      const now = new Date();
      const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 10, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()+1, 0, 23, 59, 59, 999));
      const tableData = await prisma.tableData.findMany({
         where:{
            userId:session.user.id,
            date:{
               gte: startDate,
               lte: endDate
            }
         }
      })
      const formattedData = mapDatesAndDbDate(getNext12MonthsWithYears(startDate), tableData);
      return new Response(JSON.stringify(formattedData), {status:200});
   }
   catch(error){
      console.log(error);
      return new Response(JSON.stringify({error:"Error fetching Table Data"}))
   }
}

function mapDatesAndDbDate(dates, dbDate) {
   const dbMap = new Map();
   dbDate.forEach(({ date, sectionValue }) => {
      const monthYear = `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
      dbMap.set(monthYear, sectionValue);
   });

const formattedData = dates.map((monthYear) => {
  return {
    month: monthYear,
    value: dbMap.get(monthYear) || 0
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