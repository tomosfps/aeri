import type { APIApplicationCommandAutocompleteInteraction } from "discord-api-types/v10";
import { Logger } from "log";

const logger = new Logger();

export const handler = (interaction: APIApplicationCommandAutocompleteInteraction) => {
    logger.debugSingle(`Received autocomplete interaction: ${interaction.data.name}`, "Handler");
};
