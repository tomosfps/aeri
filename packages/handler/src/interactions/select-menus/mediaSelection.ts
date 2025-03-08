import { EmbedBuilder } from "@discordjs/builders";
import { getRedis } from "core";
import { dbFetchAnilistUser, dbFetchGuildUsers } from "database";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import type { SelectMenu } from "../../services/commands.js";
import { createPage } from "../../utility/paginationUtilts.js";

type SelectMenuData = {
    custom_id: string;
    userID: string;
};

const redis = await getRedis();
const logger = new Logger();

export const interaction: SelectMenu<SelectMenuData> = {
    custom_id: "media_selection",
    cooldown: 1,
    toggleable: true,
    timeout: 900,
    pageLimit: 15,
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { custom_id: data[0], userID: data[1] };
    },
    async execute(interaction, data): Promise<void> {
        try {
            const media_type = data.custom_id === "anime" ? MediaType.Anime : MediaType.Manga;
            const media_id = Number(interaction.menuValues[0]);

            const mediaKey = `media:${interaction.user_id}:selection`;
            await redis.hmset(mediaKey, {
                media_type: media_type.toString(),
                media_id: media_id.toString(),
                command_id: data.custom_id,
            });
            await redis.expire(mediaKey, this.timeout);

            const currentUserData = await dbFetchAnilistUser(interaction.user_id);
            let allPotentialUsers: string[] = [];
            if (interaction.guild_id) {
                const guildUsersData = await dbFetchGuildUsers(interaction.guild_id);
                allPotentialUsers = guildUsersData.map((user) => user.anilist?.username).filter(Boolean) as string[];

                if (currentUserData) {
                    allPotentialUsers = allPotentialUsers.filter((username) => username !== currentUserData.username);
                    allPotentialUsers.unshift(currentUserData.username);
                }
            } else if (currentUserData) {
                allPotentialUsers.push(currentUserData.username);
            }
            const totalPages = Math.ceil(allPotentialUsers.length / (this.pageLimit ?? 15));

            await createPage(
                interaction,
                {
                    userID: interaction.user_id,
                    commandID: "media_selection",
                    totalPages: totalPages,
                },
                async (page: number) => (this.page ? await this.page(page, interaction) : { embeds: [] }),
            );
        } catch (error: any) {
            logger.error("Error in execute", "MediaSelection", error);
            await interaction
                .reply({
                    content: "An error occurred while processing your request.",
                    ephemeral: true,
                })
                .catch(() => {});
        }
    },

    async page(page, interaction) {
        try {
            const mediaKey = `media:${interaction.user_id}:selection`;
            const mediaData = await redis.hgetall(mediaKey);

            if (!mediaData || !mediaData["media_id"]) {
                logger.warnSingle("No media data found in Redis", "MediaSelection");
                return {
                    embeds: [
                        new EmbedBuilder().setDescription("Session expired. Please search again.").setColor(0xff0000),
                    ],
                };
            }

            const media_type = mediaData["media_type"] === "ANIME" ? MediaType.Anime : MediaType.Manga;
            const media_id = Number(mediaData["media_id"]);

            logger.debug("Fetching media page", "MediaPage", {
                media_id,
                media_type,
                page,
            });

            const { result, error } = await api.fetch(
                Routes.Media,
                { media_type, media_id },
                {
                    user_id: interaction.user_id,
                    guild_id: interaction.guild_id,
                    pageOptions: {
                        page,
                        limit: this.pageLimit ?? 15,
                    },
                },
            );

            if (error || !result) {
                logger.error("API fetch error", "MediaSelection", { error });
                return {
                    embeds: [new EmbedBuilder().setDescription("Failed to load this page.").setColor(0xff0000)],
                };
            }

            const title = (result.title.romaji || result.title.english || result.title.native) as string;
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setURL(result.siteUrl)
                .setImage(result.banner)
                .setThumbnail(result.cover)
                .setDescription(result.description || "No description available.")
                .setColor(interaction.base_colour || 0x2f3136)
                .setFooter({ text: result.footer || `Page ${page}` });

            return { embeds: [embed] };
        } catch (err: any) {
            logger.error("Error in page method", "MediaSelection", err);
            return {
                embeds: [
                    new EmbedBuilder().setDescription("An error occurred while loading this page.").setColor(0xff0000),
                ],
            };
        }
    },
};
