import prisma from "../index.js";

export async function createGuild(guild_id: string) {
    const db = await prisma;

    return db.guild.create({
        data: {
            id: BigInt(guild_id),
        },
    });
}
