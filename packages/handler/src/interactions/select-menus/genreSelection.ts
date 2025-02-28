import { EmbedBuilder } from "@discordjs/builders";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import type { SelectMenu } from "../../services/commands.js";

const logger = new Logger();
type SelectMenuData = {
    custom_id: string;
    userId: string;
};

export const interaction: SelectMenu<SelectMenuData> = {
    custom_id: "genre_selection",
    cooldown: 1,
    toggleable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { custom_id: data[0], userId: data[1] };
    },
    async execute(interaction, data): Promise<void> {
        const media_type = data.custom_id === "ANIME" ? MediaType.Anime : MediaType.Manga;
        const genres = interaction.menuValues;

        if (!interaction.guild_id) {
            return interaction.followUp({ content: "This command can only be used in a server." });
        }

        await interaction.deferUpdate();

        const { result: recommendation, error: recommendationsError } = await api.fetch(Routes.Recommend, {
            media: media_type,
            genres: genres,
        });

        if (recommendationsError) {
            logger.error("Error while fetching recommendations from the API.", "Anilist", recommendationsError);

            return interaction.followUp({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                ephemeral: true,
            });
        }

        if (!recommendation) {
            return interaction.followUp({ content: "User not found" });
        }

        const media_id = Number(recommendation.id);
        const { result: media, error: mediaError } = await api.fetch(
            Routes.Media,
            { media_type, media_id },
            { guild_id: interaction.guild_id },
        );

        if (mediaError || !media) {
            logger.error("Error while fetching data from the API.", "Anilist", { mediaError });

            return interaction.editReply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(media.title.romaji)
            .setURL(media.siteUrl)
            .setImage(media.banner)
            .setThumbnail(media.cover)
            .setDescription(media.description)
            .setColor(interaction.base_colour)
            .setFooter({
                text: media.footer,
            });

        await interaction.editReply({ embeds: [embed] });
    },
};
