import { MessageFlags } from "@discordjs/core";
import { TimestampStyles, time } from "@discordjs/formatters";
import { Logger } from "logger";
import type { SelectMenuHandler } from "../../classes/SelectMenuInteraction.js";
import { checkCommandCooldown, setComponentExpiry } from "../../utility/redisUtil.js";

const logger = new Logger();

export const handler: SelectMenuHandler = async (interaction, api, client) => {
    const [selectId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
    const selectMenu = client.selectMenus.get(selectId);

    if (!selectMenu) {
        logger.warnSingle(`Select menu not found: ${selectId}`, "Handler");
        return;
    }

    if (!interaction.user.id) {
        return;
    }

    if (!selectMenu.toggleable && !data.includes(interaction.user.id)) {
        await api.interactions.reply(interaction.id, interaction.token, {
            content: "Only the user who toggled this command can use it",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const redisKey = `${selectId}:${interaction.token}:${interaction.user.id}`;
    const timeout = selectMenu.cooldown ?? 900;
    const check = await checkCommandCooldown(redisKey, interaction.user.id, timeout);

    if (!check.canUse) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this command again in ${time(check.expirationTime, TimestampStyles.RelativeTime)}`,
            flags: MessageFlags.Ephemeral,
        });
    }

    await setComponentExpiry(selectId, interaction.token, interaction.user.id);

    try {
        logger.debugSingle(`Executing select menu: ${selectId}`, "Handler");
        selectMenu.execute(interaction, selectMenu.parse?.(data));
    } catch (error: any) {
        logger.error("Select menu execution error:", "Handler", error);
    }
};
