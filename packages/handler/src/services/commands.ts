import { readdir } from "node:fs/promises";
import { URL } from "node:url";
import { REST } from "@discordjs/rest";
import { env } from "core";
import { Routes } from "discord-api-types/v10";
import { Logger } from "log";
import type { ButtonInteraction } from "../classes/buttonInteraction.js";
import type { ModalInteraction } from "../classes/modalInteraction.js";
import type { SelectMenuInteraction } from "../classes/selectMenuInteraction.js";
import type { Command } from "../classes/slashCommandBuilder.js";

export interface Button<T = undefined> {
    custom_id: string;
    cooldown?: number;
    toggable?: boolean;
    parse?: (data: string[]) => T;
    execute: (interaction: ButtonInteraction, data: T) => void;
}

export interface SelectMenu<T = undefined> {
    custom_id: string;
    cooldown?: number;
    toggable?: boolean;
    parse?: (data: string[]) => T;
    execute: (interaction: SelectMenuInteraction, data: T) => void;
}

export interface Modal<T = undefined> {
    custom_id: string;
    parse?: (data: string[]) => T;
    execute: (interaction: ModalInteraction, data: T) => void;
}

const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
const logger = new Logger();

export async function deployCommands(commands: Map<string, Command>) {
    logger.infoSingle("Started deploying application (/) commands.", "Commands");

    try {
        await rest.put(Routes.applicationCommands(env.DISCORD_APPLICATION_ID), {
            body: Array.from(commands.values()).map((command) => command.data.toJSON()),
        });

        logger.infoSingle("Successfully deployed global application (/) commands.", "Commands");

        if (env.DISCORD_TEST_GUILD_ID) {
            await rest.put(Routes.applicationGuildCommands(env.DISCORD_APPLICATION_ID, env.DISCORD_TEST_GUILD_ID), {
                body: Array.from(commands.values()).map((command) => {
                    command.data.setDescription(`GUILD VERSION - ${command.data.description}`);
                    return command.data.toJSON();
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
}

export async function load<T = Command>(type: FileType.Commands): Promise<Map<string, T>>;
export async function load<T = Button>(type: FileType.Buttons): Promise<Map<string, T>>;
export async function load<T = SelectMenu>(type: FileType.SelectMenus): Promise<Map<string, T>>;
export async function load<T = Modal>(type: FileType.Modals): Promise<Map<string, T>>;
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

function getName(interaction: Command | Button | SelectMenu | Modal): string {
    if ("data" in interaction) return interaction.data.name;
    return interaction.custom_id;
}
