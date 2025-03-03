import { EmbedBuilder } from "@discordjs/builders";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Get support through the support server.")
        .addExample("/support")
        .setCategory("Utility"),
    async execute(interaction): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle("Support Server")
            .setDescription(
                "Join the support server for help with the bot.\n[Click here to join](https://discord.gg/MwGjd9nHsh)",
            )
            .setColor(interaction.base_colour)
            .setThumbnail(interaction.avatar_url)
            .setURL("https://discord.gg/MwGjd9nHsh");

        await interaction.reply({ embeds: [embed] });
    },
};
