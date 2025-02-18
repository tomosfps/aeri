import type { User } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function dbFetchGuildUser(guild_id: bigint, discord_id: bigint): Promise<User | null> {
    const db = await prisma;
    const guild = (await db.guild.findUnique({
        where: { id: guild_id },
        select: {
            users: {
                where: { discord_id: discord_id },
                select: { discord_id: true },
            },
        },
    })) as User | null;

    return guild;
}
