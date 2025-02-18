import type { Guild } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function dbCreateGuild(guild_id: bigint): Promise<Guild> {
    const db = await prisma;
    const guild = await db.guild.create({
        data: {
            id: guild_id,
        },
    });

    return guild;
}
