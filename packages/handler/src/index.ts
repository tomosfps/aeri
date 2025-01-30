import {
    type API,
    type APIApplicationCommandAutocompleteInteraction,
    type APIChatInputApplicationCommandInteraction,
    type APIMessageApplicationCommandInteraction,
    type APIMessageComponentButtonInteraction,
    type APIMessageComponentSelectMenuInteraction,
    type APIModalSubmitInteraction,
    type APIUserApplicationCommandInteraction,
    Client,
    GatewayDispatchEvents,
    MessageFlags,
} from "@discordjs/core";

import { REST } from "@discordjs/rest";
import { getRedis } from "core";
import { env } from "core/dist/env.js";
import { createGuild, fetchGuild, fetchUser, removeFromGuild, updateGuild } from "database";
import type { APIUser } from "discord-api-types/v10";
import { Logger } from "log";
import { ButtonInteraction } from "./classes/buttonInteraction.js";
import { CommandInteraction } from "./classes/commandInteraction.js";
import { HandlerClient } from "./classes/handlerClient.js";
import { ModalInteraction } from "./classes/modalInteraction.js";
import { SelectMenuInteraction } from "./classes/selectMenuInteraction.js";
import { Gateway } from "./gateway.js";
import { FileType, load } from "./services/commands.js";
import { InteractType, determineInteractionType } from "./utility/interactionUtils.js";

const logger = new Logger();
export const commands = await load(FileType.Commands);
export const buttons = await load(FileType.Buttons);
export const selectMenus = await load(FileType.SelectMenus);
export const modals = await load(FileType.Modals);
const redis = await getRedis();
const rest = new REST().setToken(env.DISCORD_TOKEN);
const gateway = new Gateway({ redis, env });
await gateway.connect();
const client = new Client({ rest, gateway });
const handlerClient = new HandlerClient(client);
handlerClient.commands = commands;

const interactionHandlers: Record<InteractType, (interaction: any, api: API) => void> = {
    [InteractType.Autocomplete]: (interaction: APIApplicationCommandAutocompleteInteraction) => {
        logger.debugSingle(`Received autocomplete interaction: ${interaction.data.name}`, "Handler");
    },
    [InteractType.ChatInput]: async (interaction: APIChatInputApplicationCommandInteraction, api) => {
        logger.debugSingle(`Received chat input interaction: ${interaction.data.name}`, "Handler");

        const command = commands.get(interaction.data.name);
        const memberId = interaction.member?.user.id;
        //commands.forEach((command) => { logger.debug(`Custom Command`, "Handler", command); });

        if (!memberId) {
            logger.warnSingle("Member was not found", "Handler");
            return;
        }

        if (!command) {
            logger.warn(`Command not found: ${interaction.data.name}`, "Handler");
            return;
        }

        const redisKey = `${interaction.data.name}_${memberId}`;
        if (await checkRedis(redisKey, command, memberId)) {
            const redisTTL = await redis.ttl(redisKey);
            const expirationTime = Date.now() + redisTTL * 1000;
            api.interactions.reply(interaction.id, interaction.token, {
                content: `This command is currently on cooldown and can be used <t:${Math.round(expirationTime / 1000)}:R> `,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        try {
            logger.infoSingle(`Executing command: ${command.data.name}`, "Handler");
            command.execute(new CommandInteraction(interaction, api, handlerClient));
        } catch (error: any) {
            logger.error("Command execution error:", "Handler", error);
        }
    },
    [InteractType.SelectMenu]: async (interaction: APIMessageComponentSelectMenuInteraction, api) => {
        logger.debugSingle(`Received select menu interaction: ${interaction.data.custom_id}`, "Handler");

        const [selectId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
        const selectMenu = selectMenus.get(selectId);
        const memberId = interaction.member?.user.id;
        const toggable = selectMenu?.toggable ?? false;

        if (!memberId) {
            logger.warnSingle("Member was not found", "Handler");
            return;
        }

        logger.debug("Checking if command is toggable", "Handler", { toggable, memberId, data });
        if (toggable && !data.includes(memberId)) {
            logger.warnSingle("Command is toggable and member was not found in data", "Handler");
            api.interactions.reply(interaction.id, interaction.token, {
                content: "Only the user who toggled this command can use it",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (!selectMenu) {
            logger.warnSingle(`Select menu not found: ${selectId}`, "Handler");
            return;
        }

        const redisKey = `${selectId}_${memberId}`;
        if (await checkRedis(redisKey, selectMenu, memberId)) {
            const redisTTL = await redis.ttl(redisKey);
            const expirationTime = Date.now() + redisTTL * 1000;
            api.interactions.reply(interaction.id, interaction.token, {
                content: `This action is currently on cooldown and can be used <t:${Math.round(expirationTime / 1000)}:R> `,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        try {
            logger.infoSingle(`Executing select menu: ${selectId}`, "Handler");
            selectMenu.execute(new SelectMenuInteraction(interaction, api, handlerClient), selectMenu.parse?.(data));
        } catch (error: any) {
            logger.error("Select menu execution error:", "Handler", error);
        }
    },
    [InteractType.Modal]: (interaction: APIModalSubmitInteraction, api) => {
        logger.debugSingle(`Received modal interaction: ${interaction.data.custom_id}`, "Handler");

        const [modalId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
        const modal = modals.get(modalId);

        if (!modal) {
            logger.warn(`Modal not found: ${modalId}`, "Handler");
            return;
        }

        try {
            logger.infoSingle(`Executing modal: ${modalId}`, "Handler");
            modal.execute(new ModalInteraction(interaction, api, handlerClient), modal.parse?.(data));
        } catch (error: any) {
            logger.error("Modal execution error:", "Handler", error);
        }
    },
    [InteractType.UserContext]: (interaction: APIUserApplicationCommandInteraction) => {
        logger.debugSingle(`Received user context interaction: ${interaction.data.name}`, "Handler");
    },
    [InteractType.MessageContext]: (interaction: APIMessageApplicationCommandInteraction) => {
        logger.debugSingle(`Received message context interaction: ${interaction.data.name}`, "Handler");
    },
    [InteractType.Button]: async (interaction: APIMessageComponentButtonInteraction, api) => {
        logger.debugSingle(`Received button interaction: ${interaction.data.custom_id}`, "Handler");

        const [buttonId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
        const button = buttons.get(buttonId);
        const memberId = interaction.member?.user.id;
        const toggable = button?.toggable ?? false;

        if (!button) {
            logger.warnSingle(`Button not found: ${buttonId}`, "Handler");
            return;
        }

        if (!memberId) {
            logger.warnSingle("Member was not found", "Handler");
            return;
        }

        logger.debug("Checking if command is toggable", "Handler", { toggable, memberId, data });
        if (toggable && !data.includes(memberId)) {
            logger.warnSingle("Command is toggable and member was not found in data", "Handler");
            api.interactions.reply(interaction.id, interaction.token, {
                content: "Only the user who toggled this command can use it",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const redisKey = `${buttonId}_${memberId}`;
        if (await checkRedis(redisKey, button, memberId)) {
            const redisTTL = await redis.ttl(redisKey);
            const expirationTime = Date.now() + redisTTL * 1000;
            api.interactions.reply(interaction.id, interaction.token, {
                content: `This action is currently on cooldown and can be used <t:${Math.round(expirationTime / 1000)}:R> `,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        try {
            logger.infoSingle(`Executing button: ${buttonId}`, "Handler");
            button.execute(new ButtonInteraction(interaction, api, handlerClient), button.parse?.(data));
        } catch (error: any) {
            logger.error("Button execution error:", "Handler", error);
        }
    },
    [InteractType.Unknown]: (interaction: any) => {
        logger.warnSingle(`Unknown interaction type: ${interaction.type}`, "Handler");
    },
};

client.on(GatewayDispatchEvents.Ready, () => {
    logger.infoSingle("Ready", "Handler");
});

client.on(GatewayDispatchEvents.Resumed, () => {
    logger.infoSingle("Resumed", "Handler");
});

client.on(GatewayDispatchEvents.InteractionCreate, async ({ data: interaction, api }) => {
    const type = determineInteractionType(interaction);
    interactionHandlers[type](interaction, api);
});

client.on(GatewayDispatchEvents.MessageCreate, async ({ data: message }) => {
    if (message.author.bot) return;

    if (message.guild_id === undefined) {
        logger.warnSingle("Guild ID is undefined", "Handler");
        return;
    }

    if (!message.author) {
        logger.warnSingle("Member is undefined", "Handler");
        return;
    }

    const memberId = BigInt(message.author.id);
    const guildId = BigInt(message.guild_id);
    const inDatabase = await fetchUser(memberId);

    if (inDatabase) {
        logger.debugSingle(`Member ${message.author.username} is already in the database`, "Handler");
        const guildData = await fetchGuild(guildId, memberId);

        if (guildData !== null) {
            const checkGuild = guildData.users.some((user: { discord_id: bigint }) => user.discord_id === memberId);

            if (!checkGuild) {
                logger.debugSingle(`Member ${message.author.username} is not within the guild database`, "Handler");
                await updateGuild(guildId, memberId, message.author.username);
                logger.debugSingle(`Included ${message.author.username} to the database`, "Handler");
            } else {
                logger.debugSingle(`Member ${message.author.username} is already within the guild database`, "Handler");
            }
            return;
        }

        logger.warnSingle(`Guild ${guildId} is not within the database`, "Handler");
        await createGuild(guildId);
        return;
    }
});

client.on(GatewayDispatchEvents.GuildMemberAdd, async ({ data: member }) => {
    if (member.user?.bot) return;

    if (member.user === undefined) {
        logger.warnSingle("Member is undefined", "Handler");
        return;
    }

    onGuild(false, member.user, member);
});

client.on(GatewayDispatchEvents.GuildMemberRemove, async ({ data: member }) => {
    if (member.user?.bot) return;

    if (member.user === undefined) {
        logger.warnSingle("Member is undefined", "Handler");
        return;
    }

    onGuild(true, member.user, member);
});

async function checkRedis(redisKey: string, command: any, memberID: string): Promise<number> {
    if (await redis.exists(redisKey)) {
        logger.debugSingle(`${redisKey} already exists in Redis`, "Handler");
        return 1;
    }

    if (command.cooldown) {
        logger.debugSingle(`Adding ${redisKey} to REDIS with expiration: ${command.cooldown}`, "Handler");
        redis.set(redisKey, memberID);
        redis.expire(redisKey, command.cooldown);
    }

    return 0;
}

async function onGuild(isLeft: boolean, user: APIUser, member: any): Promise<void> {
    const memberId = BigInt(user.id);
    const inDatabase = await fetchUser(memberId);

    if (inDatabase) {
        logger.debugSingle(`Member ${user.username} is already in the database`, "Handler");
        const guildId = BigInt(member.guild_id);

        const guildData = await fetchGuild(guildId, memberId);
        const checkGuild = guildData.users.some((user: { discord_id: bigint }) => user.discord_id === memberId);

        if (checkGuild) {
            logger.debugSingle(`Member ${user.username} is within the guild database`, "Handler");
            isLeft
                ? await removeFromGuild(memberId, guildId)
                : await updateGuild(guildId, memberId, member.user.username);
            logger.debugSingle(`Removed ${user.username} from the database`, "Handler");
        } else {
            logger.debugSingle(`Member ${user.username} is not within the guild database`, "Handler");
        }
    }
}
