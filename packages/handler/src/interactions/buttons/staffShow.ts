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
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid button data");
        }
        return { staffName: data[0], type: data[1] as DescriptionType, userId: data[2] };
    },
    async execute(interaction, data): Promise<void> {
        const staffName = data.staffName;

        const { result: animeStaff, error: animeError } = await api.fetch(Routes.Staff, {
            staff_name: staffName,
            media_type: MediaType.Anime,
        });

        const { result: mangaStaff, error: mangaError } = await api.fetch(Routes.Staff, {
            staff_name: staffName,
            media_type: MediaType.Manga,
        });

        if (animeError || mangaError) {
            logger.error("Error while fetching data from the API.", "Anilist", { animeError, mangaError });

            return interaction.reply({
                content: "An error occurred while fetching data from the API.",
                ephemeral: true,
            });
        }

        if (animeStaff === null || mangaStaff === null) {
            return interaction.reply({
                content: `Could not find ${staffName} within the Anilist API`,
                ephemeral: true,
            });
        }

        let description = "";
        switch (data.type) {
            case "ANIME":
                description = animeStaff.description + animeStaff.animeDescription;
                break;
            case "MANGA":
                description = mangaStaff.description + mangaStaff.mangaDescription;
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle(animeStaff.fullName)
            .setURL(animeStaff.siteUrl)
            .setDescription(description)
            .setThumbnail(animeStaff.image)
            .setFooter({ text: animeStaff.footer })
            .setColor(0x2f3136);

        await interaction.edit({
            embeds: [embed],
        });
    },
};
