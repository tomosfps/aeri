import type { User } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function dbFetchGuildUsers(guild_id: bigint): Promise<User[]> {
    const db = await prisma;
    const users = await db.user.findMany({
        where: {
            guilds: {
                some: {
                    id: guild_id,
                },
            },
        },
        include: { anilist: true },
    });

    return users;
}
