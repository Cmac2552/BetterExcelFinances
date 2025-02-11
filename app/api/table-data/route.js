import { prisma } from "../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

const monthNames = [
   "January", "February", "March", "April", "May", "June", 
   "July", "August", "September", "October", "November", "December"
 ];
 
export async function POST(request) {
 try {
    const data = await request.json();
    const session = await getServerSession(authOptions);
    const submissionData = JSON.parse(JSON.stringify(data));
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
      const session = await getServerSession(authOptions);
      const date = new Date();
      const startDate = new Date(date.getFullYear(), date.getMonth()-11, 1);
      const endDate = new Date(date.getFullYear(), date.getMonth());
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
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      dbMap.set(monthYear, sectionValue);
   });

const formattedData = dates.map((monthYear, index) => {
  return {
    month: monthYear,
    value: dbMap.get(monthYear) || 0 
  };
});
return formattedData;
}

function getNext12MonthsWithYears(startDate = new Date()) {
  
 
   const startMonthIndex = startDate.getMonth();
   const startYear = startDate.getFullYear();
   
   const next12Months = [];
   for (let i = 0; i < 12; i++) {
     const monthIndex = (startMonthIndex + i) % 12;
     const year = startYear + Math.floor((startMonthIndex + i) / 12);
     next12Months.push(`${monthNames[monthIndex]} ${year}`);
   }
 
   return next12Months;
 }