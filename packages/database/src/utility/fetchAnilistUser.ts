import type { Anilist } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function fetchAnilistUser(discord_id: bigint): Promise<Anilist> {
    const db = await prisma;
    const user = await db.anilist.findUnique({
        where: {
            user_id: discord_id,
        },
    });

    if (!user) {
        throw new Error(`Could not find user with discord_id: ${discord_id}`);
    }

    return user;
}
