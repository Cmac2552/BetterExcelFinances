import { PrismaClient } from "@prisma/client";

const primsa = new PrismaClient();

export async function POST(request) {
    
    try{
        const {month, title, userId} = {month:new Date("October 2024"), title:"test1", userId:1};
        const newSection = await primsa.section.create({
            data:{
                month, 
                title, 
                userId
            }
        });
        console.log("done");
        return new Response(JSON.stringify(newSection), { status:200})
    }
    catch(error){
        console.log(error);
        return new Response(JSON.stringify({error:"Error creating section"}, {status:500}));
    }
}