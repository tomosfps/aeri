import { MessageFlags } from "@discordjs/core";
import { TimestampStyles, time } from "@discordjs/formatters";
import { Logger } from "logger";
import type { ButtonHandler } from "../../classes/ButtonInteraction.js";
import { checkCommandCooldown } from "../../utility/redisUtil.js";

const logger = new Logger();

export const handler: ButtonHandler = async (interaction, api, client) => {
    const [buttonId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
    const button = client.buttons.get(buttonId);
    const container = interaction.getContainer();

    if (!button) {
        logger.warnSingle(`Button not found: ${buttonId}`, "Handler");
        return;
    }

    if (button.data.toggleable && !data.includes(interaction.user.id)) {
        await api.interactions.reply(interaction.id, interaction.token, {
            content: "This button is not toggleable and cannot be used by you.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const redisKey = `${buttonId}:${interaction.token}:${interaction.user.id}`;
    const check = await checkCommandCooldown(redisKey, interaction.user.id, button.data.cooldown);

    if (!check.canUse) {
        container.setComponent(
            "warning",
            `You may use this button again in ${time(check.expirationTime, TimestampStyles.RelativeTime)}`,
        );
        return interaction.replyContainer(true);
    }

    try {
        logger.debugSingle(`Executing button: ${buttonId}`, "Handler");
        button.execute(interaction, button.parse?.(data));
    } catch (error: any) {
        logger.error("Button execution error:", "Handler", error);
    }
};
