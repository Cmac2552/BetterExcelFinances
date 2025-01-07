import { prisma } from "../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";



export async function POST(request) {
    try {
        const data = await request.json();
        const session = await getServerSession(authOptions);

        const submissionData = JSON.parse(JSON.stringify(data))
        submissionData.userId = session.user.id;
        
        submissionData.values = {create:[]}
        submissionData.fieldNames.forEach((name, index)=>{
            submissionData.values.create.push({label:name, value:data.fieldValues[index]})
        })
        delete submissionData.fieldNames;
        delete submissionData.fieldValues;
        
        const newSection = await prisma.section.create({
            data:submissionData
        });

        return new Response(JSON.stringify(newSection), { status:200});
    }
    catch(error){
        console.log(error);
        return new Response(JSON.stringify({error:"Error creating section"}, {status:500}));
    }
}
//This should be in a diff file
export async function PATCH(request) {
    try{
        const data = await request.json();

        const updatedSection = await prisma.sectionItem.update({
            where: {id: data.id},
            data:{
                value: data.value
            }
        })

        return new Response(JSON.stringify(updatedSection), { status:200});
    } 
    catch (error) {
        return new Response(JSON.stringify({error:"Error patching section"}, {status:500}));
    }
}