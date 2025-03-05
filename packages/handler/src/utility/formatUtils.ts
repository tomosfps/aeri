import { getRedis } from "core";

const redis = await getRedis();

export async function getCommandAsMention(command: string) {
    const commandId = await redis.hget(`commands:${command}`, "id");
    return `<\/${command}:${commandId}>`;
}
