import { EmbedBuilder } from "@discordjs/builders";
import { getRedis } from "core";
import { Logger } from "logger";
import { type MediaListStatus, type MediaType, Routes, api, mediaListStatusString } from "wrappers/anilist";
import type { PaginatedSelectMenu } from "../../services/commands.js";
import { createPage } from "../../utility/paginationUtils.js";

type SelectMenuData = {
    userName: string;
    mediaType: string;
    userId: string;
};

const logger = new Logger();
const redis = await getRedis();

export const interaction: PaginatedSelectMenu<SelectMenuData> = {
    custom_id: "status_selection",
    cooldown: 1,
    toggleable: true,
    timeout: 900,
    pageLimit: 15,
    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { userName: data[0], mediaType: data[1], userId: data[2] };
    },
    async execute(interaction, data): Promise<void> {
        try {
            const type = data.mediaType as MediaType;
            const username = data.userName;
            const status = interaction.menuValues[0] as MediaListStatus;
            const statusKey = `status:${interaction.user_id}:selection`;

            await redis.hmset(statusKey, {
                username,
                media_type: type.toString(),
                status,
            });
            await redis.expire(statusKey, this.timeout);

            const { result, error } = await api.fetch(
                Routes.WatchList,
                {
                    username,
                    status,
                    type,
                },
                {
                    pageOptions: {
                        page: 1,
                        limit: this.pageLimit,
                    },
                },
            );

            if (error || !result) {
                logger.error("Error while fetching data from the API.", "Anilist", { error });

                return interaction.reply({
                    content:
                        "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                    ephemeral: true,
                });
            }

            await createPage(this, interaction, {
                userID: interaction.user_id,
                commandID: "status_selection",
                totalPages: result.pagination.totalPages,
            });
        } catch (error: any) {
            logger.error("Error in execute", "StatusSelection", error);
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
            const statusKey = `status:${interaction.user_id}:selection`;
            const statusData = await redis.hgetall(statusKey);

            if (!statusData || !statusData["username"] || !statusData["status"] || !statusData["media_type"]) {
                logger.warnSingle("No status data found in Redis", "StatusSelection");
                return {
                    embeds: [
                        new EmbedBuilder().setDescription("Session expired. Please try again.").setColor(0xff0000),
                    ],
                };
            }

            const { result, error } = await api.fetch(
                Routes.WatchList,
                {
                    username: statusData["username"],
                    status: statusData["status"] as MediaListStatus,
                    type: statusData["media_type"] as MediaType,
                },
                {
                    pageOptions: {
                        page,
                        limit: this.pageLimit,
                    },
                },
            );

            if (error || !result) {
                logger.error("API fetch error", "StatusSelection", { error });
                return {
                    embeds: [new EmbedBuilder().setDescription("Failed to load this page.").setColor(0xff0000)],
                };
            }

            const embed = new EmbedBuilder()
                .setTitle(
                    `${result.user.name}'s ${mediaListStatusString(statusData["status"] as MediaListStatus)} List`,
                )
                .setColor(interaction.base_colour || 0x2f3136)
                .setDescription(result.description)
                .setFooter({ text: result.footer });

            return { embeds: [embed] };
        } catch (err: any) {
            logger.error("Error in page method", "StatusSelection", err);
            return {
                embeds: [
                    new EmbedBuilder().setDescription("An error occurred while loading this page.").setColor(0xff0000),
                ],
            };
        }
    },
};
