import {
    SlashCommandBuilder as SlashCommandBuilderOriginal,
    type SlashCommandOptionsOnlyBuilder,
} from "@discordjs/builders";
import type { CommandInteraction } from "./commandInteraction.js";

export class SlashCommandBuilder extends SlashCommandBuilderOriginal {
    examples: string[] = [];
    addExample(example_string: string): this {
        this.examples.push(example_string);
        return this;
    }
}

export interface Command {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    cooldown?: number;
    owner_only?: boolean;
    execute: (interaction: CommandInteraction) => void;
}
