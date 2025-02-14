import { EmbedBuilder } from "@discordjs/builders";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import type { Button } from "../../services/commands.js";

type DescriptionType = "INFORMATION" | "ANIME" | "MANGA";

const logger = new Logger();

type ButtonData = {
    anilistUsername: string;
    type: DescriptionType;
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "userShow",
    toggleable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid button data");
        }
        return { anilistUsername: data[0], type: data[1] as DescriptionType, userId: data[2] };
    },
    async execute(interaction, data): Promise<void> {
        const anilistUsername = data.anilistUsername;

        const { result: user, error } = await api.fetch(Routes.User, { username: anilistUsername });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.reply({
                content: "An error occurred while fetching data from the API.",
                ephemeral: true,
            });
        }

        if (user === null) {
            return interaction.reply({
                content: `Could not find ${user} within the Anilist API`,
                ephemeral: true,
            });
        }

        let description = "";
        switch (data.type) {
            case "INFORMATION":
                description = user.description;
                break;
            case "ANIME":
                description = user.animeFavourites;
                break;
            case "MANGA":
                description = user.mangaFavourites;
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle(user.name)
            .setURL(user.siteUrl)
            .setDescription(description)
            .setThumbnail(user.avatar)
            .setImage(user.banner)
            .setFooter({ text: user.footer })
            .setColor(0x2f3136);

        await interaction.edit({
            embeds: [embed],
        });
    },
};
