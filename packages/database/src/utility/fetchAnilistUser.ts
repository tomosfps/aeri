import prisma from "../index.js";

export async function fetchAnilistUser(discord_id: string) {
    const db = await prisma;

    return db.anilist.findUnique({
        where: {
            user_id: BigInt(discord_id),
        },
        include: { user: true },
    });
}
