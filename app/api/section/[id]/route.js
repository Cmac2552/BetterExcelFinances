import { prisma } from "../../../lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function DELETE(request, {params}) {
    try {
        const { id } = params;
        await prisma.section.delete({
            where: {id: parseInt(id)}
        })
        return new Response(JSON.stringify({}), {status: 200})
    }
    catch (error) {
        console.log(error);
        return new Response(JSON.stringify({error:"Error delete Section"}), {status: 500})
    }
}

export async function PUT(request, {params}) {
    try {
        const { id } = params;
        const data = await request.json();
        const session = await getServerSession(authOptions);

        const submissionData = JSON.parse(JSON.stringify(data))
        submissionData.userId = session.user.id;
        
        submissionData.values = {create:[]}
        submissionData.fieldNames.forEach((name, index)=>{
            submissionData.values.update.push({label:name, value:data.fieldValues[index]})
        })
        delete submissionData.fieldNames;
        delete submissionData.fieldValues;
        const newSection = await prisma.section.update({
            where:{
                id: parseInt(id)
            },
            data:submissionData, 
            include: {
                values: true,
              },
        });

        return new Response(JSON.stringify(newSection), {status: 200})
    }
    catch (error) {
        console.log(error);
        return new Response(JSON.stringify({error:"Error delete Section"}), {status: 500})
    }
}