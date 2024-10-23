import type { User } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function fetchUser(id: bigint): Promise<User | null> {
    const db = await prisma;
    const user = (await db.user.findUnique({
        where: {
            discord_id: id,
        },
        include: { guilds: true, anilist: true },
    })) as User;

    return user;
}
