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

        const { result: media, error } = await api.fetch(
            Routes.Media,
            { media_type, media_id },
            { guild_id: interaction.guild_id },
        );

        if (error || !media) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                ephemeral: true,
            });
        }

        const title = (media.title.romaji || media.title.english || media.title.native) as string;

        interaction.client.metricsClient.media_commands.inc({
            media_type: media_type,
            media_id: media_id,
            media_name: title,
        });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setURL(media.siteUrl)
            .setImage(media.banner)
            .setThumbnail(media.cover)
            .setDescription(media.description)
            .setColor(interaction.base_colour)
            .setFooter({ text: media.footer });

        await interaction.edit({ embeds: [embed] });
    },
};
