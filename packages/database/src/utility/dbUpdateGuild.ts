import type { Guild } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function dbUpdateGuild(guild_id: string, discord_id: string): Promise<Guild> {
    const db = await prisma;

    const guild_id_bigint = BigInt(guild_id);
    const discord_id_bigint = BigInt(discord_id);

    return db.guild.upsert({
        create: {
            id: guild_id_bigint,
            users: {
                connectOrCreate: {
                    where: {
                        discord_id: discord_id_bigint,
                    },
                    create: {
                        discord_id: discord_id_bigint,
                    },
                },
            },
        },
        update: {
            users: {
                connectOrCreate: {
                    where: {
                        discord_id: discord_id_bigint,
                    },
                    create: {
                        discord_id: discord_id_bigint,
                    },
                },
            },
        },
        where: {
            id: guild_id_bigint,
        },
    });
}
