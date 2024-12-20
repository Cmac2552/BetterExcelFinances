import { prisma } from "../../lib/prisma";

export async function GET(){

    const sections = await prisma.section.findMany({
        where:{
            userId:1,
            month:{
                gte: new Date("11/30/2024"),
                lte: new Date("12/31/2024")
            }
        },
        include: {
            values: true, // Include the related SectionItem values
          },
    });

    return new Response(JSON.stringify(sections), { status:200});

}