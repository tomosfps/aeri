import { MessageFlags } from "@discordjs/core";
import { checkRedis } from "core";
import { Logger } from "log";
import { type SelectMenuHandler, SelectMenuInteraction } from "../../classes/selectMenuInteraction.js";

const logger = new Logger();

export const handler: SelectMenuHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received select menu interaction: ${interaction.data.custom_id}`, "Handler");

    const [selectId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
    const selectMenu = client.selectMenus.get(selectId);
    const memberId = interaction.member?.user.id;
    const toggable = selectMenu?.toggable ?? false;

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

    if (!selectMenu) {
        logger.warnSingle(`Select menu not found: ${selectId}`, "Handler");
        return;
    }

    const redisKey = `${selectId}_${memberId}`;
    const check = await checkRedis(redisKey, selectMenu, memberId);
    if (check !== 0) {
        return api.interactions.reply(interaction.id, interaction.token, {
            content: `You may use this command again in <t:${check}:R>`,
            flags: MessageFlags.Ephemeral,
        });
    }

    try {
        logger.infoSingle(`Executing select menu: ${selectId}`, "Handler");
        selectMenu.execute(new SelectMenuInteraction(interaction, api, client), selectMenu.parse?.(data));
    } catch (error: any) {
        logger.error("Select menu execution error:", "Handler", error);
    }
};
