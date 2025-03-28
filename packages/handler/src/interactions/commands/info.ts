import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, bold, inlineCode } from "@discordjs/builders";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationIntegrationType, ButtonStyle } from "discord-api-types/v10";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Information About Aeri")
        .addExample("/info")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM),
    async execute(interaction): Promise<void> {
        const descriptionBuilder = [
            `${bold("Who is Aeri?")}`,
            "Created by [tomosfps](https://github.com/tomosfps/) and [Sammy](https://github.com/SammyWhamy), Aeri is a versatile bot with a focus on anime, manga, and related content.\n",

            `${bold("GitHub Repository")}`,
            "Aeri is open source, allowing you to host your own instance or contribute to the project.\n",

            `${bold("Other Information")}`,
            `${inlineCode("Version      :")} v1.0.2`,
            `${inlineCode("Library      :")} [discord.js](https://discord.js.org/)`,
            `${inlineCode("Languages    :")} [TypeScript](https://www.typescriptlang.org), [Rust](https://www.rust-lang.org), [Dockerfile](https://www.docker.com/)`,
            `${inlineCode("Created      :")} 19/10/2024`,
            `${inlineCode("Github       :")} [Github Link](https://github.com/tomosfps/aeri)\n`,

            `${bold("Third Party Libraries")}`,
            `${inlineCode("AniList API   :")} [GraphQL API](https://docs.anilist.co/) for anime/manga data`,
            `${inlineCode("Prometheus    :")} [Prometheus](https://prometheus.io/) for metrics/monitoring`,
            `${inlineCode("Actix Web     :")} [Rust web server framework](https://actix.rs/) for the backend`,
            `${inlineCode("Postgres      :")} [PostgreSQL](https://www.postgresql.org/) for database storage`,
            `${inlineCode("Redis         :")} [Redis](https://redis.io/) for caching`,
            `${inlineCode("trace.moe     :")} [Anime scene search API](https://soruly.github.io/trace.moe-api/) for image recognition`,
        ];

        const inviteButton = new ButtonBuilder()
            .setCustomId("infoAdd:INVITE:${interaction.user.id}")
            .setLabel("Invite Bot")
            .setStyle(ButtonStyle.Primary);

        const supportButton = new ButtonBuilder()
            .setCustomId("infoAdd:SUPPORT")
            .setLabel("Support Server")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(inviteButton, supportButton);

        const embed = new EmbedBuilder()
            .setTitle("About Aeri")
            .setURL("https://github.com/tomosfps/aeri")
            .setDescription(descriptionBuilder.join("\n"))
            .setThumbnail("https://cdn.aeri.live/bot_pfp.png")
            .setColor(interaction.base_colour);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
