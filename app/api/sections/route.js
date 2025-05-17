import { prisma } from "../../lib/prisma";
import { auth } from "@/auth"

export async function GET(req){
    const session = await auth();
    const { searchParams }= new URL(req.url);
    const date= new Date(searchParams.get('date'));
    const firstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const sections = await prisma.section.findMany({
        where:{
            userId:session.user.id,
            month:{
                gte: firstDay,
                lte: lastDay
            }
        },
        include: {
            values: true, // Include the related SectionItem values
          },
    });

    return new Response(JSON.stringify(sections), { status:200});

}
