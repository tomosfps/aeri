import { Logger } from "logger";
import type { Button } from "../../services/commands.js";
import { getPaginatedCommandById, handlePagination, isPaginatedCommand } from "../../utility/paginationUtils.js";

const logger = new Logger();

interface PaginationData {
    action: string;
    commandID: string;
}

export const interaction: Button<PaginationData> = {
    custom_id: "pagination",
    toggleable: true,
    timeout: 3600,
    parse(data: string[]): PaginationData {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid pagination data");
        }
        const [action, commandID] = data;
        return { action, commandID };
    },
    async execute(interaction, data: PaginationData): Promise<void> {
        const command = getPaginatedCommandById(interaction.client, data.commandID);
        logger.debug("Pagination data", "execute", { data, command });

        if (!command || !isPaginatedCommand(command)) {
            logger.warn("Pagination button executed on command that does not support it", "execute", { command });

            return interaction.reply({
                content: "This command does not support pagination",
                ephemeral: true,
            });
        }

        await handlePagination(interaction, data.action, data.commandID, command.page);
    },
};
