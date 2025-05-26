import { getRedis } from "core";

type cooldownCheckResult = { canUse: true } | { canUse: false; expirationTime: number };
const redis = await getRedis();

export async function checkCommandCooldown(
    redisKey: string,
    userID: string,
    cooldown: number | undefined,
): Promise<cooldownCheckResult> {
    if (await redis.exists(redisKey)) {
        const redisTTL = await redis.ttl(redisKey);
        const expirationTime = Date.now() + redisTTL * 1000;
        return { canUse: false, expirationTime: Math.round(expirationTime / 1000) };
    }

    if (cooldown) {
        await redis.setex(redisKey, cooldown, userID);
    }

    return { canUse: true };
}
