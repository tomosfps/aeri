import { Logger } from "logger";
import type { AutoCompleteHandler } from "../../classes/autoCompleteInteraction.js";

const logger = new Logger();

export const handler: AutoCompleteHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received autocomplete interaction: ${interaction.data.name}`, "Handler");

    if (
        interaction.data.options[0] &&
        "value" in interaction.data.options[0] &&
        interaction.data.options[0].value.toString().length <= 3
    ) {
        logger.warnSingle(`Option value is too short: ${interaction.data.options[0].value}`, "Handler");
        return;
    }

    const autoComplete = client.autoCompleteCommands.get(interaction.data.name);

    if (!autoComplete) {
        logger.warnSingle(`AutoComplete not found: ${interaction.data.name}`, "Handler");
        return;
    }

    try {
        logger.infoSingle(`Executing autocomplete: ${interaction.data.name}`, "Handler");
        const choices = await autoComplete.execute(interaction);
        await interaction.respond(choices);
    } catch (error: any) {
        logger.error("AutoComplete execution error:", "Handler", error);
    }
};
