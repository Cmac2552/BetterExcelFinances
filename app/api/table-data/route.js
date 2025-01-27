import { prisma } from "../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";


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
      const tableData = await prisma.tableData.findMany({
         where:{
            userId:session.user.id
         }
      })
      return new Response(JSON.stringify({data:tableData, labels:getNext12MonthsWithYears()}), {status:200});
   }
   catch(error){
      console.log(error);
      return new Response(JSON.stringify({error:"Error fetching Table Data"}))
   }
}

function getNext12MonthsWithYears() {
   const monthNames = [
     "January", "February", "March", "April", "May", "June", 
     "July", "August", "September", "October", "November", "December"
   ];
 
   const currentDate = new Date();
   const currentMonthIndex = currentDate.getMonth();
   const currentYear = currentDate.getFullYear();
 
   const next12Months = [];
   for (let i = 0; i < 12; i++) {
     const monthIndex = (currentMonthIndex + i) % 12; // Wrap around to January after December
     const year = currentYear + Math.floor((currentMonthIndex + i) / 12); // Increment year when needed
     next12Months.push(`${monthNames[monthIndex]} ${year}`);
   }
 
   return next12Months;
 }