import { Redis, type RedisOptions } from "ioredis";
import { Logger } from "log";
import { env } from "./env.js";

const logger = new Logger();
const redisInstances: { [key: string]: Redis } = {};

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
        redis.set(redisKey, memberID);
        redis.expire(redisKey, command.cooldown);
    }
    return 0;
}

export async function setExpireCommand(redisKey: string, ttl: number, api: any, interaction: any): Promise<any> {
    const redis = await getRedis();

    if (await redis.exists(redisKey)) {
        logger.debugSingle(`Key already exists: ${redisKey}`, "Redis");
        return false;
    }

    logger.debugSingle(`Setting expire time for select menu: ${redisKey}`, "Redis");
    await redis.setex(redisKey, ttl, "");
    setTimeout(async () => await handleSelectMenuExpiration(redisKey, api, interaction), ttl * 1000);
    return true;
}

async function handleSelectMenuExpiration(redisKey: string, api: any, interaction: any) {
    logger.infoSingle(`Select menu expired: ${redisKey}`, "Handler");

    const message = await api.channels.getMessage(interaction.channel.id, interaction.message.id);
    if (message) {
        await api.channels.editMessage(interaction.channel.id, interaction.message.id, {
            components: [],
        });
        logger.debugSingle(`Removed select menu from message: ${redisKey}`, "Redis");
    } else {
        logger.warnSingle(`Message not found for select menu: ${redisKey}`, "Redis");
    }
}