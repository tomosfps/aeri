import { Logger } from "logger";
import type { Button } from "../../services/commands.js";
import { handlePagination } from "../../utility/paginationUtilts.js";

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
        const commandData = interaction.client.commands.get(data.commandID);
        const selectMenuData = interaction.client.selectMenus.get(data.commandID);
        const buttonData = interaction.client.buttons.get(data.commandID);
        const commandType = commandData || selectMenuData || buttonData;

        logger.debug("Pagination data", "execute", { data, commandType });

        if (!commandType || !commandType.page) {
            return interaction.reply({
                content: "This command does not support pagination",
                ephemeral: true,
            });
        }

        const getPageContent = async (page: number) => {
            const pages = await commandType.page?.(page, interaction as any);

            if (!pages) {
                throw new Error("Failed to get page content");
            }

            return pages;
        };

        await handlePagination(interaction, data.action, data.commandID, interaction.user.id, getPageContent);
    },
};
