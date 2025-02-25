import { EmbedBuilder, bold, inlineCode } from "@discordjs/builders";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder().setName("about").setDescription("Information About Aeri").addExample("/about"),
    async execute(interaction): Promise<void> {
        const descriptionBuilder = [
            `${bold("Who is Aeri?")}`,
            "Created by [tomosfps](https://github.com/ehiraa/) and [Sammy](https://github.com/SammyWhamy), Aeri is a versatile bot with a focus on anime, manga, and related content.\n",

            `${bold("Why the name Aeri?")}`,
            "The name is inspired by Giselle (Aespa), whose real name is Aeri Uchinaga.\n",

            `${bold("GitHub Repository")}`,
            "Aeri is open source, allowing you to host your own instance or contribute to the project.\n",

            `${bold("Other Information")}`,
            `${inlineCode("Version      :")} v1.0.0`,
            `${inlineCode("Library      :")} [discord.js](https://discord.js.org/)`,
            `${inlineCode("Language     :")} [TypeScript](https://www.typescriptlang.org), [Rust](https://www.rust-lang.org), [Dockerfile](https://www.docker.com/)`,
            `${inlineCode("Created      :")} 19/10/2024`,
            `${inlineCode("Last Updated :")} 24/02/2025`,
            `${inlineCode("Github       :")} [Github Link](https://github.com/ehiraa/aeri)`,
        ];

        const embed = new EmbedBuilder()
            .setTitle("About Aeri")
            .setURL("https://github.com/ehiraa/aeri")
            .setDescription(descriptionBuilder.join("\n"))
            .setThumbnail(interaction.avatar_url)
            .setColor(interaction.base_colour);

        await interaction.reply({ embeds: [embed] });
    },
};
