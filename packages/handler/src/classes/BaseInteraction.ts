import type { ActionRowBuilder, EmbedBuilder, MessageComponentBuilder } from "@discordjs/builders";
import {
    type API,
    type APIActionRowComponent,
    type APIEmbed,
    type APIInteraction,
    type APIMessageTopLevelComponent,
    type AllowedMentionsTypes,
    MessageFlags,
    PermissionFlagsBits,
    type RESTPostAPIChannelMessageJSONBody,
} from "@discordjs/core";
import { ChannelType } from "@discordjs/core";
import { env } from "core";
import type { HandlerClient } from "./HandlerClient.js";

export type ContentOptions = {
    content?: string | undefined;
    embeds?: Array<EmbedBuilder | APIEmbed> | undefined;
    components?:
        | APIActionRowComponent<any>[]
        | ActionRowBuilder<any>[]
        | APIMessageTopLevelComponent[]
        | MessageComponentBuilder[];
    flags?: number | undefined;
    allowedMentions?: AllowedMentionsTypes[] | undefined;
};

export class BaseInteraction {
    constructor(
        public interaction: APIInteraction,
        public api: API,
        public client: HandlerClient,
    ) {}

    get baseColour() {
        return 0xffb6c1;
    }

    get id() {
        return this.interaction.id;
    }

    get token() {
        return this.interaction.token;
    }

    get isNSFW() {
        if (this.interaction.channel?.type === ChannelType.DM || this.interaction.channel?.type === ChannelType.GroupDM)
            return false;
        return this.interaction.channel?.nsfw || false;
    }

    get user() {
        if (this.interaction.member) {
            return this.interaction.member.user;
        }

        // biome-ignore lint/style/noNonNullAssertion: It will always be present
        return this.interaction.user!;
    }

    get member() {
        return this.interaction.member;
    }

    get userID() {
        return this.user.id;
    }

    get guildID() {
        return this.interaction.guild_id;
    }

    get guilds() {
        return this.api.guilds;
    }

    get messageComponents() {
        return this.interaction.message?.components?.map((component) => {
            return component;
        });
    }

    get canEmbed() {
        const permissions = BigInt(this.interaction.app_permissions);

        if (!this.guildID) {
            return true;
        }

        return Boolean(
            permissions & PermissionFlagsBits.EmbedLinks &&
                permissions & PermissionFlagsBits.SendMessages &&
                permissions & PermissionFlagsBits.SendMessagesInThreads,
        );
    }

    public async reply(options: ContentOptions) {
        const transformOptions: RESTPostAPIChannelMessageJSONBody = {
            content: options.content,
            embeds: options.embeds?.map((embed) => {
                if ("toJSON" in embed) {
                    return embed.toJSON();
                }
                return embed;
            }),
            // @ts-expect-error DJS Moment
            components: options.components?.map((component) => {
                if ("toJSON" in component) {
                    return component.toJSON();
                }
                return component;
            }),
            allowed_mentions: options.allowedMentions ? { parse: options.allowedMentions } : undefined,
            flags: options.flags,
        };
        await this.api.interactions.reply(this.id, this.token, transformOptions);
    }

    public async editReply(options: ContentOptions) {
        const transformOptions: RESTPostAPIChannelMessageJSONBody = {
            content: options.content,
            embeds: options.embeds?.map((embed) => {
                if ("toJSON" in embed) {
                    return embed.toJSON();
                }
                return embed;
            }),
            // @ts-expect-error djs dev moment
            components: options.components?.map((component) => {
                if ("toJSON" in component) {
                    return component.toJSON();
                }
                return component;
            }),
            allowed_mentions: options.allowedMentions ? { parse: options.allowedMentions } : undefined,
            flags: options.flags,
        };
        await this.api.interactions.editReply(env.DISCORD_APPLICATION_ID, this.token, transformOptions);
    }

    public async updateMessage(options: ContentOptions) {
        const transformOptions: RESTPostAPIChannelMessageJSONBody = {
            content: options.content,
            embeds: options.embeds?.map((embed) => {
                if ("toJSON" in embed) {
                    return embed.toJSON();
                }
                return embed;
            }),
            // @ts-expect-error djs dev moment
            components: options.components?.map((component) => {
                if ("toJSON" in component) {
                    return component.toJSON();
                }
                return component;
            }),
            allowed_mentions: options.allowedMentions ? { parse: options.allowedMentions } : undefined,
            flags: options.flags,
        };

        await this.api.interactions.updateMessage(this.id, this.token, transformOptions);
    }

    public async followUp(options: ContentOptions) {
        const transformOptions: RESTPostAPIChannelMessageJSONBody = {
            content: options.content,
            embeds: options.embeds?.map((embed) => {
                if ("toJSON" in embed) {
                    return embed.toJSON();
                }
                return embed;
            }),
            // @ts-expect-error djs dev moment
            components: options.components?.map((component) => {
                if ("toJSON" in component) {
                    return component.toJSON();
                }
                return component;
            }),
            allowed_mentions: options.allowedMentions ? { parse: options.allowedMentions } : undefined,
            flags: options.flags,
        };

        await this.api.interactions.followUp(env.DISCORD_APPLICATION_ID, this.token, transformOptions);
    }

    public async defer(hidden = false) {
        return await this.api.interactions.defer(this.id, this.token, {
            flags: hidden ? MessageFlags.Ephemeral : undefined,
        });
    }
}
