import { API } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { env, getRedis } from "core";
import { Logger } from "logger";

type cooldownCheckResult = { canUse: true } | { canUse: false; expirationTime: number };

const redis = await getRedis();
const rest = new REST().setToken(env.DISCORD_TOKEN);
const api = new API(rest);
const logger = new Logger();

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

export async function handlerComponentExpiry(interactionToken: string): Promise<void> {
    try {
        await api.interactions.editReply(env.DISCORD_APPLICATION_ID, interactionToken, {
            components: [],
        });
        logger.debugSingle("Removed component from message", "Redis");
    } catch (error: any) {
        if (error.rawError.code !== 50006) {
            logger.error("Error while removing component", "Redis", error);
        }

        logger.errorSingle("Component already removed", "Redis");
    }
}

export async function setComponentExpiry(prefix: "select" | "button", redisKey: string, ttl: number): Promise<void> {
    const expireKey = `${prefix}:${redisKey}`;
    await redis.setex(expireKey, ttl, "");
    logger.debugSingle(`Set component expiry for ${expireKey}`, "Redis");
}
