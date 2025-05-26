import { EmbedBuilder } from "@discordjs/builders";
import { MessageFlags } from "@discordjs/core";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import type { SelectMenu } from "../../services/commands.js";

const logger = new Logger();
type SelectMenuData = {
    type: string;
    userID: string;
};

export const interaction: SelectMenu<SelectMenuData> = {
    data: { custom_id: "genre" },
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { type: data[0], userID: data[1] };
    },
    async execute(interaction, data): Promise<void> {
        const mediaType = data.type === "ANIME" ? MediaType.Anime : MediaType.Manga;
        const genres = interaction.menuValues;

        await interaction.deferUpdate();

        const { result: recommendation, error: recommendationsError } = await api.fetch(Routes.Recommend, {
            media: mediaType,
            genres: genres,
        });

        if (recommendationsError) {
            logger.error("Error while fetching recommendations from the API.", "Anilist", recommendationsError);

            return interaction.editReply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                flags: MessageFlags.Ephemeral,
            });
        }

        if (!recommendation) {
            return interaction.editReply({ content: "User not found" });
        }

        const mediaID = Number(recommendation.id);
        const { result: media, error: mediaError } = await api.fetch(
            Routes.Media,
            { media_type: mediaType, media_id: mediaID },
            { user_id: interaction.userID, guild_id: interaction.guildID },
        );

        if (mediaError || !media) {
            logger.error("Error while fetching data from the API.", "Anilist", { mediaError });

            return interaction.editReply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                flags: MessageFlags.Ephemeral,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(media.title.romaji)
            .setURL(media.siteUrl)
            .setImage(media.banner)
            .setThumbnail(media.cover)
            .setDescription(media.description)
            .setColor(interaction.baseColour)
            .setFooter({
                text: media.footer,
            });

        await interaction.editReply({ embeds: [embed] });
    },
};
