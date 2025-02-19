import type { Guild } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function dbCreateGuild(guild_id: string): Promise<Guild> {
    const db = await prisma;

    return db.guild.create({
        data: {
            id: BigInt(guild_id),
        },
    });
}
