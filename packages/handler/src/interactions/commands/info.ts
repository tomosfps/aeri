import { ButtonBuilder, SectionBuilder, ThumbnailBuilder, bold, inlineCode } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    ButtonStyle,
    InteractionContextType,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { env } from "core";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getUserAvatar } from "../../utility/formatUtils.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Information About Aeri")
        .addExample("/info")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const descriptionBuilder = [
            `${bold("Who is Aeri?")}`,
            "Created by [tomosfps](https://github.com/tomosfps/) and [Sammy](https://github.com/SammyWhamy), Aeri is a versatile bot with a focus on anime, manga, and related content.\n",

            `${bold("GitHub Repository")}`,
            "Aeri is open source, allowing you to host your own instance or contribute to the project.\n",

            `${bold("Other Information")}`,
            `${inlineCode("Version      :")} v1.1.0`,
            `${inlineCode("Library      :")} [discord.js](https://discord.js.org/)`,
            `${inlineCode("Languages    :")} [TypeScript](https://www.typescriptlang.org), [Rust](https://www.rust-lang.org), [Dockerfile](https://www.docker.com/)`,
            `${inlineCode("Created      :")} 19/10/2024`,
            `${inlineCode("Github       :")} [Repository](https://github.com/tomosfps/aeri)\n`,

            `${bold("Third Party Libraries")}`,
            `${inlineCode("AniList API   :")} [GraphQL API](https://docs.anilist.co/) for anime/manga data`,
            `${inlineCode("Prometheus    :")} [Prometheus](https://prometheus.io/) for metrics/monitoring`,
            `${inlineCode("Actix Web     :")} [Rust web server framework](https://actix.rs/) for the backend`,
            `${inlineCode("Postgres      :")} [PostgreSQL](https://www.postgresql.org/) for database storage`,
            `${inlineCode("Redis         :")} [Redis](https://redis.io/) for caching`,
            `${inlineCode("trace.moe     :")} [Anime scene search API](https://soruly.github.io/trace.moe-api/) for image recognition`,
        ];

        const container = interaction.getContainer();
        const getBotAvatar = getUserAvatar(interaction.client.bot.id, interaction.client.bot.avatar);

        const section = new SectionBuilder()
            .addTextDisplayComponents((builder) => builder.setContent(descriptionBuilder.join("\n")))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(getBotAvatar));

        container
            .setComponentOrder(["section", "actionRow"])
            .setComponent("section", [section])
            .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .setComponent("actionRow", [
                new ButtonBuilder().setCustomId("info:INVITE").setLabel("Invite Bot").setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("info:SUPPORT")
                    .setLabel("Support Server")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder().setLabel("Website").setStyle(ButtonStyle.Link).setURL(env.WEBSITE_URL),
            ]);

        await interaction.replyContainer(hidden);
    },
};
