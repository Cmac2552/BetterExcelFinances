import { prisma } from "../../../lib/prisma";

export async function DELETE(request, {params}) {
    console.log('test');
    try {
        const { id } = params;
        console.log(id);
        const deleteSection = await prisma.section.delete({
            where: {id: parseInt(id)}
        })
        console.log(deleteSection);
        return new Response(JSON.stringify({}), {status: 200})
    }
    catch (error) {
        console.log(error);
        return new Response(JSON.stringify({error:"Error delete Section"}), {status: 500})
    }
}