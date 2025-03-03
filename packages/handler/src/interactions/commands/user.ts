import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { dbFetchAnilistUser } from "database";
import { ApplicationCommandOptionType, ApplicationIntegrationType, ButtonStyle } from "discord-api-types/v10";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
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
        .addStringOption((option) =>
            option.setName("username").setDescription("The targets anilist username").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        let username = getCommandOption("username", ApplicationCommandOptionType.String, interaction.options);

        if (username === null) {
            logger.debug("Attempting fetching user from database", "User");

            const dbUser = await dbFetchAnilistUser(interaction.user_id);

            if (!dbUser) {
                return interaction.reply({ content: "Please setup your account with `/link`!", ephemeral: true });
            }

            username = dbUser.username;
        }

        if (!username) {
            return interaction.reply({
                content: "Please provide a username, or setup your account with /link",
                ephemeral: true,
            });
        }

        const { result: user, error } = await api.fetch(Routes.User, { username });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                ephemeral: true,
            });
        }

        if (user === null) {
            return interaction.reply({
                content: "User could not be found. Are you sure you have the correct username?",
                ephemeral: true,
            });
        }

        const informationButton = new ButtonBuilder()
            .setCustomId(`userShow:${user.name}:INFORMATION:${interaction.user.id}`)
            .setLabel("Main Information")
            .setStyle(ButtonStyle.Primary);

        const animeButton = new ButtonBuilder()
            .setCustomId(`userShow:${user.name}:ANIME:${interaction.user.id}`)
            .setLabel("Favourite Anime")
            .setStyle(ButtonStyle.Secondary);

        const mangaButton = new ButtonBuilder()
            .setCustomId(`userShow:${user.name}:MANGA:${interaction.user.id}`)
            .setLabel("Favourite Manga")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(informationButton, animeButton, mangaButton);
        const embed = new EmbedBuilder()
            .setTitle(user.name)
            .setURL(user.siteUrl)
            .setDescription(user.description)
            .setThumbnail(user.avatar)
            .setImage(user.banner)
            .setColor(interaction.base_colour)
            .setFooter({ text: user.footer });

        return interaction.reply({
            embeds: [embed],
            components: [row],
        });
    },
};
