import prisma from "../index.js";

export async function dbSetCommandsUsed(count: number) {
    const db = await prisma;

    return db.statistics.upsert({
        where: {
            id: "global",
        },
        update: {
            commands_used: count,
        },
        create: {
            id: "global",
            commands_used: count,
        },
    });
}
