import { prisma } from "../../../lib/prisma"; // Adjust path as needed

export async function DELETE(request, props) {
  const params = await props.params;
  try {
    const { id } = params; 
    const sectionItem = await prisma.sectionItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!sectionItem) {
      return new Response(JSON.stringify({ error: "SectionItem not found" }), {
        status: 404,
      });
    }

    await prisma.sectionItem.delete({
      where: { id: parseInt(id) },
    });

    return new Response(JSON.stringify({}), { status: 200 });
  } catch (error) {
    console.error("Error deleting SectionItem:", error);
    return new Response(JSON.stringify({ error: "Error deleting SectionItem" }), {
      status: 500,
    });
  }
}

export async function PATCH(request, props) {
  const params = await props.params;
  try{
      const { id } = params; 
      const data = await request.json();
      
      const updatedSection = await prisma.sectionItem.update({
          where: {id: parseInt(id)},
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