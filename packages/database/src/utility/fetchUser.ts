import prisma from "../index.js";

export async function fetchUser(id: bigint): Promise<any | null> {
    const db = await prisma;
    const user = await db.user.findUnique({
        where: {
            discord_id: id,
        },
        include: { guilds: true, anilist: true },
    });

    return user;
}
