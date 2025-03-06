import { MessageFlags } from "@discordjs/core";
import { Logger } from "logger";
import type { ButtonHandler } from "../../classes/ButtonInteraction.js";
import { checkCommandCooldown, setComponentExpiry } from "../../utility/redisUtil.js";

const logger = new Logger();

export const handler: ButtonHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received button interaction: ${interaction.data.custom_id}`, "Handler");

    const [buttonId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
    const button = client.buttons.get(buttonId);

    if (!button) {
        logger.warnSingle(`Button not found: ${buttonId}`, "Handler");
        return;
    }

    const userId = interaction.user.id;

    const toggleable = button.toggleable ?? false;
    if (toggleable && !data.includes(userId)) {
        await api.interactions.reply(interaction.id, interaction.token, {
            content: "Only the user who toggled this command can use it",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const redisKey = `${buttonId}:${interaction.token}:${userId}`;
    const timeout = button.cooldown ?? 3600;
    const check = await checkCommandCooldown(redisKey, userId, timeout);

    if (!check.canUse) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this command again in <t:${check.expirationTime}:R>`,
            flags: MessageFlags.Ephemeral,
        });
    }

    await setComponentExpiry(buttonId, interaction.token, userId);

    try {
        logger.infoSingle(`Executing button: ${buttonId}`, "Handler");
        button.execute(interaction, button.parse?.(data));
    } catch (error: any) {
        logger.error("Button execution error:", "Handler", error);
    }
};
