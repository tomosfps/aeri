import type { APIUserApplicationCommandInteraction } from "discord-api-types/v10";
import { Logger } from "logger";

const logger = new Logger();

export const handler = (interaction: APIUserApplicationCommandInteraction) => {
    logger.debugSingle(`Received user context interaction: ${interaction.data.name}`, "Handler");
};
