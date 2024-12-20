import { prisma } from "../../lib/prisma";



export async function POST(request) {
    
    try{
        //#TODO make this way nicer
    
        const data = await request.json();

        const submissionData = JSON.parse(JSON.stringify(data))
        submissionData.userId = 1;
        
        submissionData.values = {create:[]}
        submissionData.fieldNames.forEach((name, index)=>{
            submissionData.values.create.push({label:name, value:data.fieldValues[index]})
        })
        delete submissionData.fieldNames;
        delete submissionData.fieldValues;
        
        const newSection = await prisma.section.create({
            data:submissionData
        });

        return new Response(JSON.stringify(newSection), { status:200})
    }
    catch(error){
        console.log(error);
        return new Response(JSON.stringify({error:"Error creating section"}, {status:500}));
    }
}