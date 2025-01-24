import { EmbedBuilder } from "@discordjs/builders";
import { env } from "core";
import { Logger } from "log";
import type { SelectMenu } from "../../services/commands.js";
import { fetchMedia, intervalTime } from "../../utility/interactionUtils.js";

const logger = new Logger();

type SelectMenuData = {
    custom_id: string;
};

export const interaction: SelectMenu<SelectMenuData> = {
    custom_id: "genre_selection",
    cooldown: 20,
    parse(data) {
        if (!data[0]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { custom_id: data[0] };
    },
    async execute(interaction, data): Promise<void> {
        const mediaType = data.custom_id === "ANIME" ? "ANIME" : "MANGA";
        const response = await fetch(`${env.API_URL}/recommend`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                media: mediaType,
                genres: interaction.menuValues,
            }),
        }).catch((error) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (response === null) {
            logger.error("Request returned null", "Anilist");
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        const result = await response.json().catch((error) => {
            logger.error("Error while parsing JSON data.", "Anilist", error);
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        });

        if (result === null) {
            return interaction.reply({ content: "Could not find a recommendation based on genres.", ephemeral: true });
        }
        const media = await fetchMedia(mediaType, Number(result), interaction);

        if (!media) {
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(media.result.romaji)
            .setURL(media.result.url)
            .setImage(media.result.banner)
            .setThumbnail(media.result.cover.extraLarge)
            .setDescription(media.description.join(""))
            .setFooter({
                text: `${media.result.dataFrom === "API" ? "Displaying API data" : `Displaying cache data : expires in ${intervalTime(media.result.leftUntilExpire)}`}`,
            })
            .setColor(0x2f3136);
        await interaction.edit({ embeds: [embed] });
    },
};
