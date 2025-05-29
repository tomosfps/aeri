import { MediaGalleryItemBuilder, SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import { MessageFlags, SeparatorSpacingSize } from "@discordjs/core";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import type { SelectMenu } from "../../services/commands.js";

const logger = new Logger();
type SelectMenuData = {
    type: string;
    userID: string;
};

export const interaction: SelectMenu<SelectMenuData> = {
    data: { custom_id: "genre" },
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { type: data[0], userID: data[1] };
    },
    async execute(interaction, data): Promise<void> {
        const mediaType = data.type === "ANIME" ? MediaType.Anime : MediaType.Manga;
        const genres = interaction.menuValues;

        await interaction.deferUpdate();

        const { result: recommendation, error: recommendationsError } = await api.fetch(Routes.Recommend, {
            media: mediaType,
            genres: genres,
        });

        if (recommendationsError) {
            logger.error("Error while fetching recommendations from the API.", "Anilist", recommendationsError);

            return interaction.editReply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                flags: MessageFlags.Ephemeral,
            });
        }

        if (!recommendation) {
            return interaction.editReply({ content: "User not found" });
        }

        const mediaID = Number(recommendation.id);
        const { result: media, error: mediaError } = await api.fetch(
            Routes.Media,
            { media_type: mediaType, media_id: mediaID },
            { user_id: interaction.userID, guild_id: interaction.guildID },
        );

        if (mediaError || !media) {
            logger.error("Error while fetching data from the API.", "Anilist", { mediaError });

            return interaction.editReply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                flags: MessageFlags.Ephemeral,
            });
        }

        const container = interaction.getContainer();

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(
                `# [${media.title.romaji}](${media.siteUrl})\n${media.description || "No description available."}`,
            ),
        );

        if (media.cover) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(media.cover));
        }

        container
            .updateComponent("section", [section])
            .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);

        if (media.banner) {
            container
                .updateComponent("media", [new MediaGalleryItemBuilder().setURL(media.banner)])
                .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        }

        if (media.footer) {
            container.updateComponent("footer", media.footer);
        }

        await interaction.editReplyContainer();
    },
};
