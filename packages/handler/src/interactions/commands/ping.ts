import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";

export const interaction: Command = {
    data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong! (Used for testing)").addExample("/ping"),
    async execute(interaction): Promise<void> {
        await interaction.reply({ content: "Pong!" });
    },
};
