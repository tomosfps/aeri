import { MessageFlags } from "@discordjs/core";
import { checkRedis } from "core";
import { Logger } from "log";
import { type ButtonHandler, ButtonInteraction } from "../../classes/buttonInteraction.js";

const logger = new Logger();

export const handler: ButtonHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received button interaction: ${interaction.data.custom_id}`, "Handler");

    const [buttonId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
    const button = client.buttons.get(buttonId);
    const memberId = interaction.member?.user.id;
    const toggable = button?.toggable ?? false;

    if (!button) {
        logger.warnSingle(`Button not found: ${buttonId}`, "Handler");
        return;
    }

    if (!memberId) {
        logger.warnSingle("Member was not found", "Handler");
        return;
    }

    logger.debug("Checking if command is toggable", "Handler", { toggable, memberId, data });
    if (toggable && !data.includes(memberId)) {
        logger.warnSingle("Command is toggable and member was not found in data", "Handler");
        api.interactions.reply(interaction.id, interaction.token, {
            content: "Only the user who toggled this command can use it",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const redisKey = `${buttonId}_${memberId}`;
    const check = await checkRedis(redisKey, button, memberId);
    if (check !== 0) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this command again in <t:${check}:R>`,
            flags: MessageFlags.Ephemeral,
        });
    }

    try {
        logger.infoSingle(`Executing button: ${buttonId}`, "Handler");
        button.execute(new ButtonInteraction(interaction, api, client), button.parse?.(data));
    } catch (error: any) {
        logger.error("Button execution error:", "Handler", error);
    }
};
