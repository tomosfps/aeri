import type { User } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function deleteAnilistUser(discord_id: bigint): Promise<User> {
    const db = await prisma;

    await db.anilist.deleteMany({
        where: {
            user_id: discord_id,
        },
    });

    await db.guild.deleteMany({
        where: {
            users: {
                some: {
                    discord_id: discord_id,
                },
            },
        },
    });

    const user = await db.user.delete({
        where: {
            discord_id: discord_id,
        },
    });

    return user;
}
