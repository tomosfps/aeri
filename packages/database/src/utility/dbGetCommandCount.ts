import prisma from "../index.js";

export async function dbGetCommandCount(): Promise<bigint> {
    const db = await prisma;
    const stats = await db.statistics.findUnique({
        where: { id: "global" },
    });
    return stats?.commands_used ?? BigInt(0);
}
