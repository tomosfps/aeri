import type { User } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function createAnilistUser(
    discord_id: bigint,
    username: string,
    anilist_id: bigint,
    anilist_username: string,
    guild_id: bigint,
): Promise<User> {
    const db = await prisma;
    const user = await db.user.create({
        data: {
            discord_id: discord_id,
            username: username,
        },
    });

    await db.anilist.create({
        data: {
            id: anilist_id,
            username: anilist_username,
            user: {
                connect: {
                    discord_id: discord_id,
                },
            },
        },
    });

    await db.guild.upsert({
        create: {
            id: guild_id,
        },

        update: {
            id: guild_id,
            users: {
                connect: {
                    discord_id: discord_id,
                },
            },
        },

        where: {
            id: guild_id,
        },
    });

    return user;
}
