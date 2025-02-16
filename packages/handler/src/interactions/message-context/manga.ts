import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types/v10";
import type { MessageContextCommand } from "../../services/commands.js";

export const interaction: MessageContextCommand = {
    data: new ContextMenuCommandBuilder().setName("manga").setType(ApplicationCommandType.Message),
    async execute(interaction) {
        await interaction.reply({ content: "Manga!" });
    },
};
