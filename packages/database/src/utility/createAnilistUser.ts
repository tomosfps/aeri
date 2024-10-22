import type { User } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function createAnilistUser(
    discord_id: bigint,
    username: string,
    anilist_id: bigint,
    anilist_username: string,
): Promise<User> {
    const db = await prisma;
    const user = await db.user.create({
        data: {
            discord_id: discord_id,
            username: username,
            anilist: {
                create: {
                    id: anilist_id,
                    username: anilist_username,
                },
            },
        },
    });

    return user;
}
