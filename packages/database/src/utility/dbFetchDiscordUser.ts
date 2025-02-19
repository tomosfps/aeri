import type { Anilist, Guild, User } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export interface UserWithRelations extends User {
    anilist: Anilist | null;
    guilds: Guild[];
}

export async function dbFetchDiscordUser(id: string): Promise<UserWithRelations | null> {
    const db = await prisma;

    return db.user.findUnique({
        where: {
            discord_id: BigInt(id),
        },
        include: { guilds: true, anilist: true },
    });
}
