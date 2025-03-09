import { MessageFlags } from "@discordjs/core";
import { env, getRedis } from "core";
import { dbIncrementCommands, dbUpdateGuild } from "database";
import { Logger } from "logger";
import type { ChatInputHandler } from "../../classes/ChatInputCommandInteraction.js";
import { checkCommandCooldown } from "../../utility/redisUtil.js";

const logger = new Logger();
const redis = await getRedis();

export const handler: ChatInputHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received chat input interaction: ${interaction.data.name}`, "Handler");

    const command = client.commands.get(interaction.data.name);

    if (!command) {
        logger.warn(`Command not found: ${interaction.data.name}`, "Handler");
        return;
    }

    const memberId = interaction.user.id;

    if (!memberId) {
        logger.warnSingle("Member was not found", "Handler");
        return;
    }

    if (command.data.owner_only && env.DISCORD_OWNER_IDS && !env.DISCORD_OWNER_IDS.includes(memberId)) {
        logger.warnSingle("Command is owner only", "Handler");
        return api.interactions.reply(interaction.id, interaction.token, {
            content: "This command is only available to the bot owner.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (interaction.guild_id) {
        await dbUpdateGuild(interaction.guild_id, memberId);
    }

    const redisKey = `${interaction.data.name}:${memberId}`;
    const timeout = command.data.cooldown ?? 900;
    const check = await checkCommandCooldown(redisKey, memberId, timeout);
    if (!check.canUse) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this command again in <t:${check.expirationTime}:R>`,
            flags: MessageFlags.Ephemeral,
        });
    }

    await dbIncrementCommands().catch((err: any) => {
        logger.error("Failed to increment command count in database", "Handler", err);
    });

    await redis.hincrby("statistics", "commands", 1).catch((err: any) => {
        logger.error("Failed to update commands count in Redis", "Handler", err);
    });

    try {
        logger.infoSingle(`Executing command: ${command.data.name}`, "Handler");
        command.execute(interaction);
    } catch (error: any) {
        logger.error("Command execution error:", "Handler", error);
    }
};
