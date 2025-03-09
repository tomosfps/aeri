import prisma from "../index.js";

export async function dbIncrementCommands(count = 1) {
    const db = await prisma;

    return db.statistics.upsert({
        where: {
            id: "global",
        },
        update: {
            commands_used: {
                increment: count,
            },
        },
        create: {
            id: "global",
            commands_used: count,
        },
    });
}
