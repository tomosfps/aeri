import prisma from "../index.js";

export async function fetchGuildUsers(guild_id: string) {
    const db = await prisma;

    return db.user.findMany({
        where: {
            guilds: {
                some: {
                    id: BigInt(guild_id),
                },
            },
        },
        include: { anilist: true },
    });
}
