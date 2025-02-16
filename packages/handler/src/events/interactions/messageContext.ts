import { checkRedis, env } from "core";
import { MessageFlags } from "discord-api-types/v10";
import { Logger } from "logger";
import { type MessageContextHandler, MessageContextInteraction } from "../../classes/messageContextInteraction.js";

const logger = new Logger();

export const handler: MessageContextHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received message context interaction: ${interaction.data.name}`, "Handler");

    const context = client.messageContextCommands.get(interaction.data.name);
    const memberId = interaction.member?.user.id;
    const ownerOnly = context?.owner_only ?? false;

    if (!memberId) {
        logger.warnSingle("Member was not found", "Handler");
        return;
    }

    if (ownerOnly && env.DISCORD_OWNER_IDS && !env.DISCORD_OWNER_IDS.includes(memberId)) {
        logger.warnSingle("Command is owner only", "Handler");
        return api.interactions.reply(interaction.id, interaction.token, {
            content: "This command is only available to the bot owner.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (!context) {
        logger.warn(`Context not found: ${interaction.data.name}`, "Handler");
        return;
    }

    const redisKey = `${interaction.data.name}_${memberId}`;
    const check = await checkRedis(redisKey, context, memberId);
    if (check !== 0) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this context command again in <t:${check}:R>`,
            flags: MessageFlags.Ephemeral,
        });
    }

    try {
        logger.infoSingle(`Executing command: ${context.data.name}`, "Handler");
        context.execute(new MessageContextInteraction(interaction, api, client));
    } catch (error: any) {
        logger.error("Command execution error:", "Handler", error);
    }
};
