import { MessageFlags } from "@discordjs/core";
import { TimestampStyles, time } from "@discordjs/formatters";
import { env } from "core";
import { updateGuild } from "database";
import { Logger } from "logger";
import type { MessageContextHandler } from "../../classes/MessageContextInteraction.js";
import { checkCommandCooldown } from "../../utility/redisUtil.js";

const logger = new Logger();

export const handler: MessageContextHandler = async (interaction, api, client) => {
    const context = client.messageContextCommands.get(interaction.data.name);

    if (!context) {
        logger.warn(`Context not found: ${interaction.data.name}`, "Handler");
        return;
    }
    if (!interaction.user.id) {
        return;
    }

    if (context.data.owner_only && env.DISCORD_OWNER_IDS && !env.DISCORD_OWNER_IDS.includes(interaction.user.id)) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: "This command is only available to the bot owner.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (interaction.guildID) {
        await updateGuild(interaction.guildID, interaction.user.id);
    }

    const redisKey = `${interaction.data.name}:${interaction.user.id}`;
    const timeout = context.data.cooldown ?? 900;
    const check = await checkCommandCooldown(redisKey, interaction.user.id, timeout);
    if (!check.canUse) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this command again in ${time(check.expirationTime, TimestampStyles.RelativeTime)}`,
            flags: MessageFlags.Ephemeral,
        });
    }

    try {
        logger.debugSingle(`Executing command: ${context.data.name}`, "Handler");
        context.execute(interaction);
    } catch (error: any) {
        logger.error("Command execution error:", "Handler", error);
    }
};
