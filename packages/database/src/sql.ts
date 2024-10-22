import { Logger } from "log";
import { PrismaClient } from "../prisma/gen/client/default.js";

const logger = new Logger();

export async function connectPrisma() {
    const prisma = new PrismaClient({
        log: [
            {
                emit: "event",
                level: "query",
            },
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

    prisma.$on("query", (e: any) => {
        logger.info("Query Created:", "Prisma", { duration: `${e.duration}ms`, timestamp: e.timestamp });
    });

    prisma.$on("info", (e: any) => {
        logger.info("Info", "Prisma", { message: e.message, timestamp: e.timestamp });
    });

    prisma.$on("warn", (e: any) => {
        logger.info("Warn", "Prisma", { message: e.message, target: e.target, timestamp: e.timestamp });
    });

    prisma.$on("error", (e: any) => {
        logger.info("Error", "Prisma", { message: e.message, target: e.target, timestamp: e.timestamp });
    });

    prisma.$connect();

    return prisma;
}
