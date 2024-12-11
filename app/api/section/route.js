import { PrismaClient } from "@prisma/client";

const primsa = new PrismaClient();

export async function POST(request) {
    
    try{
        //#TODO make this way nicer
       //map the object together, gotta go to bed tn tho
        const data = await request.json();
        const submissionData = {}
        submissionData.month = data.month;
        submissionData.userId = 1;
        submissionData.title = data.title;
        submissionData.values = {create:[]}
        data.fieldNames.forEach((name, index)=>{
            submissionData.values.create.push({label:name, value:data.fieldValues[index]})
        })
        const newSection = await primsa.section.create({
            data:submissionData
        });

        return new Response(JSON.stringify(newSection), { status:200})
    }
    catch(error){
        console.log(error);
        return new Response(JSON.stringify({error:"Error creating section"}, {status:500}));
    }
}