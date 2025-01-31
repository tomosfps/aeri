import { MessageFlags } from "@discordjs/core";
import { checkRedis } from "core";
import { Logger } from "log";
import { type ChatInputHandler, CommandInteraction } from "../../classes/commandInteraction.js";

const logger = new Logger();

export const handler: ChatInputHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received chat input interaction: ${interaction.data.name}`, "Handler");

    const command = client.commands.get(interaction.data.name);
    const memberId = interaction.member?.user.id;

    if (!memberId) {
        logger.warnSingle("Member was not found", "Handler");
        return;
    }

    if (!command) {
        logger.warn(`Command not found: ${interaction.data.name}`, "Handler");
        return;
    }

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
        command.execute(new CommandInteraction(interaction, api, client));
    } catch (error: any) {
        logger.error("Command execution error:", "Handler", error);
    }
};
