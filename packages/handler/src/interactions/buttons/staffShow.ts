import { EmbedBuilder } from "@discordjs/builders";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
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

        const { result, error } = await api.fetch(Routes.Staff, {
            staff_name: staffName,
        });

        if (error || !result) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content: "An error occurred while fetching data from the API.",
                ephemeral: true,
            });
        }

        let description = "";
        switch (data.type) {
            case "ANIME":
                description = result.description + result.animeDescription;
                break;
            case "MANGA":
                description = result.description + result.mangaDescription;
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle(result.fullName)
            .setURL(result.siteUrl)
            .setDescription(description)
            .setThumbnail(result.image)
            .setFooter({ text: result.footer });
        interaction.base_colour;

        await interaction.edit({
            embeds: [embed],
        });
    },
};
