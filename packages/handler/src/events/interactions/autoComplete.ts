import { Logger } from "logger";
import type { AutoCompleteHandler } from "../../classes/AutoCompleteInteraction.js";

const logger = new Logger();

export const handler: AutoCompleteHandler = async (interaction, _api, client) => {
    logger.debugSingle(`Received autocomplete interaction: ${interaction.data.name}`, "Handler");

    if (interaction.options[0] && interaction.options[0].value.toString().length <= 3) {
        logger.warnSingle(`Option value is too short: ${interaction.options[0].value}`, "Handler");
        await interaction.respond([]);
        return;
    }

    const focusedOption = interaction.options.find((option) => option.focused);

    if (!focusedOption) {
        logger.warnSingle("No focused option found", "Handler");
        await interaction.respond([]);
        return;
    }

    const autoComplete =
        client.autoCompleteCommands.get(`${interaction.data.name}:${focusedOption.name}`) ||
        client.autoCompleteCommands.get(interaction.data.name);

    if (!autoComplete) {
        logger.warnSingle(`AutoComplete not found: ${interaction.data.name}`, "Handler");
        return;
    }

    try {
        logger.infoSingle(`Executing autocomplete: ${interaction.data.name}`, "Handler");

        const choices = await autoComplete.execute(interaction, focusedOption);
        await interaction.respond(choices);
    } catch (error: any) {
        logger.error("AutoComplete execution error:", "Handler", error);
    }
};
