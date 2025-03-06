import { ActionRowBuilder, ButtonBuilder, type EmbedBuilder } from "@discordjs/builders";
import { getRedis } from "core";
import { ButtonStyle } from "discord-api-types/v10";
import { Logger } from "logger";
import type { ButtonInteraction } from "../classes/ButtonInteraction.js";
import type { ChatInputInteraction } from "../classes/ChatInputCommandInteraction.js";

const logger = new Logger();
const redis = await getRedis();

interface PaginationOptions {
    userID: string;
    commandID: string;
    totalPages: number;
    initalPage?: number;
    timeout?: number;
}

export async function createPage(
    interaction: ChatInputInteraction,
    options: PaginationOptions,
    getPageContent: (page: number) => Promise<{ embeds: EmbedBuilder[] }>,
): Promise<void> {
    const { userID, commandID, initalPage = 1, totalPages, timeout = 3600 } = options;
    const key = `pagination:${userID}:${commandID}`;

    await redis.hset(key, {
        currentPage: initalPage,
        totalPages: totalPages,
        expires: Date.now() + timeout * 1000,
    });

    await redis.expire(key, timeout);

    const content = await getPageContent(initalPage);
    const row = createPageButtons(initalPage, totalPages, commandID);

    await interaction.reply({
        embeds: content.embeds,
        components: [row],
    });
}

export function createPageButtons(currentPage: number, maxPages: number, commandID: string) {
    const firstPageButton = new ButtonBuilder()
        .setCustomId(`pagination:first:${commandID}`)
        .setLabel("First")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage <= 1);

    const previousPageButton = new ButtonBuilder()
        .setCustomId(`pagination:previous:${commandID}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage <= 1);

    const nextPageButton = new ButtonBuilder()
        .setCustomId(`pagination:next:${commandID}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage >= maxPages);

    const lastPageButton = new ButtonBuilder()
        .setCustomId(`pagination:last:${commandID}`)
        .setLabel("Last")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage >= maxPages);

    const currentPageButton = new ButtonBuilder()
        .setCustomId(`pagination:current:${commandID}`)
        .setLabel(`${currentPage}/${maxPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        firstPageButton,
        previousPageButton,
        nextPageButton,
        lastPageButton,
        currentPageButton,
    );
}

export async function handlePaginationButton(
    interaction: ButtonInteraction,
    action: string,
    commandID: string,
    getPageContent: (page: number) => Promise<{ embeds: EmbedBuilder[] }>,
): Promise<void> {
    try {
        const userID = interaction.user_id;
        const paginationKey = `pagination:${userID}:${commandID}`;
        const paginationData = await redis.hgetall(paginationKey);

        if (!paginationData || !paginationData["currentPage"]) {
            return interaction.reply({
                content: "This pagination has expired. Please run the command again.",
                ephemeral: true,
            });
        }

        const currentPage = Number.parseInt(paginationData["currentPage"] || "1");
        const totalPages = Number.parseInt(paginationData["totalPages"] || "1");
        let newPage = currentPage;

        switch (action) {
            case "first":
                newPage = 1;
                break;
            case "previous":
                newPage = Math.max(1, currentPage - 1);
                break;
            case "next":
                newPage = Math.min(totalPages, currentPage + 1);
                break;
            case "last":
                newPage = totalPages;
                break;
            default:
                return;
        }

        if (newPage !== currentPage) {
            await redis.hset(paginationKey, { currentPage: newPage });

            const content = await getPageContent(newPage);

            if (content?.embeds) {
                content.embeds = content.embeds.map((embed) => {
                    if (
                        (embed.data && embed.data.description === "") ||
                        (embed.data && embed.data.description === null) ||
                        (embed.data && embed.data.description === undefined)
                    ) {
                        embed.data.description = "No content for this page";
                    }
                    return embed;
                });
            }

            await interaction.updateMessage({
                embeds: content.embeds,
                components: [createPageButtons(newPage, totalPages, commandID)],
            });
        }
    } catch (error: any) {
        logger.error("Error handling pagination button", "Pagination", error);
        await interaction
            .reply({
                content: "An error occurred while handling the pagination button.",
                ephemeral: true,
            })
            .catch(() => {});
    }
}
