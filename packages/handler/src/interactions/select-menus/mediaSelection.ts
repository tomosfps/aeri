import { EmbedBuilder } from "@discordjs/builders";
import { fetchAnilistMedia } from "anilist";
import { formatSeconds } from "core";
import type { SelectMenu } from "../../services/commands.js";

type SelectMenuData = {
    custom_id: string;
    userId: string;
};

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
        const mediaType = data.custom_id === "anime" ? "ANIME" : "MANGA";
        const media = await fetchAnilistMedia(mediaType, Number(interaction.menuValues[0]), interaction);

        if (media === null) {
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(media.result.romaji)
            .setURL(media.result.url)
            .setImage(media.result.banner)
            .setThumbnail(media.result.cover.extraLarge)
            .setDescription(media.description)
            .setFooter({
                text: `${media.result.dataFrom === "API" ? "Displaying API data" : `Displaying cache data : expires in ${formatSeconds(media.result.leftUntilExpire)}`}`,
            })
            .setColor(0x2f3136);
        await interaction.edit({ embeds: [embed] });
    },
};
