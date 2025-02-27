import { readdir } from "node:fs/promises";
import { URL } from "node:url";
import type { ContextMenuCommandBuilder, SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { env, getRedis } from "core";
import {
    type RESTPostAPIApplicationCommandsJSONBody as CommandData,
    type RESTPutAPIApplicationCommandsResult,
    Routes,
} from "discord-api-types/v10";
import { Logger } from "logger";
import type { AutoCompleteInteraction } from "../classes/autoCompleteInteraction.js";
import type { ButtonInteraction } from "../classes/buttonInteraction.js";
import type { ChatInputInteraction } from "../classes/chatInputCommandInteraction.js";
import type { MessageContextInteraction } from "../classes/messageContextInteraction.js";
import type { ModalInteraction } from "../classes/modalInteraction.js";
import type { SelectMenuInteraction } from "../classes/selectMenuInteraction.js";
import type { SlashCommandBuilder } from "../classes/slashCommandBuilder.js";
import type { UserContextInteraction } from "../classes/userContextInteraction.js";

const redis = await getRedis();

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

export interface AutoCompleteCommand<T extends string | number = string | number> {
    command?: string;
    option: string;
    execute: (
        interaction: AutoCompleteInteraction,
        option: { name: string; value: T extends string ? string : string | number },
    ) => Promise<{ name: string; value: T }[]>;
}

const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
const logger = new Logger();

export async function deployCommands(commands: CommandData[]) {
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
    Modals = "modals",
    MessageContext = "message-context",
    UserContext = "user-context",
    AutoComplete = "auto-complete",
}

type InteractionUnion =
    | ChatInputCommand
    | Button
    | SelectMenu
    | Modal
    | MessageContextCommand
    | UserContextCommand
    | AutoCompleteCommand;

export async function load<T = ChatInputCommand>(type: FileType.Commands): Promise<Map<string, T>>;
export async function load<T = Button>(type: FileType.Buttons): Promise<Map<string, T>>;
export async function load<T = SelectMenu>(type: FileType.SelectMenus): Promise<Map<string, T>>;
export async function load<T = Modal>(type: FileType.Modals): Promise<Map<string, T>>;
export async function load<T = MessageContextCommand>(type: FileType.MessageContext): Promise<Map<string, T>>;
export async function load<T = UserContextCommand>(type: FileType.UserContext): Promise<Map<string, T>>;
export async function load<T = AutoCompleteCommand>(type: FileType.AutoComplete): Promise<Map<string, T>>;
export async function load<T extends InteractionUnion>(type: FileType): Promise<Map<string, T>> {
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
            const interaction = (await import(`../interactions/${type}/${file}`)).interaction as T;
            files.set(getName(interaction), interaction);

            if ("data" in interaction) {
                if (!interaction.owner_only && type === FileType.Commands) {
                    const interactionData = interaction.data.toJSON();
                    const commandName = interactionData.name;

                    let description = "";
                    let category = "";
                    let examples: string[] = [];
                    let options: any[] = [];

                    if ("data" in interaction && interaction.data) {
                        if ("description" in interaction.data && typeof interaction.data.description === "string") {
                            description = interaction.data.description;
                        }

                        if ("category" in interaction.data && typeof interaction.data.category === "string") {
                            category = interaction.data.category;
                        }

                        if ("examples" in interaction.data && Array.isArray(interaction.data.examples)) {
                            examples = interaction.data.examples;
                        }

                        if ("options" in interaction.data && Array.isArray(interaction.data.options)) {
                            options = interaction.data.options;
                        }
                    }

                    const cooldown = interaction.cooldown || 0;
                    await redis.hset(
                        "commands",
                        commandName,
                        JSON.stringify({
                            commandName,
                            description,
                            cooldown,
                            category,
                            examples: JSON.stringify(examples),
                            options: JSON.stringify(options),
                        }),
                    );
                }
            }
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

function getName(interaction: InteractionUnion): string {
    if ("data" in interaction) return interaction.data.name;

    if ("option" in interaction) {
        return `${interaction.command || ""}:${interaction.option}`;
    }

    return interaction.custom_id;
}
