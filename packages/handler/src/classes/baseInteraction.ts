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

    get member() {
        return this.interaction.member;
    }

    get member_id() {
        return BigInt(this.member?.user.id || "0");
    }

    get message_id() {
        return this.interaction.message?.id;
    }

    get guild_id() {
        return this.interaction.guild_id;
    }

    get guilds() {
        return this.api.guilds;
    }

    get member_name() {
        return this.member?.user.username || "undefined";
    }

    public format_seconds(seconds: number, granularity = 2) {
        const intervals: [string, number][] = [
            ["weeks", 604800],
            ["days", 86400],
            ["hours", 3600],
            ["minutes", 60],
            ["seconds", 1],
        ];
    
        const result: string[] = [];
        let secondsLeft = seconds;
    
        for (const [name, count] of intervals) {
            const value = Math.floor(secondsLeft / count);
            if (value) {
                secondsLeft -= value * count;
                let formattedName = name;
                if (value === 1) {
                    formattedName = name.slice(0, -1);
                }
                result.push(`${value} ${formattedName}`);
            }
        }
        return result.slice(0, granularity).join(", ");
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
