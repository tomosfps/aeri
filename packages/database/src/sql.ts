import { Logger } from "logger";
import { PrismaClient } from "../prisma/gen/client/default.js";

const logger = new Logger();

export async function connectPrisma() {
    const prisma = new PrismaClient({
        log: [
            {
                emit: "event",
                level: "info",
            },
            {
                emit: "event",
                level: "warn",
            },
            {
                emit: "event",
                level: "error",
            },
        ],
    });

    prisma.$on("info", (e: any) => {
        logger.info("Info", "Prisma", { message: e.message, timestamp: e.timestamp });
    });

    prisma.$on("warn", (e: any) => {
        logger.warn("Warn", "Prisma", { message: e.message, target: e.target, timestamp: e.timestamp });
    });

    prisma.$on("error", (e: any) => {
        logger.error("Error", "Prisma", { message: e.message, target: e.target, timestamp: e.timestamp });
    });

    prisma.$connect();

    return prisma;
}
