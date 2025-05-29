import { ButtonBuilder, MediaGalleryItemBuilder, SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    ButtonStyle,
    InteractionContextType,
    MessageFlags,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { fetchAnilistUser } from "database";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("View a user's anilist account")
        .addExample("/user")
        .addExample("/user username:anilist_username")
        .setCategory("Anime/Manga")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option.setName("username").setDescription("The targets anilist username").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        let username = getCommandOption("username", ApplicationCommandOptionType.String, interaction.options);

        if (username === null) {
            logger.debug("Attempting fetching user from database", "User");

            const dbUser = await fetchAnilistUser(interaction.userID);

            if (!dbUser) {
                return interaction.reply({
                    content: `Please setup your account with ${await getCommandAsMention("link")}`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            username = dbUser.username;
        }

        if (!username) {
            return interaction.reply({
                content: `Please provide a username, or setup your account with ${await getCommandAsMention("link")}`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const { result: user, error } = await api.fetch(Routes.User, { username });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                flags: MessageFlags.Ephemeral,
            });
        }

        if (user === null) {
            return interaction.reply({
                content: "User could not be found. Are you sure you have the correct username?",
                flags: MessageFlags.Ephemeral,
            });
        }

        const informationButton = new ButtonBuilder()
            .setCustomId(`user:${user.name}:INFORMATION:${interaction.user.id}`)
            .setLabel("Main Information")
            .setStyle(ButtonStyle.Primary);

        const animeButton = new ButtonBuilder()
            .setCustomId(`user:${user.name}:ANIME:${interaction.user.id}`)
            .setLabel("Favourite Anime")
            .setStyle(ButtonStyle.Secondary);

        const mangaButton = new ButtonBuilder()
            .setCustomId(`user:${user.name}:MANGA:${interaction.user.id}`)
            .setLabel("Favourite Manga")
            .setStyle(ButtonStyle.Secondary);

        const container = interaction.getContainer();

        if (user.banner) {
            container.updateComponent("media", [new MediaGalleryItemBuilder().setURL(user.banner)]);
            container.updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        }

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(`# [${user.name}](${user.siteUrl})\n${user.description}`),
        );

        if (user.avatar) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(user.avatar));
        }

        container
            .updateComponent("section", [section])
            .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .setActionRow([[informationButton, animeButton, mangaButton]])
            .updateComponent("footer", user.footer);

        return interaction.replyContainer();
    },
};
