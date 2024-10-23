import prisma from "../index.js";

export async function fetchGuild(guild_id: bigint, discord_id: bigint): Promise<any | null> {
    const db = await prisma;
    const guild = await db.guild.findUnique({
        where: { id: guild_id },
        select: {
            users: {
                where: { discord_id: discord_id },
                select: { discord_id: true },
            },
        },
    });

    return guild;
}
