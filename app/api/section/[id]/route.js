import { prisma } from "../../../lib/prisma";

export async function DELETE(request, props) {
    const params = await props.params;
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