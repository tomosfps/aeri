import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types/v10";
import type { MessageContext } from "../../services/commands.js";

export const interaction: MessageContext = {
    data: new ContextMenuCommandBuilder().setName("manga").setType(ApplicationCommandType.Message),
    async execute(interaction) {
        await interaction.reply({ content: "Manga!" });
    },
};
