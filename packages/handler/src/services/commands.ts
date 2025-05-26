import { readdir } from "node:fs/promises";
import { URL } from "node:url";
import type { EmbedBuilder } from "@discordjs/builders";
import {
    type APIEmbed,
    type RESTPostAPIApplicationCommandsJSONBody,
    type RESTPutAPIApplicationCommandsResult,
    Routes,
} from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { env, getRedis } from "core";
import { Logger } from "logger";
import type { ContextMenuCommandBuilder } from "../builders/ContextMenuCommandBuilder.js";
import type { SlashCommandBuilder } from "../builders/SlashCommandBuilder.js";
import type { AutoCompleteInteraction } from "../classes/AutoCompleteInteraction.js";
import type { ButtonInteraction } from "../classes/ButtonInteraction.js";
import type { ChatInputInteraction } from "../classes/ChatInputCommandInteraction.js";
import type { MessageContextInteraction } from "../classes/MessageContextInteraction.js";
import type { SelectMenuInteraction } from "../classes/SelectMenuInteraction.js";
import type { UserContextInteraction } from "../classes/UserContextInteraction.js";
import type { PaginationSupportedInteraction } from "../utility/paginationUtils.js";

const redis = await getRedis();

export interface BaseCommand {
    data: {
        toJSON(): RESTPostAPIApplicationCommandsJSONBody;
    };
}

export type BaseComponent = {
    custom_id: string;
    cooldown?: number;
    pageLimit?: number;
    toggleable?: boolean;
};

export interface PaginatedCommand<T extends PaginationSupportedInteraction> {
    pageLimit: number;
    page: (
        pageNumber: number,
        interaction: T | ButtonInteraction,
    ) => Promise<{ embeds: Array<EmbedBuilder | APIEmbed> }>;
}

export interface ChatInputCommand extends BaseCommand {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputInteraction) => void;
}

export type PaginatedChatInputCommand = ChatInputCommand & PaginatedCommand<ChatInputInteraction>;

export interface Button<T = undefined> {
    data: BaseComponent;
    parse?: (data: string[]) => T;
    execute: (interaction: ButtonInteraction, data: T) => void;
}

export type PaginatedButton<T = undefined> = Button<T> & PaginatedCommand<ButtonInteraction>;

export interface SelectMenu<T = undefined> {
    data: BaseComponent;
    parse?: (data: string[]) => T;
    execute: (interaction: SelectMenuInteraction, data: T) => void;
}

export type PaginatedSelectMenu<T = undefined> = SelectMenu<T> & PaginatedCommand<SelectMenuInteraction>;
export interface MessageContextCommand extends BaseCommand {
    data: ContextMenuCommandBuilder;
    execute: (interaction: MessageContextInteraction) => void;
}

export type PaginatedMessageContextCommand = MessageContextCommand & PaginatedCommand<MessageContextInteraction>;

export interface UserContextCommand extends BaseCommand {
    data: ContextMenuCommandBuilder;
    execute: (interaction: UserContextInteraction) => void;
}

export type PaginatedUserContextCommand = UserContextCommand & PaginatedCommand<UserContextInteraction>;

export interface AutoCompleteCommand<T extends string | number = string | number> {
    command?: string;
    option: string;
    execute: (
        interaction: AutoCompleteInteraction | ButtonInteraction,
        option: { name: string; value: T extends string ? string : string | number },
    ) => Promise<{ name: string; value: T }[]>;
}

const rest = new REST().setToken(env.DISCORD_TOKEN);
const logger = new Logger();

export async function deployCommands(commands: RESTPostAPIApplicationCommandsJSONBody[]) {
    logger.infoSingle("Started deploying application (/) commands.", "Commands");

    try {
        const putApplicationCommands = (await rest.put(Routes.applicationCommands(env.DISCORD_APPLICATION_ID), {
            body: commands,
        })) as RESTPutAPIApplicationCommandsResult;

        for (const command of putApplicationCommands) {
            await redis.hset(`commands:${command.name}`, "id", command.id);
        }

        logger.infoSingle("Successfully deployed global application (/) commands.", "Commands");

        if (env.DISCORD_TEST_GUILD_ID) {
            await rest.put(Routes.applicationGuildCommands(env.DISCORD_APPLICATION_ID, env.DISCORD_TEST_GUILD_ID), {
                body: commands.map((command) => {
                    if ("description" in command) {
                        command.description = `GUILD VERSION - ${command.description}`;
                    }

                    return command;
                }),
            });
            logger.infoSingle("Successfully deployed guild application (/) commands.", "Commands");
        }
    } catch (error: any) {
        logger.error("Failed to deploy global application (/) commands.", "Commands", error);
    }
}

export enum FileType {
    Commands = "commands",
    Buttons = "buttons",
    SelectMenus = "select-menus",
    MessageContext = "message-context",
    UserContext = "user-context",
    AutoComplete = "auto-complete",
}

type InteractionUnion =
    | ChatInputCommand
    | Button
    | SelectMenu
    | MessageContextCommand
    | UserContextCommand
    | AutoCompleteCommand;

function isChatInputCommand(type: FileType, _interaction: InteractionUnion): _interaction is ChatInputCommand {
    return type === FileType.Commands;
}

export async function load<T = ChatInputCommand>(type: FileType.Commands): Promise<Map<string, T>>;
export async function load<T = Button>(type: FileType.Buttons): Promise<Map<string, T>>;
export async function load<T = SelectMenu>(type: FileType.SelectMenus): Promise<Map<string, T>>;
export async function load<T = MessageContextCommand>(type: FileType.MessageContext): Promise<Map<string, T>>;
export async function load<T = UserContextCommand>(type: FileType.UserContext): Promise<Map<string, T>>;
export async function load<T = AutoCompleteCommand>(type: FileType.AutoComplete): Promise<Map<string, T>>;
export async function load<T extends InteractionUnion>(type: FileType): Promise<Map<string, T>> {
    const files = new Map<string, T>();
    const allFiles = await readdir(new URL(`../interactions/${type}/`, import.meta.url));

    if (!allFiles) {
        logger.error(`Failed to find ${type} (📝)`, "Files");
        throw new Error(`Failed to find ${type} (📝) ${type}`);
    }

    const jsFiles = allFiles.filter((file) => file.endsWith(".js"));

    for (const file of jsFiles) {
        try {
            const interaction = (await import(`../interactions/${type}/${file}`)).interaction as T;
            files.set(getName(interaction), interaction);

            if (isChatInputCommand(type, interaction)) {
                if (interaction.data.ownerOnly) continue;

                await redis.hset(
                    "commands",
                    interaction.data.name,
                    JSON.stringify({
                        name: interaction.data.name,
                        description: interaction.data.description,
                        cooldown: interaction.data.cooldown,
                        category: interaction.data.category,
                        examples: interaction.data.examples,
                        options: interaction.data.options,
                    }),
                );
            }
        } catch (error: any) {
            logger.error(`Failed to load ${type} (📝) file: ${file}`, "Files", error);
        }
    }

    logger.info(`Successfully imported ${type} (📝) files.`, "Files", { count: files.size });
    return files;
}

function getName(interaction: InteractionUnion): string {
    if ("data" in interaction && "toJSON" in interaction.data) return interaction.data.toJSON().name;

    if ("option" in interaction) {
        return `${interaction.command || ""}:${interaction.option}`;
    }

    if ("custom_id" in interaction.data) {
        return interaction.data.custom_id || "";
    }

    throw new Error("Unable to determine interaction name");
}
