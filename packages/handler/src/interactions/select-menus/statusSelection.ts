import { EmbedBuilder } from "@discordjs/builders";
import { Logger } from "logger";
import { type MediaType, Routes, api } from "wrappers/anilist";
import { type MediaListStatus, mediaListStatusString } from "../../../../wrappers/dist/anilist/enums.js";
import type { SelectMenu } from "../../services/commands.js";

type SelectMenuData = {
    userName: string;
    mediaType: string;
    userId: string;
};

const logger = new Logger();

export const interaction: SelectMenu<SelectMenuData> = {
    custom_id: "status_selection",
    cooldown: 1,
    toggleable: true,
    timeout: 900,
    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { userName: data[0], mediaType: data[1], userId: data[2] };
    },
    async execute(interaction, data): Promise<void> {
        const type = data.mediaType as MediaType;
        const username = data.userName;
        const status = interaction.menuValues[0] as MediaListStatus;

        const { result, error } = await api.fetch(Routes.WatchList, { username, status, type });

        if (error || !result) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${result.user.name}'s ${mediaListStatusString(status)} List`)
            .setColor(interaction.base_colour)
            .setDescription(result.description)
            .setFooter({ text: result.footer });

        await interaction.edit({ embeds: [embed] });
    },
};
