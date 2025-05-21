import { MessageFlags } from "@discordjs/core";
import { TimestampStyles, time } from "@discordjs/formatters";
import { env, getRedis } from "core";
import { dbUpdateGuild } from "database";
import { Logger } from "logger";
import type { ChatInputHandler } from "../../classes/ChatInputCommandInteraction.js";
import { checkCommandCooldown } from "../../utility/redisUtil.js";

const logger = new Logger();
const redis = await getRedis();

export const handler: ChatInputHandler = async (interaction, api, client) => {
    const command = client.commands.get(interaction.data.name);

    if (!command) {
        logger.warn(`Command not found: ${interaction.data.name}`, "Handler");
        return;
    }

    if (!interaction.user.id) {
        return;
    }

    if (command.data.ownerOnly && env.DISCORD_OWNER_IDS && !env.DISCORD_OWNER_IDS.includes(interaction.user.id)) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: "This command is only available to the bot owner.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (interaction.guildID) {
        await dbUpdateGuild(interaction.guildID, interaction.user.id);
    }

    const redisKey = `${interaction.data.name}:${interaction.user.id}`;
    const timeout = command.data.cooldown ?? 900;
    const check = await checkCommandCooldown(redisKey, interaction.user.id, timeout);
    if (!check.canUse) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this command again in ${time(check.expirationTime, TimestampStyles.RelativeTime)}`,
            flags: MessageFlags.Ephemeral,
        });
    }

    await redis.hincrby("statistics", "commands", 1).catch((err: any) => {
        logger.error("Failed to update commands count in Redis", "Handler", err);
    });

    try {
        logger.debugSingle(`Executing command: ${command.data.name}`, "Handler");
        command.execute(interaction);
    } catch (error: any) {
        logger.error("Command execution error:", "Handler", error);
    }
};
