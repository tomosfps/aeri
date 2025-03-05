import { MessageFlags } from "@discordjs/core";
import { Logger } from "logger";
import type { SelectMenuHandler } from "../../classes/SelectMenuInteraction.js";
import { checkCommandCooldown } from "../../utility/redisUtil.js";

const logger = new Logger();

export const handler: SelectMenuHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received select menu interaction: ${interaction.data.custom_id}`, "Handler");

    const [selectId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
    const selectMenu = client.selectMenus.get(selectId);

    if (!selectMenu) {
        logger.warnSingle(`Select menu not found: ${selectId}`, "Handler");
        return;
    }

    const memberId = interaction.user.id;
    if (!memberId) {
        logger.warnSingle("Member was not found", "Handler");
        return;
    }

    const toggleable = selectMenu.toggleable ?? false;

    logger.debug("Checking if command is toggleable", "Handler", { toggleable, memberId, data });
    if (toggleable && !data.includes(memberId)) {
        await api.interactions.reply(interaction.id, interaction.token, {
            content: "Only the user who toggled this command can use it",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const redisKey = `select:${selectId}:${interaction.channel.id}:${interaction.message.id}:${memberId}`;
    const timeout = selectMenu.cooldown ?? 3600;
    const check = await checkCommandCooldown(redisKey, memberId, timeout);
    if (!check.canUse) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this command again in <t:${check.expirationTime}:R>`,
            flags: MessageFlags.Ephemeral,
        });
    }

    try {
        logger.infoSingle(`Executing select menu: ${selectId}`, "Handler");
        selectMenu.execute(interaction, selectMenu.parse?.(data));
    } catch (error: any) {
        logger.error("Select menu execution error:", "Handler", error);
    }
};
