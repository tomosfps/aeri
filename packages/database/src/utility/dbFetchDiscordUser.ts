import prisma from "../index.js";

export async function dbFetchDiscordUser(id: string) {
    const db = await prisma;

    return db.user.findUnique({
        where: {
            discord_id: BigInt(id),
        },
        include: { guilds: true, anilist: true },
    });
}
