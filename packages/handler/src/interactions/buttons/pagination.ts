import type { Button } from "../../services/commands.js";
import { handlePaginationButton } from "../../utility/paginationUtilts.js";

interface PaginationData {
    action: string;
    commandID: string;
}

export const interaction: Button<PaginationData> = {
    custom_id: "pagination",
    timeout: 300,
    parse(data: string[]): PaginationData {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid pagination data");
        }
        const [action, commandID] = data;
        return { action, commandID };
    },
    async execute(interaction, data: PaginationData): Promise<void> {
        const command = interaction.client.commands.get(data.commandID);

        if (!command || !command.page) {
            return interaction.reply({
                content: "This command does not support pagination",
                ephemeral: true,
            });
        }

        const getPageContent = async (page: number) => {
            const pages = await command.page?.(page, interaction);
            return pages;
        };

        await handlePaginationButton(interaction, data.action, data.commandID, getPageContent);
    },
};
