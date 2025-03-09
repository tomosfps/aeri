import { ActionRowBuilder, ButtonBuilder, type EmbedBuilder } from "@discordjs/builders";
import { getRedis } from "core";
import { type APIEmbed, ButtonStyle } from "discord-api-types/v10";
import { Logger } from "logger";
import type { ButtonInteraction } from "../classes/ButtonInteraction.js";
import { ChatInputInteraction } from "../classes/ChatInputCommandInteraction.js";
import type { MessageComponentInteraction } from "../classes/MessageComponentInteraction.js";
import { MessageContextInteraction } from "../classes/MessageContextInteraction.js";
import type { SelectMenuInteraction } from "../classes/SelectMenuInteraction.js";
import { UserContextInteraction } from "../classes/UserContextInteraction.js";

const logger = new Logger();
const redis = await getRedis();

interface PaginationOptions {
    userID: string;
    commandID: string;
    totalPages: number;
    initalPage?: number;
    timeout?: number;
}

export function determineInteractionType(
    interaction:
        | ChatInputInteraction
        | SelectMenuInteraction
        | ButtonInteraction
        | UserContextInteraction
        | MessageComponentInteraction,
    commandID: string,
) {
    const commandData = interaction.client.commands.get(commandID);
    const selectMenuData = interaction.client.selectMenus.get(commandID);
    const buttonData = interaction.client.buttons.get(commandID);
    const userContextData = interaction.client.userContextCommands.get(commandID);
    const messageContextData = interaction.client.messageContextCommands.get(commandID);

    return commandData || selectMenuData || buttonData || userContextData || messageContextData;
}

export async function createPage(
    interaction:
        | ChatInputInteraction
        | SelectMenuInteraction
        | ButtonInteraction
        | UserContextInteraction
        | MessageComponentInteraction,
    options: PaginationOptions,
    getPageContent: (page: number) => Promise<{ embeds: Array<EmbedBuilder | APIEmbed> }>,
): Promise<void> {
    const { userID, commandID, initalPage = 1, totalPages, timeout = 3600 } = options;
    const key = `pagination:${userID}:${commandID}`;

    await redis.hset(key, {
        currentPage: initalPage,
        totalPages: totalPages,
        expires: timeout,
    });

    await redis.expire(key, timeout);

    const content = await getPageContent(initalPage);
    const row = createPageButtons(initalPage, totalPages, commandID, userID);

    logger.debug("Creating pagination", "Pagination", { key, initalPage, totalPages });

    const currentComponents = interaction.message_components || [];
    const filteredComponents = currentComponents.filter(
        (component) =>
            !component.components?.some(
                (c) => "custom_id" in c && typeof c.custom_id === "string" && c.custom_id.startsWith("pagination:"),
            ),
    );
    try {
        if (
            interaction instanceof ChatInputInteraction ||
            interaction instanceof UserContextInteraction ||
            interaction instanceof MessageContextInteraction
        ) {
            await interaction.reply({
                embeds: content.embeds,
                components: [...filteredComponents, row.toJSON()],
            });
        } else {
            await interaction.updateMessage({
                embeds: content.embeds,
                components: [...filteredComponents, row.toJSON()],
            });
        }
    } catch (error: any) {
        logger.error("Error creating pagination", "Pagination", error);
        await interaction
            .reply({
                content: "An error occurred while creating the pagination.",
                ephemeral: true,
            })
            .catch(() => {});
    }
}

export function createPageButtons(currentPage: number, maxPages: number, commandID: string, userID: string) {
    const firstPageButton = new ButtonBuilder()
        .setCustomId(`pagination:first:${commandID}:${userID}`)
        .setLabel("First")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage <= 1);

    const previousPageButton = new ButtonBuilder()
        .setCustomId(`pagination:previous:${commandID}:${userID}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage <= 1);

    const nextPageButton = new ButtonBuilder()
        .setCustomId(`pagination:next:${commandID}:${userID}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage >= maxPages);

    const lastPageButton = new ButtonBuilder()
        .setCustomId(`pagination:last:${commandID}:${userID}`)
        .setLabel("Last")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= maxPages);

    const currentPageButton = new ButtonBuilder()
        .setCustomId(`pagination:current:${commandID}:${userID}`)
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

export async function handlePagination(
    interaction: ButtonInteraction,
    action: string,
    commandID: string,
    targetUserID: string,
    getPageContent: (page: number) => Promise<{ embeds: Array<EmbedBuilder | APIEmbed> }>,
): Promise<void> {
    try {
        logger.debug("Starting handlePagination", "Pagination", { action, commandID, targetUserID });

        const userID = interaction.user_id;
        const paginationKey = `pagination:${userID}:${commandID}`;
        const paginationData = await redis.hgetall(paginationKey);

        if (!paginationData || !paginationData["currentPage"]) {
            logger.error("Missing pagination data", "Pagination", { paginationData });
            return interaction.reply({
                content: "This pagination has expired. Please run the command again.",
                ephemeral: true,
            });
        }

        logger.debug("Found pagination data", "Pagination", { paginationData });
        const currentPage = Number.parseInt(paginationData["currentPage"]);
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

            try {
                const content = await getPageContent(newPage);

                const currentComponents = interaction.message_components || [];
                const filteredComponents = currentComponents.filter(
                    (component) =>
                        !component.components?.some(
                            (c) =>
                                "custom_id" in c &&
                                typeof c.custom_id === "string" &&
                                c.custom_id.startsWith("pagination:"),
                        ),
                );

                await interaction.updateMessage({
                    embeds: content.embeds,
                    components: [
                        ...filteredComponents,
                        createPageButtons(newPage, totalPages, commandID, userID).toJSON(),
                    ],
                });

                logger.debug("Updated message successfully", "Pagination");
            } catch (contentError: any) {
                logger.error("Error getting page content", "Pagination", contentError);
                await interaction
                    .reply({
                        content: "Error loading page content. Please try again.",
                        ephemeral: true,
                    })
                    .catch(() => {});
            }
        } else {
            logger.debug("Page unchanged", "Pagination", { currentPage, newPage });
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
