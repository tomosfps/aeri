import { readdir } from "node:fs/promises";
import { URL } from "node:url";
import type { ContextMenuCommandBuilder, SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { env } from "core";
import { type RESTPostAPIApplicationCommandsJSONBody as CommandData, Routes } from "discord-api-types/v10";
import { Logger } from "logger";
import type { AutoCompleteInteraction } from "../classes/autoCompleteInteraction.js";
import type { ButtonInteraction } from "../classes/buttonInteraction.js";
import type { ChatInputInteraction } from "../classes/chatInputCommandInteraction.js";
import type { MessageContextInteraction } from "../classes/messageContextInteraction.js";
import type { ModalInteraction } from "../classes/modalInteraction.js";
import type { SelectMenuInteraction } from "../classes/selectMenuInteraction.js";
import type { SlashCommandBuilder } from "../classes/slashCommandBuilder.js";
import type { UserContextInteraction } from "../classes/userContextInteraction.js";

export type BaseCommand = {
    data: {
        toJSON(): CommandData;
    };
    cooldown?: number;
    owner_only?: boolean;
};

export type BaseComponent = {
    custom_id: string;
    cooldown?: number;
    toggleable?: boolean;
    timeout: number;
};

export interface ChatInputCommand extends BaseCommand {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    execute: (interaction: ChatInputInteraction) => void;
}

export interface Button<T = undefined> extends BaseComponent {
    parse?: (data: string[]) => T;
    execute: (interaction: ButtonInteraction, data: T) => void;
}

export interface SelectMenu<T = undefined> extends BaseComponent {
    parse?: (data: string[]) => T;
    execute: (interaction: SelectMenuInteraction, data: T) => void;
}

export interface Modal<T = undefined> {
    custom_id: string;
    parse?: (data: string[]) => T;
    execute: (interaction: ModalInteraction, data: T) => void;
}

export interface MessageContextCommand extends BaseCommand {
    data: ContextMenuCommandBuilder;
    execute: (interaction: MessageContextInteraction) => void;
}

export interface UserContextCommand extends BaseCommand {
    data: ContextMenuCommandBuilder;
    execute: (interaction: UserContextInteraction) => void;
}

export interface AutoCompleteCommand {
    custom_id: string;
    execute: (interaction: AutoCompleteInteraction) => Promise<Array<{ name: any; value: any }>>;
}

const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
const logger = new Logger();

export async function deployCommands(commands: CommandData[]) {
    logger.infoSingle("Started deploying application (/) commands.", "Commands");

    try {
        await rest.put(Routes.applicationCommands(env.DISCORD_APPLICATION_ID), {
            body: commands,
        });

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
    Modals = "modals",
    MessageContext = "message-context",
    UserContext = "user-context",
    AutoComplete = "auto-complete",
}

export async function load<T = ChatInputCommand>(type: FileType.Commands): Promise<Map<string, T>>;
export async function load<T = Button>(type: FileType.Buttons): Promise<Map<string, T>>;
export async function load<T = SelectMenu>(type: FileType.SelectMenus): Promise<Map<string, T>>;
export async function load<T = Modal>(type: FileType.Modals): Promise<Map<string, T>>;
export async function load<T = MessageContextCommand>(type: FileType.MessageContext): Promise<Map<string, T>>;
export async function load<T = UserContextCommand>(type: FileType.UserContext): Promise<Map<string, T>>;
export async function load<T = AutoCompleteCommand>(type: FileType.AutoComplete): Promise<Map<string, T>>;
export async function load<T>(type: FileType): Promise<Map<string, T>> {
    logger.infoSingle(`Started loading ${type} (📝) files.`, "Files");

    const files = new Map<string, T>();
    const allFiles = await readdir(new URL(`../interactions/${type}/`, import.meta.url));

    if (!allFiles) {
        logger.error(`Failed to find ${type} (📝)`, "Files");
        throw new Error(`Failed to find ${type} (📝) ${type}`);
    }

    const jsFiles = allFiles.filter((file) => file.endsWith(".js"));

    for (const file of jsFiles) {
        try {
            const interaction = (await import(`../interactions/${type}/${file}`)).interaction;
            files.set(getName(interaction), interaction);
        } catch (error: any) {
            logger.error(`Failed to load ${type} (📝) file: ${file}`, "Files", error);
        }
    }

    logger.info(`Successfully imported ${type} (📝) files.`, "Files", {
        files: Array.from(files.keys()),
        count: files.size,
    });
    return files;
}

function getName(
    interaction:
        | AutoCompleteCommand
        | ChatInputCommand
        | Button
        | SelectMenu
        | Modal
        | MessageContextCommand
        | UserContextCommand,
): string {
    if ("data" in interaction) return interaction.data.name;
    return interaction.custom_id;
}
