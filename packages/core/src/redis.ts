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
