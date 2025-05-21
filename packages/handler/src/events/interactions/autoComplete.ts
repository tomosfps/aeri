import { Logger } from "logger";
import type { AutoCompleteHandler } from "../../classes/AutoCompleteInteraction.js";

const logger = new Logger();

export const handler: AutoCompleteHandler = async (interaction, _api, client) => {
    const focusedOption = interaction.options?.find((option) => option.focused);
    if (!focusedOption) {
        await interaction.respond([]);
        return;
    }

    if (focusedOption.value?.toString().length <= 3) {
        await interaction.respond([]);
        return;
    }

    let commandPath = interaction.subcommand || "";
    if (interaction.subcommandGroup) {
        commandPath = `${interaction.subcommandGroup} ${commandPath}`;
    }

    const autoComplete =
        client.autoCompleteCommands.get(`${commandPath}:${focusedOption.name}`) ||
        client.autoCompleteCommands.get(`${interaction.subcommandGroup}:${focusedOption.name}`) ||
        client.autoCompleteCommands.get(`${interaction.subcommand}:${focusedOption.name}`) ||
        client.autoCompleteCommands.get(commandPath) ||
        (interaction.subcommand ? client.autoCompleteCommands.get(interaction.subcommand) : undefined);

    if (!autoComplete) {
        logger.warnSingle(`Autocomplete not found: ${commandPath}`, "Handler");
        return;
    }

    try {
        logger.debugSingle(`Executing autocomplete: ${commandPath}`, "Handler");
        const choices = await autoComplete.execute(interaction, focusedOption);
        await interaction.respond(choices);
    } catch (error: any) {
        logger.error("AutoComplete execution error:", "Handler", error);
    }
};
