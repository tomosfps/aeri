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

export async function handleComponentExpiry(interactionToken: string): Promise<void> {
    try {
        await api.interactions.editReply(env.DISCORD_APPLICATION_ID, interactionToken, {
            components: [],
        });
        logger.debugSingle("Removed component from message", "Redis");
    } catch (error: any) {
        if (error.rawError && (error.rawError.code === 50006 || error.rawError.code === 50027)) {
            logger.errorSingle(`Component already expired or invalid token (${error.rawError.code})`, "Redis");
        } else {
            logger.error("Error while removing component", "Redis", error);
        }
    }
}

export async function setComponentExpiry(customId: string, interactionToken: string, userId: string): Promise<void> {
    const expireKey = `component:${customId}:${interactionToken}:${userId}`;
    await redis.setex(expireKey, 900, "");
    logger.debugSingle(`Set component expiry for ${customId} for ${userId}`, "Redis");
}
