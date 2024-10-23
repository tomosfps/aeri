import type { Guild } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function updateGuild(guild_id: bigint, discord_id: bigint, discord_name: string): Promise<Guild> {
    const db = await prisma;
    const guild = await db.guild.upsert({
        create: {
            id: guild_id,
            users: {
                connectOrCreate: {
                    where: {
                        discord_id: discord_id,
                    },
                    create: {
                        discord_id: discord_id,
                        username: discord_name,
                    },
                },
            },
        },
        update: {
            users: {
                connectOrCreate: {
                    where: {
                        discord_id: discord_id,
                    },
                    create: {
                        discord_id: discord_id,
                        username: discord_name,
                    },
                },
            },
        },
        where: {
            id: guild_id,
        },
    });

    return guild;
}
