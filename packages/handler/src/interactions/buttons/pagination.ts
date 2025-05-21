import { MessageFlags } from "@discordjs/core";
import type { Button } from "../../services/commands.js";
import { getPaginatedCommandById, handlePagination, isPaginatedCommand } from "../../utility/paginationUtils.js";

interface PaginationData {
    action: string;
    commandID: string;
}

export const interaction: Button<PaginationData> = {
    custom_id: "pagination",
    toggleable: true,
    timeout: 900,
    parse(data: string[]): PaginationData {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid pagination data");
        }
        const [action, commandID] = data;
        return { action, commandID };
    },
    async execute(interaction, data: PaginationData): Promise<void> {
        const command = getPaginatedCommandById(interaction.client, data.commandID);

        if (!command || !isPaginatedCommand(command)) {
            return interaction.reply({
                content: "This command does not support pagination",
                flags: MessageFlags.Ephemeral,
            });
        }

        await handlePagination(interaction, command, data.action, data.commandID);
    },
};
