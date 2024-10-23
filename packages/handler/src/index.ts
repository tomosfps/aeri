import {
    type API,
    type APIApplicationCommandAutocompleteInteraction,
    type APIChatInputApplicationCommandInteraction,
    type APIMessageApplicationCommandInteraction,
    type APIMessageComponentButtonInteraction,
    type APIMessageComponentSelectMenuInteraction,
    type APIUserApplicationCommandInteraction,
    Client,
    GatewayDispatchEvents,
} from "@discordjs/core";

import { REST } from "@discordjs/rest";
import { getRedis } from "core";
import { env } from "core/dist/env.js";
import { createGuild, fetchGuild, fetchUser, removeFromGuild, updateGuild } from "database";
import { Logger } from "log";
import { ButtonInteraction } from "./classes/buttonInteraction.js";
import { CommandInteraction } from "./classes/commandInteraction.js";
import { SelectMenuInteraction } from "./classes/selectMenuInteraction.js";
import { Gateway } from "./gateway.js";
import { FileType, load } from "./services/commands.js";
import { InteractType, determineInteractionType } from "./utility/interactionUtils.js";

const logger = new Logger();
export const commands = await load(FileType.Commands);
export const buttons = await load(FileType.Buttons);
export const selectMenus = await load(FileType.SelectMenus);
const redis = await getRedis();
const rest = new REST().setToken(env.DISCORD_TOKEN);
const gateway = new Gateway({ redis, env });
await gateway.connect();
const client = new Client({ rest, gateway });

const interactionHandlers: Record<InteractType, (interaction: any, api: API) => void> = {
    [InteractType.Autocomplete]: (interaction: APIApplicationCommandAutocompleteInteraction) => {
        logger.infoSingle(`Received autocomplete interaction: ${interaction.data.name}`, "Handler");
    },
    [InteractType.ChatInput]: (interaction: APIChatInputApplicationCommandInteraction, api) => {
        logger.debugSingle(`Received chat input interaction: ${interaction.data.name}`, "Handler");

        const command = commands.get(interaction.data.name);
        if (!command) {
            logger.warn(`Command not found: ${interaction.data.name}`, "Handler");
            return;
        }

        try {
            logger.infoSingle(`Executing command: ${command.data.name}`, "Handler");
            command.execute(new CommandInteraction(interaction, api));
        } catch (error: any) {
            logger.error("Command execution error:", "Handler", error);
        }
    },
    [InteractType.SelectMenu]: (interaction: APIMessageComponentSelectMenuInteraction, api) => {
        logger.debugSingle(`Received select menu interaction: ${interaction.data.custom_id}`, "Handler");
        const selectMenu = selectMenus.get(interaction.data.custom_id);

        if (!selectMenu) {
            logger.warn(`Select menu not found: ${interaction.data.custom_id}`, "Handler");
            return;
        }

        try {
            logger.infoSingle(`Executing select menu: ${selectMenu.custom_id}`, "Handler");
            selectMenu.execute(new SelectMenuInteraction(interaction, api));
        } catch (error: any) {
            logger.error("Select menu execution error:", "Handler", error);
        }
    },
    [InteractType.UserContext]: (interaction: APIUserApplicationCommandInteraction) => {
        logger.debugSingle(`Received user context interaction: ${interaction.data.name}`, "Handler");
    },
    [InteractType.MessageContext]: (interaction: APIMessageApplicationCommandInteraction) => {
        logger.debugSingle(`Received message context interaction: ${interaction.data.name}`, "Handler");
    },
    [InteractType.Button]: (interaction: APIMessageComponentButtonInteraction, api) => {
        logger.debugSingle(`Received button interaction: ${interaction.data.custom_id}`, "Handler");

        const button = buttons.get(interaction.data.custom_id);
        if (!button) {
            logger.warn(`Button not found: ${interaction.data.custom_id}`, "Handler");
            return;
        }

        try {
            logger.infoSingle(`Executing button: ${button.custom_id}`, "Handler");
            button.execute(new ButtonInteraction(interaction, api));
        } catch (error: any) {
            logger.error("Button execution error:", "Handler", error);
        }
    },
    [InteractType.Unknown]: (interaction: any) => {
        logger.warn(`Unknown interaction type: ${interaction.type}`, "Handler");
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
        logger.warn("Guild ID is undefined", "Handler");
        return;
    }

    if (!message.author) {
        logger.warn("Member is undefined", "Handler");
        return;
    }

    const memberId = BigInt(message.author.id);
    const guildId = BigInt(message.guild_id);

    if (guildId) {
        const inDatabase = await fetchUser(memberId);

        if (inDatabase) {
            logger.debugSingle(`Member ${message.author.username} is already in the database`, "Handler");

            const guildData = await fetchGuild(guildId, memberId);

            if (guildData === null) {
                logger.warnSingle(`Guild ${guildId} is not within the database`, "Handler");
                await createGuild(guildId);
                return;
            }
            const checkGuild = guildData.users.some((user: { discord_id: bigint }) => user.discord_id === memberId);

            if (!checkGuild) {
                logger.debugSingle(`Member ${message.author.username} is not within the guild database`, "Handler");
                await updateGuild(guildId, memberId, message.author.username);
                logger.debugSingle(`Included ${message.author.username} to the database`, "Handler");
            } else {
                logger.debugSingle(`Member ${message.author.username} is already within the guild database`, "Handler");
            }
        }
    }
});

client.on(GatewayDispatchEvents.GuildMemberAdd, async ({ data: member }) => {
    if (member.user?.bot) return;

    if (member.user === undefined) {
        logger.warn("Member is undefined", "Handler");
        return;
    }

    const memberId = BigInt(member.user.id);
    const inDatabase = await fetchUser(memberId);

    if (inDatabase) {
        logger.debugSingle(`Member ${member.user?.username} is already in the database`, "Handler");
        const guildId = BigInt(member.guild_id);

        const guildData = await fetchGuild(guildId, memberId);
        const checkGuild = guildData.users.some((user: { discord_id: bigint }) => user.discord_id === memberId);

        if (!checkGuild) {
            logger.debugSingle(`Member ${member.user?.username} is not within the guild database`, "Handler");
            await updateGuild(guildId, memberId, member.user.username);
            logger.debugSingle(`Included ${member.user?.username} from the database`, "Handler");
        } else {
            logger.debugSingle(`Member ${member.user?.username} is already within the guild database`, "Handler");
        }
    }
});

client.on(GatewayDispatchEvents.GuildMemberRemove, async ({ data: member }) => {
    if (member.user?.bot) return;

    if (member.user === undefined) {
        logger.warn("Member is undefined", "Handler");
        return;
    }

    const memberId = BigInt(member.user.id);
    const inDatabase = await fetchUser(memberId);

    if (inDatabase) {
        logger.debugSingle(`Member ${member.user?.username} is already in the database`, "Handler");
        const guildId = BigInt(member.guild_id);

        const guildData = await fetchGuild(guildId, memberId);
        const checkGuild = guildData.users.some((user: { discord_id: bigint }) => user.discord_id === memberId);

        if (checkGuild) {
            logger.debugSingle(`Member ${member.user?.username} is within the guild database`, "Handler");
            await removeFromGuild(memberId, guildId);
            logger.debugSingle(`Removed ${member.user?.username} from the database`, "Handler");
        } else {
            logger.debugSingle(`Member ${member.user?.username} is not within the guild database`, "Handler");
        }
    }
});
