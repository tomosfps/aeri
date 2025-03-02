import prisma from "../index.js";

export async function dbCreateGuild(guild_id: string) {
    const db = await prisma;

    return db.guild.create({
        data: {
            id: BigInt(guild_id),
        },
    });
}
