import { getRedis } from "core";

const redis = await getRedis();

export async function getCommandAsMention(command: string) {
    const commandId = await redis.hget(`commands:${command}`, "id");
    return `<\/${command}:${commandId}>`;
}

export function getUserAvatar(userId: string, hash: string | null) {
    return hash
        ? `https://cdn.discordapp.com/avatars/${userId}/${hash}.png?size=1024`
        : `https://cdn.discordapp.com/embed/avatars/${(Number(userId) >> 22) % 6}.png?size=1024`;
}

export function getUserGuildAvatar(guildId: string, userId: string, hash: string | undefined | null) {
    return hash
        ? `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${hash}.png?size=1024`
        : getUserAvatar(userId, null);
}
