import { prisma } from "../../lib/prisma";
import { auth } from "@/auth"

export async function GET(req){
    const session = await auth();
    const { searchParams }= new URL(req.url);
    const date = new Date(searchParams.get('date'));
    const lastMonthFirstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
    const lastMonthLastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0, 23, 59, 59, 999));
    
    const original = await prisma.section.findMany({
        where:{
            userId:session.user.id,
            month:{
                gte: lastMonthFirstDay,
                lte: lastMonthLastDay
            }
        },
        include: {
            values: true,
            },
    });

    const newValues = original.map((value) => {
            delete value.id;
            value.month = date.toISOString();
            value.values = value.values.map((sectionItem) => {
            delete sectionItem.id; 
            delete sectionItem.sectionId
            return sectionItem;
            })
            return value;
    });
    const stuff = await createSectionsWithItems(newValues);
        
    return new Response(JSON.stringify(stuff), { status:200});

}

const createSectionsWithItems = async (data) => {
    return await Promise.all(
      data.map(section => 
        prisma.section.upsert({
          where: {title_month: {
            title:section.title,
            month:section.month
          }},
          update:{
            ...section,
            values: {
              create: section.values
            }
          }, 
          create:{
            ...section,
            values: {
              create: section.values
            }
          },
          include: {
            values: true
          }
        })
      )
    );
  };