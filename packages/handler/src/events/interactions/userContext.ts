import { MessageFlags } from "@discordjs/core";
import { checkRedis, env } from "core";
import { Logger } from "logger";
import type { UserContextHandler } from "../../classes/userContextInteraction.js";

const logger = new Logger();

export const handler: UserContextHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received user context interaction: ${interaction.data.name}`, "Handler");

    const context = client.userContextCommands.get(interaction.data.name);
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
        context.execute(interaction);
    } catch (error: any) {
        logger.error("Command execution error:", "Handler", error);
    }
};
