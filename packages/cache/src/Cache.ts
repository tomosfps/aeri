import { getRedis } from "core";
import type { Redis } from "ioredis";
import { GatewayCache } from "./caches/Gateway.js";

export class Cache {
    private readonly redis: Redis;

    private constructor(redis: Redis) {
        this.redis = redis;
        this.gateway = new GatewayCache(this.redis);
    }

    public static async new(prefix: string): Promise<Cache> {
        const redis = await getRedis({ keyPrefix: prefix });
        return new Cache(redis);
    }

    public gateway;
}
