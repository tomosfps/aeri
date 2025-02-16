import { SlashCommandBuilder as SlashCommandBuilderOriginal } from "@discordjs/builders";

export class SlashCommandBuilder extends SlashCommandBuilderOriginal {
    examples: string[] = [];
    addExample(example_string: string): this {
        this.examples.push(example_string);
        return this;
    }
}
