import { prisma } from "../../lib/prisma";

export async function GET(req){
    const { searchParams }= new URL(req.url);
    const date= new Date(searchParams.get('date'));
    
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const sections = await prisma.section.findMany({
        where:{
            userId:1,
            month:{
                gte: new Date(firstDay),
                lte: new Date(lastDay)
            }
        },
        include: {
            values: true, // Include the related SectionItem values
          },
    });

    return new Response(JSON.stringify(sections), { status:200});

}

function dateConversion(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0'); 
    const year = date.getFullYear(); 
    return `${month}/${day}/${year}`
}