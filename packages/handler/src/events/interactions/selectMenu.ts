import { MessageFlags } from "@discordjs/core";
import { TimestampStyles, time } from "@discordjs/formatters";
import { Logger } from "logger";
import type { SelectMenuHandler } from "../../classes/SelectMenuInteraction.js";
import { checkCommandCooldown } from "../../utility/redisUtil.js";

const logger = new Logger();

export const handler: SelectMenuHandler = async (interaction, api, client) => {
    const [selectId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
    const selectMenu = client.selectMenus.get(selectId);
    const container = interaction.getContainer();

    if (!selectMenu) {
        logger.warnSingle(`Select menu not found: ${selectId}`, "Handler");
        return;
    }

    if (!interaction.user.id) {
        return;
    }

    if (selectMenu.data.toggleable && !data.includes(interaction.user.id)) {
        await api.interactions.reply(interaction.id, interaction.token, {
            content: "This select menu is not toggleable and cannot be used by you.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const redisKey = `${selectId}:${interaction.token}:${interaction.user.id}`;
    const check = await checkCommandCooldown(redisKey, interaction.user.id, selectMenu.data.cooldown);

    if (!check.canUse) {
        container.setComponent(
            "warning",
            `You may use this select menu again in ${time(check.expirationTime, TimestampStyles.RelativeTime)}`,
        );
        return interaction.replyContainer(true);
    }

    try {
        logger.debugSingle(`Executing select menu: ${selectId}`, "Handler");
        selectMenu.execute(interaction, selectMenu.parse?.(data));
    } catch (error: any) {
        logger.error("Select menu execution error:", "Handler", error);
    }
};
