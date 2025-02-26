import { SlashCommandBuilder as SlashCommandBuilderOriginal } from "@discordjs/builders";

export class SlashCommandBuilder extends SlashCommandBuilderOriginal {
    examples: string[] = [];
    category = "";

    addCategory(category: string): this {
        this.category = category;
        return this;
    }

    addExample(example_string: string): this {
        this.examples.push(example_string);
        return this;
    }
}
