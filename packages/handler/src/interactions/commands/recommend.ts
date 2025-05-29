import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionType, ApplicationIntegrationType, InteractionContextType } from "@discordjs/core";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";
const genreList = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Psychological",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Thriller",
    "Supernatural",
    "Sports",
    "Historical",
    "Mecha",
    "Music",
    "Ecchi",
    "Shoujo",
    "Shounen",
    "Josei",
    "Seinen",
    "Isekai",
    "Martial Arts",
];

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("recommend")
        .setDescription("Recommend an anime or manga based on genre(s)")
        .setCooldown(5)
        .addExample("/recommend")
        .addExample("/recommend hidden:true")
        .setCategory("Anime/Manga")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option
                .setName("media")
                .setDescription("Choose a media type")
                .setRequired(true)
                .addChoices({ name: "Anime", value: "ANIME" }, { name: "Manga", value: "MANGA" }),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const media = getCommandOption("media", ApplicationCommandOptionType.String, interaction.options) || "";
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;

        const select = new StringSelectMenuBuilder()
            .setCustomId(`genre:${media}:${media}:${interaction.userID}`)
            .setPlaceholder("Choose Some Genres...")
            .setMinValues(1)
            .setMaxValues(24)
            .addOptions(
                genreList.map((genre) => {
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(genre)
                        .setValue(genre)
                        .setDescription(`Get recommendations for ${genre} genre`);
                }),
            );

        const container = interaction.getContainer().setComponentOrder(["media", "section", "actionRow"]);
        container.setComponent("actionRow", [[select]]);

        return await interaction.replyContainer(hidden);
    },
};
