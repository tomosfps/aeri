import { MessageFlags } from "@discordjs/core";
import type { Button } from "../../services/commands.js";
import { Pagination } from "../../utility/paginationUtils.js";
interface PaginationData {
    action: string;
    commandID: string;
    userID: string;
}

export const interaction: Button<PaginationData> = {
    data: { custom_id: "pagination" },
    parse(data: string[]): PaginationData {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid auto pagination data");
        }
        const [action, commandID, userID] = data;
        return { action, commandID, userID };
    },
    async execute(interaction, data: PaginationData): Promise<void> {
        if (data.userID !== interaction.userID) {
            return interaction.reply({
                content: "You can only interact with your own pagination controls.",
                flags: MessageFlags.Ephemeral,
            });
        }

        await Pagination.handlePaginationAction(interaction, data.action, data.commandID, data.userID);
    },
};
