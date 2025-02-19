import type { User } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function dbDeleteAnilistUser(discord_id: string): Promise<User> {
    const db = await prisma;

    const discord_id_bigint = BigInt(discord_id);

    await db.anilist.deleteMany({
        where: {
            user_id: discord_id_bigint,
        },
    });

    await db.guild.deleteMany({
        where: {
            users: {
                some: {
                    discord_id: discord_id_bigint,
                },
            },
        },
    });

    return db.user.delete({
        where: {
            discord_id: discord_id_bigint,
        },
    });
}
