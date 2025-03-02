import prisma from "../index.js";

export async function dbFetchGuildUser(guild_id: string, discord_id: string) {
    const db = await prisma;

    return db.guild.findUnique({
        where: { id: BigInt(guild_id) },
        select: {
            users: {
                where: { discord_id: BigInt(discord_id) },
                select: { discord_id: true },
            },
        },
    });
}
