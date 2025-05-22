import {
    ButtonBuilder,
    ContainerBuilder,
    MediaGalleryItemBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "@discordjs/builders";
import { type APIMessageTopLevelComponent, ComponentType, type SeparatorSpacingSize } from "@discordjs/core";

export type ContainerSection = "text" | "media" | "separator" | "actionRow";

export type ContainerState = {
    accentColor?: number;
    text?: string;
    media?: MediaGalleryItemBuilder[];
    separator?: {
        divider: boolean;
        spacing?: SeparatorSpacingSize;
    };
    actionRow?: ButtonBuilder[] | StringSelectMenuBuilder[];
};

export class ContainerManager {
    private state: ContainerState = {};

    constructor(initialState?: ContainerState) {
        if (initialState) {
            this.state = initialState;
        }
    }

    public extractFromMessage(messageComponents: APIMessageTopLevelComponent[]): this {
        for (const component of messageComponents) {
            if (component.type === ComponentType.Container) {
                this.extractComponents(component.components);
            }
        }

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
            }
        }
    }

    private extractTextDisplay(component: APIMessageTopLevelComponent): void {
        if (component.type === ComponentType.TextDisplay) {
            this.state.text = component.content || "";
        }
    }

    private extractMediaGallery(component: APIMessageTopLevelComponent): void {
        if (component.type === ComponentType.MediaGallery) {
            this.state.media = (component.items || []).map((item) => {
                const builder = new MediaGalleryItemBuilder();
                if (item.media.url) builder.setURL(item.media.url);
                if (item.description) builder.setDescription(item.description);
                if (item.spoiler) builder.setSpoiler(item.spoiler);
                return builder;
            });
        }
    }

    private extractActionRow(component: APIMessageTopLevelComponent): void {
        if (component.type === ComponentType.ActionRow) {
            const actionRowComponents = (component.components || []).map((comp) => {
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
                        const options = comp.options.map((opt) => {
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

            this.state.actionRow = actionRowComponents as ButtonBuilder[];
        }
    }

    private extractSeparator(component: APIMessageTopLevelComponent): void {
        if (component.type === ComponentType.Separator) {
            this.state.separator = {
                divider: component.divider || false,
                ...(component.spacing !== undefined ? { spacing: component.spacing } : {}),
            };
        }
    }

    public updateSection<T extends ContainerSection>(section: T, value: ContainerState[T]): this {
        this.state[section] = value;
        return this;
    }

    public setAccentColor(color: number): this {
        this.state.accentColor = color;
        return this;
    }

    public build(): ContainerBuilder {
        const container = new ContainerBuilder();

        if (this.state.accentColor !== undefined) {
            container.setAccentColor(this.state.accentColor);
        }

        if (this.state.text) {
            // biome-ignore lint/style/noNonNullAssertion: There is literally a check here
            container.addTextDisplayComponents((builder) => builder.setContent(this.state.text!));
        }

        if (this.state.separator) {
            container.addSeparatorComponents((separator) => {
                separator.setDivider(this.state.separator?.divider);

                if (this.state.separator?.spacing) {
                    separator.setSpacing(this.state.separator?.spacing);
                }

                return separator;
            });
        }

        if (this.state.media && this.state.media.length > 0) {
            // biome-ignore lint/style/noNonNullAssertion: There is literally a check here
            container.addMediaGalleryComponents((builder) => builder.addItems(...this.state.media!));
        }

        if (this.state.actionRow && this.state.actionRow.length > 0) {
            // biome-ignore lint/style/noNonNullAssertion: There is literally a check here
            container.addActionRowComponents((builder) => builder.addComponents(...this.state.actionRow!));
        }

        return container;
    }
}
