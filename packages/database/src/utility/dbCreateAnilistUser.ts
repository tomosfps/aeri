import prisma from "../index.js";

export async function dbCreateAnilistUser(
    discord_id: string,
    anilist_id: number,
    anilist_username: string,
    guild_id: string | undefined,
    anilist_token?: string | null,
) {
    const db = await prisma;

    const discord_id_bigint = BigInt(discord_id);
    const anilist_id_bigint = BigInt(anilist_id);

    let user = await db.user.findUnique({
        where: {
            discord_id: discord_id_bigint,
        },
    });

    if (!user) {
        user = await db.user.create({
            data: {
                discord_id: discord_id_bigint,
            },
        });
    }

    await db.anilist.upsert({
        where: { id: anilist_id_bigint },
        create: {
            id: anilist_id_bigint,
            username: anilist_username,
            token: anilist_token ?? null,
            user: {
                connect: {
                    discord_id: discord_id_bigint,
                },
            },
        },
        update: {
            username: anilist_username,
            token: anilist_token ?? null,
        },
    });

    if (guild_id) {
        const guild_id_bigint = BigInt(guild_id);

        await db.guild.upsert({
            where: { id: guild_id_bigint },
            create: {
                id: guild_id_bigint,
                users: {
                    connect: {
                        discord_id: discord_id_bigint,
                    },
                },
            },
            update: {
                users: {
                    connect: {
                        discord_id: discord_id_bigint,
                    },
                },
            },
        });
    }

    return user;
}
