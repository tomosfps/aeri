import { MessageFlags } from "@discordjs/core";
import { checkRedis } from "core";
import { env } from "core";
import { dbUpdateGuild } from "database";
import { Logger } from "logger";
import type { ChatInputHandler } from "../../classes/chatInputCommandInteraction.js";

const logger = new Logger();

export const handler: ChatInputHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received chat input interaction: ${interaction.data.name}`, "Handler");

    const command = client.commands.get(interaction.data.name);
    const memberId = interaction.user.id;
    const ownerOnly = command?.owner_only ?? false;

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

    if (!command) {
        logger.warn(`Command not found: ${interaction.data.name}`, "Handler");
        return;
    }

    await dbUpdateGuild(interaction.guild_id, memberId);
    const redisKey = `${interaction.data.name}_${memberId}`;
    const check = await checkRedis(redisKey, command, memberId);
    if (check !== 0) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this command again in <t:${check}:R>`,
            flags: MessageFlags.Ephemeral,
        });
    }

    try {
        logger.infoSingle(`Executing command: ${command.data.name}`, "Handler");
        command.execute(interaction);
    } catch (error: any) {
        logger.error("Command execution error:", "Handler", error);
    }
};
