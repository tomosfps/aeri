import prisma from "../index.js";

export async function fetchAllUsers(guild_id: bigint): Promise<any> {
    const db = await prisma;
    const users = await db.user.findMany({
        where: {
            guilds: {
                some: {
                    id: guild_id,
                },
            },
        },
        include: { anilist: true },
    });

    return users;
}
