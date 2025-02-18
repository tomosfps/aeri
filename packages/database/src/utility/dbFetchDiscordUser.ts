import type { Anilist, Guild, User } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export interface UserWithRelations extends User {
    anilist: Anilist | null;
    guilds: Guild[];
}

export async function dbFetchDiscordUser(id: bigint): Promise<UserWithRelations | null> {
    const db = await prisma;
    const user = (await db.user.findUnique({
        where: {
            discord_id: id,
        },
        include: { guilds: true, anilist: true },
    })) as UserWithRelations | null;

    return user;
}
