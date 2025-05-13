import { prisma } from "../../../lib/prisma";
import { auth } from "@/auth"

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

async function updateSectionItems(fieldNames, fieldValues, existingSectionItems, sectionId) {
    const updates = fieldNames.map((fieldName, index) => {
        const existingValue = existingSectionItems.find(
            (ev) => ev.label === fieldName
        );
        const fieldValue = fieldValues[index];

        if (existingValue) {
            return prisma.sectionItem.update({
                where: { id: existingValue.id },
                data: { value: fieldValue },
            });
        } else {
            return prisma.sectionItem.create({
                data: { label: fieldName, value: fieldValue, sectionId: sectionId },
            });
        }
    });
    return await Promise.all(updates);
}


export async function PUT(request, props) {
    const params = await props.params;
    try {
        const { id } = params;
        const data = await request.json();
        // const session = await getServerSession(authOptions);
        const session = await auth();

        const submissionData = JSON.parse(JSON.stringify(data));
        submissionData.userId = session.user.id;

        const fieldNames = submissionData.fieldNames;
        const fieldValues = submissionData.fieldValues;
        delete submissionData.fieldNames;
        delete submissionData.fieldValues;

        const section = await prisma.section.findUnique({
            where: { id: parseInt(id) },
            include: { values: true },
        });

        const existingSectionItems = section.values;

        await updateSectionItems(fieldNames, fieldValues, existingSectionItems, parseInt(id));

        delete submissionData.values;

        const updatedSection = await prisma.section.update({
        where: { id: parseInt(id) },
        data: submissionData,
        include: { values: true },
        });    

        return new Response(JSON.stringify(updatedSection), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(
            JSON.stringify({ error: "Error updating Section" }),
            { status: 500 }
        );
    }
}
