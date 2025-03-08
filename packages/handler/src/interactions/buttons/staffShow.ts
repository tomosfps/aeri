import { EmbedBuilder } from "@discordjs/builders";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import type { Button } from "../../services/commands.js";

const logger = new Logger();

type DescriptionType = "ANIME" | "MANGA";

type ButtonData = {
    staffName: string;
    type: DescriptionType;
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "staffShow",
    toggleable: true,
    timeout: 900,
    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid button data");
        }
        return { staffName: data[0], type: data[1] as DescriptionType, userId: data[2] };
    },
    async execute(interaction, data): Promise<void> {
        const staffName = data.staffName;

        const { result: animeResult, error: animeError } = await api.fetch(Routes.Staff, {
            staff_name: staffName,
            media_type: MediaType.Anime,
        });

        const { result: mangaResult, error: mangaError } = await api.fetch(Routes.Staff, {
            staff_name: staffName,
            media_type: MediaType.Manga,
        });

        if (animeError || !animeResult) {
            logger.error("Error while fetching data from the API.", "Anilist", { animeError });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                ephemeral: true,
            });
        }

        if (mangaError || !mangaResult) {
            logger.error("Error while fetching data from the API.", "Anilist", { mangaError });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                ephemeral: true,
            });
        }

        let description = "";
        switch (data.type) {
            case "ANIME":
                description = animeResult.description + animeResult.animeDescription;
                break;
            case "MANGA":
                description = mangaResult.description + mangaResult.mangaDescription;
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle(animeResult.fullName)
            .setURL(animeResult.siteUrl)
            .setDescription(description)
            .setThumbnail(animeResult.image)
            .setFooter({ text: animeResult.footer });

        await interaction.edit({
            embeds: [embed],
        });
    },
};
