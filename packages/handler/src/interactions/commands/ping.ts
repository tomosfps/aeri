import { SlashCommandBuilder } from "@discordjs/builders";
import type { Command } from "../../services/commands.js";

export const interaction: Command = {
    data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong! (Used for testing)"),
    async execute(interaction): Promise<void> {
        await interaction.reply({ content: "Pong!" });
    },
};
