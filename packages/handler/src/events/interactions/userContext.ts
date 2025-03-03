import { MessageFlags } from "@discordjs/core";
import { checkRedis, env } from "core";
import { dbUpdateGuild } from "database";
import { Logger } from "logger";
import type { UserContextHandler } from "../../classes/UserContextInteraction.js";

const logger = new Logger();

export const handler: UserContextHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received user context interaction: ${interaction.data.name}`, "Handler");

    const context = client.userContextCommands.get(interaction.data.name);

    if (!context) {
        logger.warn(`Context command not found: ${interaction.data.name}`, "Handler");
        return;
    }

    const memberId = interaction.member?.user.id;

    if (!memberId) {
        logger.warnSingle("Member was not found", "Handler");
        return;
    }

    if (context.data.owner_only && env.DISCORD_OWNER_IDS && !env.DISCORD_OWNER_IDS.includes(memberId)) {
        logger.warnSingle("Command is owner only", "Handler");
        return api.interactions.reply(interaction.id, interaction.token, {
            content: "This command is only available to the bot owner.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (interaction.guild_id) {
        await dbUpdateGuild(interaction.guild_id, memberId);
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
