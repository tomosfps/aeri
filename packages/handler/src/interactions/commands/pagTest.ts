import { EmbedBuilder } from "@discordjs/builders";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { createPage } from "../../utility/paginationUtilts.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("pag-test")
        .setDescription("Pagination test")
        .addExample("/pag-test")
        .setOwnerOnly(true)
        .setCategory("Utility"),
    async execute(interaction) {
        const commands = Array.from(interaction.client.commands.values());
        const commandsPerPage = 5;
        const maxPages = Math.ceil(commands.length / commandsPerPage);

        await createPage(
            interaction,
            {
                userID: interaction.user_id,
                commandID: interaction.data.name,
                totalPages: maxPages,
            },
            async (page: number) => (this.page ? await this.page(page, interaction) : { embeds: [] }),
        );
    },

    async page(pageNumber, interaction) {
        const commands = Array.from(interaction.client.commands.values());
        const commandsPerPage = 5;
        const startingID = (pageNumber - 1) * commandsPerPage;
        const pageCommands = commands.slice(startingID, startingID + commandsPerPage);

        let descriptionText = pageCommands
            .map((cmd) => `**/${cmd.data.name}**: ${cmd.data.description || "No description"}`)
            .join("\n");

        if (!descriptionText || descriptionText.trim() === "") {
            descriptionText = "No commands found on this page.";
        }

        const embed = new EmbedBuilder()
            .setTitle(`Commands - Page ${pageNumber}`)
            .setDescription(descriptionText)
            .setFooter({ text: `Page ${pageNumber} of ${Math.ceil(commands.length / commandsPerPage)}` })
            .setColor(interaction?.base_colour || 0x2f3136);

        return { embeds: [embed] };
    },
};
