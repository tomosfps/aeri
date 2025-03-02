import {
    type SlashCommandAttachmentOption,
    type SlashCommandBooleanOption,
    SlashCommandBuilder as SlashCommandBuilderOriginal,
    type SlashCommandChannelOption,
    type SlashCommandIntegerOption,
    type SlashCommandMentionableOption,
    type SlashCommandNumberOption,
    type SlashCommandRoleOption,
    type SlashCommandStringOption,
    type SlashCommandUserOption,
} from "@discordjs/builders";

export class SlashCommandBuilder extends SlashCommandBuilderOriginal {
    cooldown = 0;
    category = "";
    examples: string[] = [];
    owner_only = false;

    setCooldown(cooldown: number): this {
        this.cooldown = cooldown;
        return this;
    }

    setCategory(category: string): this {
        this.category = category;
        return this;
    }

    addExample(example_string: string): this {
        this.examples.push(example_string);
        return this;
    }

    setOwnerOnly(owner_only: boolean): this {
        this.owner_only = owner_only;
        return this;
    }

    override addBooleanOption(
        input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption),
    ) {
        super.addBooleanOption(input);
        return this;
    }

    override addUserOption(
        input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption),
    ) {
        super.addUserOption(input);
        return this;
    }

    override addChannelOption(
        input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption),
    ) {
        super.addChannelOption(input);
        return this;
    }

    override addRoleOption(
        input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption),
    ) {
        super.addRoleOption(input);
        return this;
    }

    override addAttachmentOption(
        input: SlashCommandAttachmentOption | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption),
    ) {
        super.addAttachmentOption(input);
        return this;
    }

    override addMentionableOption(
        input:
            | SlashCommandMentionableOption
            | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption),
    ) {
        super.addMentionableOption(input);
        return this;
    }

    override addStringOption(
        input: SlashCommandStringOption | ((builder: SlashCommandStringOption) => SlashCommandStringOption),
    ) {
        super.addStringOption(input);
        return this;
    }

    override addIntegerOption(
        input: SlashCommandIntegerOption | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption),
    ) {
        super.addIntegerOption(input);
        return this;
    }

    override addNumberOption(
        input: SlashCommandNumberOption | ((builder: SlashCommandNumberOption) => SlashCommandNumberOption),
    ) {
        super.addNumberOption(input);
        return this;
    }
}
