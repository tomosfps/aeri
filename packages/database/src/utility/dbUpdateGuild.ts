import type { Guild } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function updateGuild(guild_id: bigint, discord_id: bigint): Promise<Guild> {
    const db = await prisma;
    return db.guild.upsert({
        create: {
            id: guild_id,
            users: {
                connectOrCreate: {
                    where: {
                        discord_id: discord_id,
                    },
                    create: {
                        discord_id: discord_id,
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
                    },
                },
            },
        },
        where: {
            id: guild_id,
        },
    });
}
