import { Redis, type RedisOptions } from "ioredis";
import { env } from "./env.js";

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
