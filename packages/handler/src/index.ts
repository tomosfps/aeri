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

client.on(GatewayDispatchEvents.MessageCreate, async ({ data: message, api }) => {
    if (message.author.bot) return;

    if (message.guild_id) {
        const guild = await api.guilds.get(message.guild_id, { with_counts: true });
        logger.infoSingle(
            `Received message from author: ${message.author.id} in guild ${guild.name}: ${message.content}`,
            "Handler",
        );
    } else {
        logger.warn(`Message received without guild_id from author: ${message.author.id}`, "Handler");
    }
});

client.on(GatewayDispatchEvents.GuildCreate, async ({ data: guild }) => {
    logger.infoSingle(`Joined guild: ${guild.name}`, "Handler");
});

client.on(GatewayDispatchEvents.GuildDelete, async ({ data: guild }) => {
    logger.infoSingle(`Left guild: ${guild.id}`, "Handler");
});
