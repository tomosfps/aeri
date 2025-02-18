import type { Guild } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function dbRemoveFromGuild(discord_id: bigint, guild_id: bigint): Promise<Guild> {
    const db = await prisma;

    const userInGuild = await db.guild.findUnique({
        where: { id: guild_id },
        select: {
            users: {
                where: { discord_id: discord_id },
                select: { discord_id: true },
            },
        },
    });

    if (!userInGuild || userInGuild.users.length === 0) {
        throw new Error(`User with discord_id ${discord_id} is not part of guild with id ${guild_id}.`);
    }

    // Disconnect the user from the guild
    const updatedGuild = await db.guild.update({
        where: { id: guild_id },
        data: {
            users: {
                disconnect: { discord_id: discord_id },
            },
        },
    });

    return updatedGuild;
}
