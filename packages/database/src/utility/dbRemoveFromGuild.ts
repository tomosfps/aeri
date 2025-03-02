import prisma from "../index.js";

export async function dbRemoveFromGuild(discord_id: string, guild_id: string) {
    const db = await prisma;

    const discord_id_bigint = BigInt(discord_id);
    const guild_id_bigint = BigInt(guild_id);

    const userInGuild = await db.guild.findUnique({
        where: { id: guild_id_bigint },
        select: {
            users: {
                where: { discord_id: discord_id_bigint },
                select: { discord_id: true },
            },
        },
    });

    if (!userInGuild || userInGuild.users.length === 0) {
        throw new Error(`User with discord_id ${discord_id_bigint} is not part of guild with id ${guild_id}.`);
    }

    return db.guild.update({
        where: { id: guild_id_bigint },
        data: {
            users: {
                disconnect: { discord_id: discord_id_bigint },
            },
        },
    });
}
