import prisma from "./prisma";

export async function getUser(email: string) {

    try {
        return await prisma.user.findFirst({
            where: {
                email: email
            }
        });
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to get User.');
    }

}