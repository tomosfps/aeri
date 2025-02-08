import { API } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { Redis, type RedisOptions } from "ioredis";
import { Logger } from "logger";
import { env } from "./env.js";

const logger = new Logger();
const redisInstances: { [key: string]: Redis } = {};
const rest = new REST().setToken(env.DISCORD_TOKEN);
const api = new API(rest);

export async function getRedis(options?: RedisOptions): Promise<Redis> {
    const optionsString = options ? JSON.stringify(options) : "default";

    if (redisInstances[optionsString]) {
        return redisInstances[optionsString] as Redis;
    }

    const redis = new Redis({
        lazyConnect: true,
        enableAutoPipelining: true,
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        db: env.REDIS_DATABASE,
        ...options,
    });

    await redis.connect();
    await redis.config("SET", "notify-keyspace-events", "Ex");

    redisInstances[optionsString] = redis;
    return redis;
}

export async function checkRedis(redisKey: string, command: any, memberID: string): Promise<number> {
    const redis = await getRedis();

    if (await redis.exists(redisKey)) {
        const redisTTL = await redis.ttl(redisKey);
        const expirationTime = Date.now() + redisTTL * 1000;
        return Math.round(expirationTime / 1000);
    }

    if (command.cooldown) {
        await redis.setex(redisKey, command.cooldown, memberID);
    }
    return 0;
}

export async function setExpireCommand(redisKey: string, ttl: number): Promise<any> {
    const redis = await getRedis();

    if (await redis.exists(redisKey)) {
        logger.debugSingle(`Key already exists: ${redisKey}`, "Redis");
        return false;
    }

    logger.debugSingle(`Setting expire time for component: ${redisKey} to ${ttl}`, "Redis");
    await redis.setex(redisKey, ttl, "");
    return true;
}

export async function handleExpiration(redisKey: string): Promise<void> {
    logger.debug(`Handling expiration for component: ${redisKey}`, "Redis");

    const [prefix, channelId, messageId] = redisKey.split(":");
    logger.debug(`Component keys: ${redisKey}`, "Redis", {
        prefix,
        channelId,
        messageId,
    });

    if (!channelId || !messageId) {
        logger.warnSingle(`Invalid interaction data: ${redisKey}`, "Redis");
        return;
    }

    const message = await api.channels.getMessage(channelId, messageId);
    if (message.id) {
        try {
            await api.channels.editMessage(channelId, messageId, {
                components: [],
            });
            logger.debugSingle(`Removed component from message: ${redisKey}`, "Redis");
        } catch (error: any) {
            logger.error(`Error while removing component: ${redisKey}`, "Redis", error);
        }
    } else {
        logger.warnSingle(`Message not found for component: ${redisKey}`, "Redis");
    }
}
