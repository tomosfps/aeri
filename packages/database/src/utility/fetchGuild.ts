import type { Guild } from "../../prisma/gen/client/index.js";
import prisma from "../index.js";

export async function fetchGuild(guild_id: bigint): Promise<Guild | null> {
    const db = await prisma;
    const guild = (await db.guild.findUnique({ where: { id: guild_id }, include: { users: true } })) as Guild;
    return guild;
}
