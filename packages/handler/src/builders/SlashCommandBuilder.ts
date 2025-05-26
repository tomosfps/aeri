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
    type SlashCommandSubcommandBuilder,
    type SlashCommandSubcommandsOnlyBuilder,
    type SlashCommandUserOption,
} from "@discordjs/builders";

export class SlashCommandBuilder extends SlashCommandBuilderOriginal {
    cooldown = 0;
    category = "";
    comment = "";
    examples: string[] = [];
    ownerOnly = false;

    setCooldown(cooldown: number): this {
        this.cooldown = cooldown;
        return this;
    }

    setComment(comment: string): this {
        this.comment = comment;
        return this;
    }

    setCategory(category: string): this {
        this.category = category;
        return this;
    }

    addExample(exampleString: string): this {
        this.examples.push(exampleString);
        return this;
    }

    setOwnerOnly(ownerOnly: boolean): this {
        this.ownerOnly = ownerOnly;
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

    override addSubcommand(
        input:
            | SlashCommandSubcommandBuilder
            | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder),
    ): SlashCommandSubcommandsOnlyBuilder {
        super.addSubcommand(input);
        return this;
    }
}
