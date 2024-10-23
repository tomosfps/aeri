import prisma from "../index.js";

export async function fetchAllUsers(): Promise<any> {
    const db = await prisma;
    const users = await db.user.findMany({ include: { anilist: true } });

    return users;
}
