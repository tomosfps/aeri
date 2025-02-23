import { Logger } from "logger";
import type { AutoCompleteHandler } from "../../classes/autoCompleteInteraction.js";

const logger = new Logger();

export const handler: AutoCompleteHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received autocomplete interaction: ${interaction.data.name}`, "Handler");
    const autoComplete = client.autoCompleteCommands.get(interaction.data.name);

    if (!autoComplete) {
        logger.warnSingle(`AutoComplete not found: ${interaction.data.name}`, "Handler");
        return;
    }

    if (interaction.interaction.channel?.id) {
        api.channels.showTyping(interaction.interaction.channel?.id);
    }

    try {
        logger.infoSingle(`Executing autocomplete: ${interaction.data.name}`, "Handler");
        const choices = await autoComplete.execute(interaction);
        await api.interactions.createAutocompleteResponse(interaction.id, interaction.token, { choices });
    } catch (error: any) {
        logger.error("AutoComplete execution error:", "Handler", error);
    }
};
