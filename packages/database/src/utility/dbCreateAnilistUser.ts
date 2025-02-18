import type { User } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function dbCreateAnilistUser(
    discord_id: bigint,
    anilist_id: bigint,
    anilist_username: string,
    guild_id: bigint,
    anilist_token?: string | null,
): Promise<User> {
    const db = await prisma;

    let user = await db.user.findUnique({
        where: {
            discord_id: discord_id,
        },
    });

    if (!user) {
        user = await db.user.create({
            data: {
                discord_id: discord_id,
            },
        });
    }

    await db.anilist.upsert({
        where: { id: anilist_id },
        create: {
            id: anilist_id,
            username: anilist_username,
            token: anilist_token ?? null,
            user: {
                connect: {
                    discord_id: discord_id,
                },
            },
        },
        update: {
            username: anilist_username,
            token: anilist_token ?? null,
        },
    });

    await db.guild.upsert({
        where: { id: guild_id },
        create: {
            id: guild_id,
            users: {
                connect: {
                    discord_id: discord_id,
                },
            },
        },
        update: {
            users: {
                connect: {
                    discord_id: discord_id,
                },
            },
        },
    });

    return user;
}
