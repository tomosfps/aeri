import { EmbedBuilder } from "@discordjs/builders";
import { fetchAnilistMedia, fetchRecommendation } from "anilist";
import { Logger } from "logger";
import type { SelectMenu } from "../../services/commands.js";

const logger = new Logger();
type SelectMenuData = {
    custom_id: string;
    userId: string;
};

export const interaction: SelectMenu<SelectMenuData> = {
    custom_id: "genre_selection",
    cooldown: 1,
    toggable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { custom_id: data[0], userId: data[1] };
    },
    async execute(interaction, data): Promise<void> {
        const mediaType = data.custom_id === "ANIME" ? "ANIME" : "MANGA";
        const result = await fetchRecommendation(mediaType, interaction.menuValues);
        const media = await fetchAnilistMedia(mediaType, Number(result), interaction);

        if (result === null) {
            logger.errorSingle("Problem trying to fetch data in result", "genreSelection");
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        if (media === null) {
            logger.errorSingle("Problem trying to fetch data in media", "genreSelection");
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(media.result.romaji)
            .setURL(media.result.url)
            .setImage(media.result.banner)
            .setThumbnail(media.result.cover.extraLarge)
            .setDescription(media.description)
            .setFooter({
                text: `${media.result.dataFrom === "API" ? "Displaying API data" : `Displaying cache data : expires in ${interaction.format_seconds(media.result.leftUntilExpire)}`}`,
            })
            .setColor(0x2f3136);
        await interaction.edit({ embeds: [embed] });
    },
};
