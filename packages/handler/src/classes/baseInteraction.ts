import { ActionRowBuilder, EmbedBuilder, ModalBuilder } from "@discordjs/builders";
import {
    type API,
    type APIActionRowComponent,
    type APIEmbed,
    type APIInteraction,
    type APIModalInteractionResponseCallbackData,
    MessageFlags,
} from "@discordjs/core";
import { env } from "core";
import type { HandlerClient } from "./handlerClient.js";

export class BaseInteraction {
    constructor(
        public interaction: APIInteraction,
        public api: API,
        public client: HandlerClient,
    ) {}

    get id() {
        return this.interaction.id;
    }

    get token() {
        return this.interaction.token;
    }

    get user() {
        if (this.interaction.member) {
            return this.interaction.member.user;
        }

        // biome-ignore lint/style/noNonNullAssertion: Either user or member is present
        return this.interaction.user!;
    }

    get member() {
        return this.interaction.member;
    }

    get user_id() {
        return this.user.id;
    }

    get user_name() {
        return this.user.username;
    }

    get guild_id() {
        return this.interaction.guild_id;
    }

    get guilds() {
        return this.api.guilds;
    }

    public async reply(
        options: {
            content?: string;
            embeds?: EmbedBuilder[] | APIEmbed[];
            components?: APIActionRowComponent<any>[] | ActionRowBuilder<any>[];
            ephemeral?: boolean;
        } = {},
    ) {
        const flags: number = options.ephemeral ? MessageFlags.Ephemeral : 0;

        await this.api.interactions.reply(this.id, this.token, {
            content: options.content,
            embeds: options.embeds?.map((embed) => {
                if (embed instanceof EmbedBuilder) {
                    return embed.toJSON();
                }
                return embed;
            }),
            components: options.components?.map((component) => {
                if (component instanceof ActionRowBuilder) {
                    return component.toJSON();
                }
                return component;
            }),
            flags,
        });
    }

    public async edit(
        options: {
            content?: string;
            embeds?: EmbedBuilder[] | APIEmbed[];
            components?: APIActionRowComponent<any>[] | ActionRowBuilder<any>[];
            ephemeral?: boolean;
        } = {},
    ) {
        const flags: number = options.ephemeral ? MessageFlags.Ephemeral : 0;

        await this.api.interactions.updateMessage(this.id, this.token, {
            content: options.content,
            embeds: options.embeds?.map((embed) => {
                if (embed instanceof EmbedBuilder) {
                    return embed.toJSON();
                }
                return embed;
            }),
            components: options.components?.map((component) => {
                if (component instanceof ActionRowBuilder) {
                    return component.toJSON();
                }
                return component;
            }),
            flags,
        });
    }

    public async editReply(
        options: {
            content?: string;
            embeds?: EmbedBuilder[] | APIEmbed[];
            components?: APIActionRowComponent<any>[] | ActionRowBuilder<any>[];
            ephemeral?: boolean;
        } = {},
    ) {
        const flags: number = options.ephemeral ? MessageFlags.Ephemeral : 0;

        await this.api.interactions.editReply(env.DISCORD_APPLICATION_ID, this.token, {
            content: options.content,
            embeds: options.embeds?.map((embed) => {
                if (embed instanceof EmbedBuilder) {
                    return embed.toJSON();
                }
                return embed;
            }),
            components: options.components?.map((component) => {
                if (component instanceof ActionRowBuilder) {
                    return component.toJSON();
                }
                return component;
            }),
            flags,
        });
    }

    public async followUp(
        options: {
            content?: string;
            embeds?: EmbedBuilder[] | APIEmbed[];
            components?: APIActionRowComponent<any>[] | ActionRowBuilder<any>[];
            ephemeral?: boolean;
        } = {},
    ) {
        const flags: number = options.ephemeral ? MessageFlags.Ephemeral : 0;
        await this.api.interactions.followUp(env.DISCORD_APPLICATION_ID, this.token, {
            content: options.content,
            embeds: options.embeds?.map((embed) => {
                if (embed instanceof EmbedBuilder) {
                    return embed.toJSON();
                }
                return embed;
            }),
            components: options.components?.map((component) => {
                if (component instanceof ActionRowBuilder) {
                    return component.toJSON();
                }
                return component;
            }),
            flags,
        });
    }

    public async deployModal(modal: ModalBuilder | APIModalInteractionResponseCallbackData) {
        const json = modal instanceof ModalBuilder ? modal.toJSON() : modal;
        return await this.api.interactions.createModal(this.id, this.token, json);
    }

    public async defer() {
        return await this.api.interactions.defer(this.id, this.token);
    }
}
