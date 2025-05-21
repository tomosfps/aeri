import { MessageFlags } from "@discordjs/core";
import { TimestampStyles, time } from "@discordjs/formatters";
import { Logger } from "logger";
import type { ButtonHandler } from "../../classes/ButtonInteraction.js";
import { checkCommandCooldown, setComponentExpiry } from "../../utility/redisUtil.js";

const logger = new Logger();

export const handler: ButtonHandler = async (interaction, api, client) => {
    const [buttonId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
    const button = client.buttons.get(buttonId);

    if (!button) {
        logger.warnSingle(`Button not found: ${buttonId}`, "Handler");
        return;
    }

    if (!button.toggleable && !data.includes(interaction.user.id)) {
        await api.interactions.reply(interaction.id, interaction.token, {
            content: "You cannot use this button. The toggleable button was set to false.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const redisKey = `${buttonId}:${interaction.token}:${interaction.user.id}`;
    const timeout = button.cooldown ?? 900;
    const check = await checkCommandCooldown(redisKey, interaction.user.id, timeout);

    if (!check.canUse) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this command again in ${time(check.expirationTime, TimestampStyles.RelativeTime)}`,
            flags: MessageFlags.Ephemeral,
        });
    }
    await setComponentExpiry(buttonId, interaction.token, interaction.user.id);

    try {
        logger.debugSingle(`Executing button: ${buttonId}`, "Handler");
        button.execute(interaction, button.parse?.(data));
    } catch (error: any) {
        logger.error("Button execution error:", "Handler", error);
    }
};
