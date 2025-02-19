import type { Anilist } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function dbFetchAnilistUser(discord_id: string): Promise<Anilist | null> {
    const db = await prisma;

    return db.anilist.findUnique({
        where: {
            user_id: BigInt(discord_id),
        },
        include: { user: true },
    });
}
