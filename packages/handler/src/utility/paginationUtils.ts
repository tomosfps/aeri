import { ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "@discordjs/builders";
import { ButtonStyle, ComponentType, MessageFlags } from "@discordjs/core";
import { getRedis } from "core";
import { Logger } from "logger";
import type { ContainerManager } from "wrappers/discord";
import type { ButtonInteraction } from "../classes/ButtonInteraction.js";
import { ChatInputInteraction } from "../classes/ChatInputCommandInteraction.js";
import { MessageContextInteraction } from "../classes/MessageContextInteraction.js";
import { SelectMenuInteraction } from "../classes/SelectMenuInteraction.js";
import { UserContextInteraction } from "../classes/UserContextInteraction.js";
import type { PaginatedCommand } from "../services/commands.js";

const logger = new Logger();
const redis = await getRedis();

export type PaginationSupportedInteraction =
    | ChatInputInteraction
    | SelectMenuInteraction
    | ButtonInteraction
    | UserContextInteraction
    | MessageContextInteraction;

export interface PaginationData<T> {
    items: T[];
    pageLimit: number;
    renderPage: (
        items: T[],
        pageNumber: number,
        totalPages: number,
        interaction: PaginationSupportedInteraction,
    ) => Promise<ContainerManager>;
    commandID: string;
    userID: string;
    timeout?: number;
}

export interface PaginationOptions {
    pageLimit: number;
    timeout?: number;
}

export class Pagination<T> {
    private items: T[];
    private pageLimit: number;
    private renderPage: (
        items: T[],
        pageNumber: number,
        totalPages: number,
        interaction: PaginationSupportedInteraction,
    ) => Promise<ContainerManager>;
    private commandID: string;
    private userID: string;
    private timeout: number;

    constructor(data: PaginationData<T>) {
        this.items = data.items;
        this.pageLimit = data.pageLimit;
        this.renderPage = data.renderPage;
        this.commandID = data.commandID;
        this.userID = data.userID;
        this.timeout = data.timeout || 3600;
    }

    get totalPages(): number {
        return Math.ceil(this.items.length / this.pageLimit);
    }

    getPageItems(pageNumber: number): T[] {
        const startIndex = (pageNumber - 1) * this.pageLimit;
        const endIndex = startIndex + this.pageLimit;
        return this.items.slice(startIndex, endIndex);
    }

    async createPaginationButtons(currentPage: number): Promise<ButtonBuilder[]> {
        if (this.totalPages <= 1) {
            return [];
        }

        const firstPageButton = new ButtonBuilder()
            .setCustomId(`pagination:first:${this.commandID}:${this.userID}`)
            .setLabel("First")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage <= 1);

        const previousPageButton = new ButtonBuilder()
            .setCustomId(`pagination:previous:${this.commandID}:${this.userID}`)
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage <= 1);

        const nextPageButton = new ButtonBuilder()
            .setCustomId(`pagination:next:${this.commandID}:${this.userID}`)
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage >= this.totalPages);

        const lastPageButton = new ButtonBuilder()
            .setCustomId(`pagination:last:${this.commandID}:${this.userID}`)
            .setLabel("Last")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage >= this.totalPages);

        const currentPageButton = new ButtonBuilder()
            .setCustomId(`pagination:current:${this.commandID}:${this.userID}`)
            .setLabel(`${currentPage}/${this.totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        return [firstPageButton, previousPageButton, nextPageButton, lastPageButton, currentPageButton];
    }

    private addPaginationButtonsToContainer(
        container: ContainerManager,
        buttons: ButtonBuilder[],
        _additionalContext?: Record<string, any>,
    ): void {
        if (buttons.length === 0) {
            return;
        }

        const containerState = container.getState();
        const existingActionRows = containerState.actionRow || [];

        const nonPaginationRows = existingActionRows.filter((row: any) => {
            if (!Array.isArray(row) || row.length === 0) return true;

            const firstComponent = row[0];

            if (!firstComponent) return true;

            let customId: string | undefined;
            if (typeof firstComponent.toJSON === "function") {
                try {
                    const json = firstComponent.toJSON();
                    customId = json.custom_id;
                } catch {
                    customId = firstComponent.data?.custom_id || firstComponent.customId;
                }
            } else if (firstComponent.data?.custom_id) {
                customId = firstComponent.data.custom_id;
            } else if (firstComponent.customId) {
                customId = firstComponent.customId;
            }

            return !customId?.startsWith("pagination:");
        });

        container.setActionRow([...nonPaginationRows, buttons]);
    }

    async storePaginationData(initialPage = 1, additionalContext?: Record<string, any>): Promise<void> {
        const key = `pagination:${this.userID}:${this.commandID}`;

        const data: Record<string, any> = {
            currentPage: initialPage,
            totalPages: this.totalPages,
            pageLimit: this.pageLimit,
            itemsData: JSON.stringify(this.items),
            expires: this.timeout,
        };

        if (additionalContext) {
            data["context"] = JSON.stringify(additionalContext);
        }

        await redis.hset(key, data);
        await redis.expire(key, this.timeout);

        logger.debug("Stored auto pagination data", "Pagination", {
            key,
            initialPage,
            totalPages: this.totalPages,
            itemCount: this.items.length,
        });
    }

    async clearOtherPaginationData(userID: string): Promise<void> {
        const pattern = `pagination:${userID}:*`;
        const keys = await redis.keys(pattern);

        for (const key of keys) {
            if (key !== `pagination:${userID}:${this.commandID}`) {
                await redis.del(key);
            }
        }
    }

    async createInitialPage(interaction: PaginationSupportedInteraction, initialPage = 1): Promise<void> {
        if (this.items.length === 0) {
            const container = interaction.getContainer();
            container.updateComponent("text", "No items to display.");

            if (
                interaction instanceof ChatInputInteraction ||
                interaction instanceof UserContextInteraction ||
                interaction instanceof MessageContextInteraction
            ) {
                await interaction.replyContainer();
            } else {
                await interaction.updateContainer();
            }
            return;
        }

        await this.clearOtherPaginationData(this.userID);

        let additionalContext: Record<string, any> | undefined = undefined;
        if (interaction instanceof SelectMenuInteraction) {
            const originalContainer = interaction.getContainer();
            const containerState = originalContainer.getState();

            additionalContext = {
                isSelectMenuInteraction: true,
                customID: interaction.customID,
                menuValues: interaction.menuValues,
                originalActionRows: containerState.actionRow,
            };
        }

        await this.storePaginationData(initialPage, additionalContext);

        const pageItems = this.getPageItems(initialPage);
        const container = await this.renderPage(pageItems, initialPage, this.totalPages, interaction);

        if (this.totalPages > 1) {
            const buttons = await this.createPaginationButtons(initialPage);
            this.addPaginationButtonsToContainer(container, buttons, additionalContext);
        }

        if (
            interaction instanceof ChatInputInteraction ||
            interaction instanceof UserContextInteraction ||
            interaction instanceof MessageContextInteraction
        ) {
            await interaction.followUpContainer();
        } else {
            await interaction.updateContainer();
        }
    }

    static async handlePaginationAction(
        interaction: ButtonInteraction,
        action: string,
        commandID: string,
        userID: string,
    ): Promise<void> {
        try {
            logger.debug("Handling auto pagination action", "Pagination", { action, commandID, userID });

            const key = `pagination:${userID}:${commandID}`;
            const paginationData = await redis.hgetall(key);

            if (!paginationData?.["currentPage"]) {
                return interaction.reply({
                    content: "This pagination has expired. Please run the command again.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const { currentPage, totalPages, pageLimit, itemsData, context: contextData } = paginationData;
            const parsedCurrentPage = Number.parseInt(currentPage);
            const parsedTotalPages = Number.parseInt(totalPages || "1");
            const parsedPageLimit = Number.parseInt(pageLimit || "10");
            const items = JSON.parse(itemsData || "[]");
            const context = contextData ? JSON.parse(contextData) : undefined;

            const newPage = Pagination.calculateNewPage(action, parsedCurrentPage, parsedTotalPages);
            if (newPage === parsedCurrentPage) return;

            await redis.hset(key, { currentPage: newPage });

            const handler = Pagination.getHandler(interaction, commandID);
            if (!handler?.renderPage) {
                logger.error("Command or select menu not found or missing renderPage method", "Pagination", {
                    commandID,
                });
                return interaction.reply({
                    content: "An error occurred while handling pagination.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const pagination = new Pagination({
                items,
                pageLimit: parsedPageLimit,
                renderPage: handler.renderPage.bind(handler),
                commandID,
                userID,
            });

            const renderInteraction = Pagination.createRenderInteraction(interaction, context);
            await Pagination.updateContainerWithNewPage(
                interaction,
                pagination,
                handler,
                newPage,
                renderInteraction,
                context,
            );

            logger.debug("Updated auto pagination successfully", "Pagination");
        } catch (error: any) {
            logger.error("Error handling auto pagination action", "Pagination", error);
            await interaction
                .reply({
                    content: "An error occurred while handling the pagination action.",
                    flags: MessageFlags.Ephemeral,
                })
                .catch(() => {});
        }
    }

    private static calculateNewPage(action: string, currentPage: number, totalPages: number): number {
        switch (action) {
            case "first":
                return 1;
            case "previous":
                return Math.max(1, currentPage - 1);
            case "next":
                return Math.min(totalPages, currentPage + 1);
            case "last":
                return totalPages;
            default:
                return currentPage;
        }
    }

    private static getHandler(interaction: ButtonInteraction, commandID: string): any {
        return (
            interaction.client.commands.get(commandID) ||
            interaction.client.selectMenus.get(commandID) ||
            interaction.client.messageContextCommands.get(commandID) ||
            interaction.client.userContextCommands.get(commandID)
        );
    }

    private static createRenderInteraction(interaction: ButtonInteraction, context?: any): any {
        if (!context?.isSelectMenuInteraction) return interaction;

        const modifiedInteraction = {
            ...interaction.interaction,
            data: {
                ...interaction.interaction.data,
                custom_id: context.customID,
                values: context.menuValues,
            },
        };

        const selectMenuInteraction = new SelectMenuInteraction(
            modifiedInteraction as any,
            interaction.api,
            interaction.client,
        );
        selectMenuInteraction.getContainer = interaction.getContainer.bind(interaction);
        return selectMenuInteraction;
    }

    private static async updateContainerWithNewPage(
        interaction: ButtonInteraction,
        pagination: Pagination<any>,
        handler: any,
        newPage: number,
        renderInteraction: any,
        context?: any,
    ): Promise<void> {
        const pageItems = pagination.getPageItems(newPage);
        const renderedContainer = await handler.renderPage(
            pageItems,
            newPage,
            pagination.totalPages,
            renderInteraction,
        );

        const currentContainer = interaction.getContainer();

        const renderedState = renderedContainer.getState();
        currentContainer.updateComponent("text", renderedState.text);
        currentContainer.updateComponent("section", renderedState.section);
        currentContainer.updateComponent("media", renderedState.media);

        Pagination.updateActionRows(currentContainer, renderedContainer, context);

        const buttons = await pagination.createPaginationButtons(newPage);
        pagination.addPaginationButtonsToContainer(currentContainer, buttons, context);

        await interaction.updateContainer();
    }

    private static updateActionRows(currentContainer: any, renderedContainer: any, context?: any): void {
        if (context?.isSelectMenuInteraction && context.originalActionRows) {
            const originalNonPaginationRows = Pagination.filterNonPaginationRows(context.originalActionRows);
            if (originalNonPaginationRows.length > 0) {
                const reconstructedRows = reconstructActionRows(originalNonPaginationRows);
                currentContainer.setActionRow(reconstructedRows);
            } else {
                currentContainer.clearActionRow();
            }
        } else {
            const renderedActionRows = renderedContainer.getState().actionRow || [];
            const nonPaginationRenderedRows = Pagination.filterNonPaginationRows(renderedActionRows);

            if (nonPaginationRenderedRows.length > 0) {
                currentContainer.setActionRow(nonPaginationRenderedRows);
            } else {
                currentContainer.clearActionRow();
            }
        }
    }

    private static filterNonPaginationRows(rows: any[]): any[] {
        return rows.filter((row: any) => {
            if (!Array.isArray(row) || row.length === 0) return true;

            const firstComponent = row[0];
            if (!firstComponent) return true;

            const customId = Pagination.extractCustomId(firstComponent);
            return !customId?.startsWith("pagination:");
        });
    }

    private static extractCustomId(component: any): string | undefined {
        if (typeof component.toJSON === "function") {
            try {
                return component.toJSON().custom_id;
            } catch {
                return component.data?.custom_id || component.customId;
            }
        }

        return component.data?.custom_id || component.customId;
    }
}

export async function createPagination<T>(
    items: T[],
    renderPage: (
        items: T[],
        pageNumber: number,
        totalPages: number,
        interaction: PaginationSupportedInteraction,
    ) => Promise<ContainerManager>,
    interaction: PaginationSupportedInteraction,
    options: PaginationOptions,
    commandID?: string,
): Promise<void> {
    const finalCommandID = commandID || (interaction as any).data?.name || "unknown";

    const pagination = new Pagination({
        items,
        pageLimit: options.pageLimit,
        renderPage,
        commandID: finalCommandID,
        userID: interaction.userID,
        timeout: options.timeout || 3600,
    });

    await pagination.createInitialPage(interaction);
}

export async function createSimplePagination<T extends PaginationSupportedInteraction, TItem>(
    command: Pick<PaginatedCommand<T, TItem>, "getItems" | "renderPage" | "pageLimit">,
    interaction: T,
    commandID?: string,
): Promise<void> {
    const items = await command.getItems(interaction);

    if (!items) {
        return;
    }

    const finalCommandID = commandID || (interaction as any).data?.name || "unknown";

    await createPagination(
        items,
        (pageItems, pageNumber, totalPages, paginationInteraction) =>
            command.renderPage(pageItems, pageNumber, totalPages, paginationInteraction as T),
        interaction,
        { pageLimit: command.pageLimit, timeout: 3600 },
        finalCommandID,
    );
}

function reconstructComponent(component: any): ButtonBuilder | StringSelectMenuBuilder | null {
    if (component instanceof ButtonBuilder || component instanceof StringSelectMenuBuilder) {
        return component;
    }

    let data = component;
    if (component.data) {
        data = component.data;
    }

    const componentType = data.type || component.type;

    if (componentType === ComponentType.Button) {
        try {
            const button = new ButtonBuilder();

            if (data.custom_id) button.setCustomId(data.custom_id);
            if (data.style !== undefined) button.setStyle(data.style);
            if (data.label) button.setLabel(data.label);
            if (data.url) button.setURL(data.url);
            if (data.emoji) button.setEmoji(data.emoji);
            if (data.disabled !== undefined) button.setDisabled(data.disabled);

            return button;
        } catch (error) {
            logger.error("Error reconstructing button component", "Pagination", { error, data });
            return null;
        }
    }

    if (componentType === ComponentType.StringSelect) {
        try {
            const select = new StringSelectMenuBuilder();

            if (data.custom_id) select.setCustomId(data.custom_id);
            if (data.placeholder) select.setPlaceholder(data.placeholder);
            if (data.min_values !== undefined) select.setMinValues(data.min_values);
            if (data.max_values !== undefined) select.setMaxValues(data.max_values);
            if (data.disabled !== undefined) select.setDisabled(data.disabled);

            if (data.options && Array.isArray(data.options)) {
                const options = data.options.map((opt: any) => {
                    const option = new StringSelectMenuOptionBuilder().setLabel(opt.label).setValue(opt.value);

                    if (opt.description) option.setDescription(opt.description);
                    if (opt.emoji) option.setEmoji(opt.emoji);
                    if (opt.default) option.setDefault(opt.default);

                    return option;
                });

                select.setOptions(...options);
            }

            return select;
        } catch (error) {
            logger.error("Error reconstructing select menu component", "Pagination", { error, data });
            return null;
        }
    }

    logger.warn("Unable to reconstruct component - unknown type", "Pagination", {
        componentType,
        hasData: !!component.data,
        keys: Object.keys(component),
    });
    return null;
}

function reconstructActionRows(actionRows: any[]): Array<ButtonBuilder[] | StringSelectMenuBuilder[]> {
    return actionRows
        .map((row) => {
            if (!Array.isArray(row)) return row;
            return row.map((component) => reconstructComponent(component)).filter((comp) => comp !== null);
        })
        .filter((row) => row.length > 0);
}
