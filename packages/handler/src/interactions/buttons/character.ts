import { SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import { MessageFlags } from "@discordjs/core";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import type { Button } from "../../services/commands.js";

const logger = new Logger();

type DescriptionType = "ANIME" | "MANGA" | "DESCRIPTION";
type ButtonData = {
    characterName: string;
    type: DescriptionType;
    userID: string;
};

export const interaction: Button<ButtonData> = {
    data: { custom_id: "character" },
    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid button data");
        }
        return { characterName: data[0], type: data[1] as DescriptionType, userID: data[2] };
    },
    async execute(interaction, data): Promise<void> {
        const { result: character, error } = await api.fetch(Routes.Character, { character_name: data.characterName });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                flags: MessageFlags.Ephemeral,
            });
        }

        if (character === null) {
            return interaction.reply({
                content: `Could not find ${data.characterName} within the Anilist API`,
                flags: MessageFlags.Ephemeral,
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

        const container = interaction.getContainer();

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(`# [${character.fullName}](${character.siteUrl})\n${description}`),
        );

        if (character.image) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(character.image));
        }

        container.updateComponent("section", [section]).updateComponent("footer", character.footer);

        await interaction.updateContainer();
    },
};
