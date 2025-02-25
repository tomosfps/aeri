import { EmbedBuilder } from "@discordjs/builders";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import type { SelectMenu } from "../../services/commands.js";

type SelectMenuData = {
    custom_id: string;
    userId: string;
};

const logger = new Logger();

export const interaction: SelectMenu<SelectMenuData> = {
    custom_id: "media_selection",
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
        const media_type = data.custom_id === "anime" ? MediaType.Anime : MediaType.Manga;
        const media_id = Number(interaction.menuValues[0]);

        if (!interaction.guild_id) {
            return interaction.reply({ content: "This command can only be used in a server", ephemeral: true });
        }

        logger.debug("Fetching media data", "Anilist", { media_type, media_id });
        const { result: media, error } = await api.fetch(
            Routes.Media,
            { media_type, media_id },
            { guild_id: interaction.guild_id },
        );

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.reply({
                content: "An error occurred while fetching data from the API",
                ephemeral: true,
            });
        }

        if (media === null) {
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(media.title.romaji)
            .setURL(media.siteUrl)
            .setImage(media.banner)
            .setThumbnail(media.cover)
            .setDescription(media.description)
            .setColor(interaction.base_colour)
            .setFooter({ text: media.footer });

        interaction.base_colour;
        await interaction.edit({ embeds: [embed] });
    },
};
