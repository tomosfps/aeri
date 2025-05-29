import {
    ButtonBuilder,
    ContainerBuilder,
    MediaGalleryItemBuilder,
    SectionBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "@discordjs/builders";
import {
    type APIActionRowComponent,
    type APIComponentInMessageActionRow,
    type APIMediaGalleryComponent,
    type APIMessageTopLevelComponent,
    type APISectionComponent,
    type APISeparatorComponent,
    type APITextDisplayComponent,
    ComponentType,
    type SeparatorSpacingSize,
} from "@discordjs/core";

export type ContainerSection = "text" | "media" | "separator" | "section" | "actionRow";

interface SectionItem {
    type: ContainerSection;
    value: any;
    id: string;
}

export type ContainerState = {
    accentColor?: number | undefined;
    text?: string | undefined;
    media?: MediaGalleryItemBuilder[] | undefined;
    separator?: Array<{
        divider: boolean;
        spacing?: SeparatorSpacingSize;
    }> | undefined;
    actionRow?: Array<ButtonBuilder[] | StringSelectMenuBuilder[]> | undefined;
    section?: SectionBuilder[] | undefined;
};

export class ContainerManager {
    private state: ContainerState = {};
    private sectionItems: SectionItem[] = [];
    private nextId = 0;
    private lastInsertPosition = 0;
    private customComponentOrder: ContainerSection[] | null = null;

    constructor(initialState?: ContainerState) {
        if (initialState) {
            this.state = { ...initialState };
        }
    }

    private generateId(): string {
        return `section-${this.nextId++}`;
    }

    public setComponentOrder(order: ContainerSection[]): this {
        this.customComponentOrder = [...order];
        return this;
    }

    public resetComponentOrder(): this {
        this.customComponentOrder = null;
        return this;
    }

    private getInsertPosition(section: ContainerSection): number {
        if (section === "separator") {
            return this.sectionItems.length;
        }

        const componentOrder: ContainerSection[] = this.customComponentOrder || [
            "media",
            "section",
            "text",
            "actionRow",
        ];
        const sectionIndex = componentOrder.indexOf(section);

        if (sectionIndex === -1) {
            return this.sectionItems.length;
        }

        for (let i = 0; i < this.sectionItems.length; i++) {
            const currentItem = this.sectionItems[i];
            if (currentItem && currentItem.type !== "separator") {
                const currentItemIndex = componentOrder.indexOf(currentItem.type);
                if (currentItemIndex > sectionIndex) {
                    return i;
                }
            }
        }

        return this.sectionItems.length;
    }

    public getState(): ContainerState {
        const synced: ContainerState = { ...this.state };
        const actionRowItems = this.sectionItems.filter((item) => item.type === "actionRow");
        const allActionRows: Array<ButtonBuilder[] | StringSelectMenuBuilder[]> = [];

        for (const item of actionRowItems) {
            if (item.value && Array.isArray(item.value)) {
                allActionRows.push(item.value as ButtonBuilder[] | StringSelectMenuBuilder[]);
            }
        }

        if (allActionRows.length > 0) {
            synced.actionRow = allActionRows;
        } else {
            synced.actionRow = undefined;
        }

        return synced;
    }

    public extractFromMessage(messageComponents: APIMessageTopLevelComponent[]): this {
        this.sectionItems = [];
        this.lastInsertPosition = 0;
        const preservedState = { ...this.state };
        this.state = {};
        if (preservedState.accentColor !== undefined) {
            this.state.accentColor = preservedState.accentColor;
        }

        for (const component of messageComponents) {
            if (component.type === ComponentType.Container) {
                this.extractComponents(component.components);
            }
        }

        this.lastInsertPosition = this.sectionItems.length - 1;
        return this;
    }

    public extractComponents(components: APIMessageTopLevelComponent[]): void {
        for (const component of components) {
            switch (component.type) {
                case ComponentType.TextDisplay:
                    this.extractTextDisplay(component);
                    break;
                case ComponentType.MediaGallery:
                    this.extractMediaGallery(component);
                    break;
                case ComponentType.ActionRow:
                    this.extractActionRow(component);
                    break;
                case ComponentType.Separator:
                    this.extractSeparator(component);
                    break;
                case ComponentType.Section:
                    this.extractSection(component);
                    break;
            }
        }
    }

    private extractTextDisplay(component: APITextDisplayComponent): void {
        const content = component.content || "";
        this.state.text = content;

        this.sectionItems.push({
            type: "text",
            value: content,
            id: this.generateId(),
        });
        this.lastInsertPosition = this.sectionItems.length - 1;
    }

    private extractMediaGallery(component: APIMediaGalleryComponent): void {
        const mediaItems = (component.items || []).map((item) => {
            const builder = new MediaGalleryItemBuilder();
            if (item.media.url) builder.setURL(item.media.url);
            if (item.description) builder.setDescription(item.description);
            if (item.spoiler) builder.setSpoiler(item.spoiler);
            return builder;
        });

        this.state.media = mediaItems;

        if (mediaItems.length > 0) {
            this.sectionItems.push({
                type: "media",
                value: mediaItems,
                id: this.generateId(),
            });
            this.lastInsertPosition = this.sectionItems.length - 1;
        }
    }

    private extractActionRow(component: APIActionRowComponent<APIComponentInMessageActionRow>): void {
        const actionRowComponents = (component.components || []).map((comp: any) => {
            if (comp.type === ComponentType.Button) {
                const button = new ButtonBuilder();
                if ("custom_id" in comp) button.setCustomId(comp.custom_id);
                if ("style" in comp) button.setStyle(comp.style);
                if ("label" in comp) button.setLabel(comp.label);
                if ("url" in comp && comp.url) button.setURL(comp.url);
                if ("emoji" in comp && comp.emoji) button.setEmoji(comp.emoji);
                if ("disabled" in comp) button.setDisabled(comp.disabled);
                return button;
            }
            if (comp.type === ComponentType.StringSelect) {
                const select = new StringSelectMenuBuilder();
                if ("custom_id" in comp) select.setCustomId(comp.custom_id);
                if ("placeholder" in comp) select.setPlaceholder(comp.placeholder);
                if ("min_values" in comp) select.setMinValues(comp.min_values);
                if ("max_values" in comp) select.setMaxValues(comp.max_values);
                if ("disabled" in comp) select.setDisabled(comp.disabled);
                if ("options" in comp && Array.isArray(comp.options)) {
                    const options = comp.options.map((opt: any) => {
                        const option = new StringSelectMenuOptionBuilder().setLabel(opt.label).setValue(opt.value);

                        if (opt.description) option.setDescription(opt.description);
                        if (opt.emoji) option.setEmoji(opt.emoji);
                        if (opt.default) option.setDefault(opt.default);

                        return option;
                    });

                    select.setOptions(...options);
                }

                return select;
            }
            return comp;
        });

        if (!this.state.actionRow) {
            this.state.actionRow = [];
        }
        this.state.actionRow.push(actionRowComponents as ButtonBuilder[] | StringSelectMenuBuilder[]);

        if (actionRowComponents.length > 0) {
            this.sectionItems.push({
                type: "actionRow",
                value: actionRowComponents as ButtonBuilder[],
                id: this.generateId(),
            });
            this.lastInsertPosition = this.sectionItems.length - 1;
        }
    }

    private extractSeparator(component: APISeparatorComponent): void {
        const separatorConfig = {
            divider: component.divider || false,
            ...(component.spacing !== undefined ? { spacing: component.spacing } : {}),
        };

        if (!this.state.separator) {
            this.state.separator = [];
        }
        this.state.separator.push(separatorConfig);

        this.sectionItems.push({
            type: "separator",
            value: separatorConfig,
            id: this.generateId(),
        });
        this.lastInsertPosition = this.sectionItems.length - 1;
    }

    private extractSection(_component: APISectionComponent): void {
        try {
            const sectionBuilder = new SectionBuilder();

            if (!this.state.section) {
                this.state.section = [];
            }
            this.state.section.push(sectionBuilder);

            this.sectionItems.push({
                type: "section",
                value: sectionBuilder,
                id: this.generateId(),
            });
            this.lastInsertPosition = this.sectionItems.length - 1;
        } catch (error) {
            console.error("Failed to extract section:", error);
        }
    }

    public updateComponent<T extends ContainerSection>(section: T, value: ContainerState[T]): this {
        if (value === undefined || value === null) {
            return this;
        }

        if (section === "media" && Array.isArray(value) && value.length === 0) {
            this.removeAllComponentsOfType("media");
            return this;
        }

        if (section === "separator") {
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    const hasMedia = this.sectionItems.some((item) => item.type === "media");
                    if (!hasMedia) {
                        const firstSeparatorIndex = this.sectionItems.findIndex((item) => item.type === "separator");
                        if (firstSeparatorIndex !== -1) {
                            this.sectionItems.splice(firstSeparatorIndex, 1);
                        }
                    } else {
                        const nextSeparatorIndex = this.lastInsertPosition + 1;
                        if (
                            nextSeparatorIndex < this.sectionItems.length &&
                            this.sectionItems[nextSeparatorIndex]?.type === "separator"
                        ) {
                            this.sectionItems.splice(nextSeparatorIndex, 1);
                        }
                    }
                    return this;
                }

                const nextSeparatorIndex = this.lastInsertPosition + 1;
                if (
                    nextSeparatorIndex < this.sectionItems.length &&
                    this.sectionItems[nextSeparatorIndex]?.type === "separator"
                ) {
                    this.sectionItems.splice(nextSeparatorIndex, 1);
                }

                for (let i = 0; i < value.length; i++) {
                    this.sectionItems.splice(this.lastInsertPosition + 1 + i, 0, {
                        type: "separator",
                        value: value[i],
                        id: this.generateId(),
                    });
                }
                this.lastInsertPosition += value.length;

                this.state.separator = value as { divider: boolean; spacing?: SeparatorSpacingSize }[];
                return this;
            }
        }

        if (section === "section") {
            if (Array.isArray(value)) {
                const existingSectionIndex = this.sectionItems.findIndex((item) => item.type === "section");
                this.sectionItems = this.sectionItems.filter((item) => item.type !== "section");
                const insertPosition =
                    existingSectionIndex >= 0 ? existingSectionIndex : this.getInsertPosition("section");

                for (let i = 0; i < value.length; i++) {
                    this.sectionItems.splice(insertPosition + i, 0, {
                        type: "section",
                        value: value[i],
                        id: this.generateId(),
                    });
                }

                this.lastInsertPosition = insertPosition + value.length - 1;
                (this.state as any)[section] = value;
                return this;
            }
        }

        const existingIndex = this.sectionItems.findIndex((item) => item.type === section);

        if (existingIndex >= 0) {
            const item = this.sectionItems[existingIndex];
            if (item) {
                item.value = value;
                this.lastInsertPosition = existingIndex;
            }
        } else {
            const insertPosition = this.getInsertPosition(section);
            this.sectionItems.splice(insertPosition, 0, {
                type: section,
                value: value,
                id: this.generateId(),
            });
            this.lastInsertPosition = insertPosition;
        }

        (this.state as any)[section] = value;
        return this;
    }

    public setComponent<T extends ContainerSection>(section: T, value: ContainerState[T]): this {
        if (value === undefined || value === null) {
            this.removeAllComponentsOfType(section);
            return this;
        }

        if (Array.isArray(value) && value.length === 0) {
            this.removeAllComponentsOfType(section);
            return this;
        }

        if (section === "separator") {
            if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    this.sectionItems.splice(this.lastInsertPosition + 1 + i, 0, {
                        type: "separator",
                        value: value[i],
                        id: this.generateId(),
                    });
                }
                this.lastInsertPosition += value.length;

                if (!this.state.separator) {
                    this.state.separator = [];
                }
                this.state.separator.push(...(value as { divider: boolean; spacing?: SeparatorSpacingSize }[]));
                return this;
            }
        }

        if (section === "section") {
            if (Array.isArray(value)) {
                this.removeAllComponentsOfType("section");
                const insertPosition = this.getInsertPosition("section");
                for (let i = 0; i < value.length; i++) {
                    this.sectionItems.splice(insertPosition + i, 0, {
                        type: "section",
                        value: value[i],
                        id: this.generateId(),
                    });
                }
                this.lastInsertPosition = insertPosition + value.length - 1;
                (this.state as any)[section] = value;
                return this;
            }
        }

        const existingIndex = this.sectionItems.findIndex((item) => item.type === section);

        if (existingIndex >= 0) {
            const item = this.sectionItems[existingIndex];

            if (item) {
                item.value = value;
                this.lastInsertPosition = existingIndex;
            }
        } else {
            const insertPosition = this.getInsertPosition(section);
            this.sectionItems.splice(insertPosition, 0, {
                type: section,
                value: value,
                id: this.generateId(),
            });
            this.lastInsertPosition = insertPosition;
        }

        (this.state as any)[section] = value;
        return this;
    }

    public addSeparator(divider: boolean, spacing?: SeparatorSpacingSize): this {
        const separatorConfig = {
            divider,
            ...(spacing !== undefined ? { spacing } : {}),
        };

        if (!this.state.separator) {
            this.state.separator = [];
        }
        this.state.separator.push(separatorConfig);
        this.sectionItems.splice(this.lastInsertPosition + 1, 0, {
            type: "separator",
            value: separatorConfig,
            id: this.generateId(),
        });
        this.lastInsertPosition++;

        return this;
    }

    public removeSeparator(): this {
        return this.removeComponent("separator");
    }

    public addActionRow(components: ButtonBuilder[] | StringSelectMenuBuilder[]): this {
        if (!this.state.actionRow) {
            this.state.actionRow = [];
        }
        this.state.actionRow.push(components);

        this.sectionItems.push({
            type: "actionRow",
            value: components,
            id: this.generateId(),
        });
        this.lastInsertPosition = this.sectionItems.length - 1;

        return this;
    }

    public setActionRow(actionRows: Array<ButtonBuilder[] | StringSelectMenuBuilder[]>): this {
        this.removeAllComponentsOfType("actionRow");
        this.state.actionRow = [...actionRows];

        const insertPosition = this.getInsertPosition("actionRow");
        for (let i = 0; i < actionRows.length; i++) {
            this.sectionItems.splice(insertPosition + i, 0, {
                type: "actionRow",
                value: actionRows[i],
                id: this.generateId(),
            });
        }
        this.lastInsertPosition = insertPosition + actionRows.length - 1;

        return this;
    }

    public clearActionRow(): this {
        this.removeAllComponentsOfType("actionRow");
        return this;
    }

    private removeAllComponentsOfType(section: ContainerSection): this {
        this.sectionItems = this.sectionItems.filter((item) => item.type !== section);

        if (section === "separator") {
            this.state.separator = [];
        } else {
            (this.state as any)[section] = undefined;
        }
        return this;
    }

    public removeComponent(section: ContainerSection): this {
        return this.removeAllComponentsOfType(section);
    }

    public build(): ContainerBuilder {
        const container = new ContainerBuilder();

        if (this.state.accentColor !== undefined) {
            container.setAccentColor(this.state.accentColor);
        }

        for (const item of this.sectionItems) {
            switch (item.type) {
                case "text":
                    if (item.value !== undefined && item.value !== null) {
                        container.addTextDisplayComponents((builder) => builder.setContent(item.value));
                    }
                    break;

                case "separator":
                    if (item.value && typeof item.value === "object") {
                        container.addSeparatorComponents((separator) => {
                            separator.setDivider(item.value.divider);

                            if (item.value.spacing) {
                                separator.setSpacing(item.value.spacing);
                            }

                            return separator;
                        });
                    }
                    break;

                case "media":
                    if (Array.isArray(item.value) && item.value.length > 0) {
                        container.addMediaGalleryComponents((builder) => builder.addItems(...item.value));
                    }
                    break;

                case "section":
                    if (item.value instanceof SectionBuilder) {
                        const sectionToJSON = item.value.toJSON();
                        if (
                            sectionToJSON.components &&
                            Array.isArray(sectionToJSON.components) &&
                            sectionToJSON.components.length > 0
                        ) {
                            container.addSectionComponents(() => item.value);
                        }
                    } else if (Array.isArray(item.value) && item.value.length > 0) {
                        for (const sectionBuilder of item.value) {
                            if (sectionBuilder instanceof SectionBuilder) {
                                const sectionToJSON = sectionBuilder.toJSON();
                                if (
                                    sectionToJSON.components &&
                                    Array.isArray(sectionToJSON.components) &&
                                    sectionToJSON.components.length > 0
                                ) {
                                    container.addSectionComponents(() => sectionBuilder);
                                }
                            }
                        }
                    }
                    break;

                case "actionRow":
                    if (Array.isArray(item.value) && item.value.length > 0) {
                        container.addActionRowComponents((builder) => builder.addComponents(...item.value));
                    }
                    break;
            }
        }
        return container;
    }
}
