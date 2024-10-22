import { SlashCommandBuilder } from "@discordjs/builders";
import type { Command } from "../../services/commands.js";
//import { ApplicationCommandOptionType } from "discord-api-types/v10";
//import { getCommandOption } from "../../utility/interactionUtils.js";

export const interaction: Command = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Setup your anilist account!")
        .addStringOption((option) =>
            option.setName("username").setDescription("Your anilist username").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        //const username = getCommandOption("language", ApplicationCommandOptionType.String, interaction.options);
        await interaction.reply({ content: "Pong!" });
    },
};
