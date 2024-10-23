import type { Guild } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function createGuild(guild_id: bigint, discord_id: bigint, discord_name: string): Promise<Guild> {
    const db = await prisma;
    const guild = await db.guild.upsert({
        create: {
            id: guild_id,
        },

        update: {
            id: guild_id,
            users: {
                create: {
                    discord_id: discord_id,
                    username: discord_name,
                },
            },
        },

        where: {
            id: guild_id,
        },

        include: {
            users: true,
        },
    });

    return guild;
}
