import { EmbedBuilder } from "@discordjs/builders";
import { formatSeconds } from "core";
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
        const guild_id = BigInt(interaction.guild_id || 0);

        const { result: recommendation, error: recommendationsError } = await api.fetch(Routes.Recommend, {
            media: media_type,
            genres: genres,
        });

        if (recommendationsError) {
            logger.error("Error while fetching recommendations from the API.", "Anilist", recommendationsError);

            return interaction.followUp({
                content: "An error occurred while fetching data from the API.",
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
            { guild_id },
        );

        if (mediaError) {
            logger.error("Error while fetching data from the API.", "Anilist", mediaError);

            return interaction.reply({
                content: "An error occurred while fetching data from the API.",
                ephemeral: true,
            });
        }

        if (!media) {
            return interaction.followUp({ content: "Media not found" });
        }

        const embed = new EmbedBuilder()
            .setTitle(media.title.romaji)
            .setURL(media.siteUrl)
            .setImage(media.banner)
            .setThumbnail(media.cover)
            .setDescription(media.description)
            .setFooter({
                text: `${media.dataFrom === "API" ? "Displaying API data" : `Displaying cache data : expires in ${formatSeconds(media.leftUntilExpire)}`}`,
            })
            .setColor(0x2f3136);
        await interaction.edit({ embeds: [embed] });
    },
};
