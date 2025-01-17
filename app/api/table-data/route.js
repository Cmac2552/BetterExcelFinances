import { prisma } from "../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";


export async function POST(request) {
 try {
    const data = await request.json();
    const session = await getServerSession(authOptions);
    const submissionData = JSON.parse(JSON.stringify(data));
    submissionData.userId = session.user.id;
    const newTableData = await prisma.tableData.create({
        data:submissionData
    });

    return new Response(JSON.stringify(newTableData), {status:200});
 }
 catch(error) {
    console.log(error);
    return new Response(JSON.stringify({error:"Error creating section"}, {status:500}))
 }
}