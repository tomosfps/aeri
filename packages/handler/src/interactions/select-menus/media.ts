import { MediaGalleryItemBuilder, SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import { MessageFlags, SeparatorSpacingSize } from "@discordjs/core";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import type { SelectMenu } from "../../services/commands.js";

type SelectMenuData = {
    customID: string;
    userID: string;
};

const logger = new Logger();

export const interaction: SelectMenu<SelectMenuData> = {
    data: { custom_id: "media" },
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { customID: data[0], userID: data[1] };
    },
    async execute(interaction, data): Promise<void> {
        const mediaType = data.customID === "anime" ? MediaType.Anime : MediaType.Manga;
        const mediaID = Number(interaction.menuValues[0]);

        const { result, error } = await api.fetch(
            Routes.Media,
            { media_type: mediaType, media_id: mediaID },
            { user_id: interaction.userID, guild_id: interaction.guildID },
        );

        if (error || !result) {
            logger.error("API fetch error", "MediaSelection", { error });
            return interaction.followUp({ content: "Failed to fetch media from API", flags: MessageFlags.Ephemeral });
        }

        const title = (result.title.romaji || result.title.english || result.title.native) as string;

        interaction.client.metricsClient.media_commands.inc({
            media_type: mediaType,
            media_id: mediaID,
            media_name: title,
        });

        const container = interaction.getContainer();

        if (result.banner) {
            container
                .updateComponent("media", [new MediaGalleryItemBuilder().setURL(result.banner)])
                .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        } else {
            container.updateComponent("media", []).updateComponent("separator", []);
        }

        const sectionBuilder = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(`## [${title}](${result.siteUrl})\n${result.description}`),
        );

        if (result.cover) {
            sectionBuilder.setThumbnailAccessory(new ThumbnailBuilder().setURL(result.cover));
        }

        container.updateComponent("section", [sectionBuilder]).updateComponent("text", `${result.footer}`);

        await interaction.updateContainer();
    },
};
