import { EmbedBuilder } from "@discordjs/builders";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import type { Button } from "../../services/commands.js";

const logger = new Logger();

type DescriptionType = "ANIME" | "MANGA" | "DESCRIPTION";

type ButtonData = {
    characterName: string;
    type: DescriptionType;
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "characterShow",
    toggleable: true,
    timeout: 900,
    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid button data");
        }
        return { characterName: data[0], type: data[1] as DescriptionType, userId: data[2] };
    },
    async execute(interaction, data): Promise<void> {
        const characterName = data.characterName;

        const { result: character, error } = await api.fetch(Routes.Character, { character_name: characterName });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                ephemeral: true,
            });
        }

        if (character === null) {
            return interaction.reply({
                content: `Could not find ${characterName} within the Anilist API`,
                ephemeral: true,
            });
        }

        let description = "";

        switch (data.type) {
            case "ANIME":
                description = character.description + character.animeDescription;
                break;
            case "MANGA":
                description = character.description + character.mangaDescription;
                break;
            case "DESCRIPTION":
                description = character.description + character.addOnDescription;
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle(character.fullName)
            .setURL(character.siteUrl)
            .setDescription(description)
            .setThumbnail(character.image)
            .setFooter({ text: character.footer });

        await interaction.edit({
            embeds: [embed],
        });
    },
};
