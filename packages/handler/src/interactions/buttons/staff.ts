import { SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import { MessageFlags } from "@discordjs/core";
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
    data: { custom_id: "staff" },
    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid button data");
        }
        return { staffName: data[0], type: data[1] as DescriptionType, userId: data[2] };
    },
    async execute(interaction, data): Promise<void> {
        const { result: animeResult, error: animeError } = await api.fetch(Routes.Staff, {
            staff_name: data.staffName,
            media_type: MediaType.Anime,
        });

        const { result: mangaResult, error: mangaError } = await api.fetch(Routes.Staff, {
            staff_name: data.staffName,
            media_type: MediaType.Manga,
        });

        if (animeError || !animeResult) {
            logger.error("Error while fetching data from the API.", "Anilist", { animeError });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                flags: MessageFlags.Ephemeral,
            });
        }

        if (mangaError || !mangaResult) {
            logger.error("Error while fetching data from the API.", "Anilist", { mangaError });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                flags: MessageFlags.Ephemeral,
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

        const container = interaction.getContainer();

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(`# [${animeResult.fullName}](${animeResult.siteUrl})\n${description}`),
        );

        if (animeResult.image) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(animeResult.image));
        }

        container.updateComponent("section", [section]).updateComponent("footer", animeResult.footer);

        await interaction.updateContainer();
    },
};
