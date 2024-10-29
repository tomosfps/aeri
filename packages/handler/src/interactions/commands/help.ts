import { EmbedBuilder, SlashCommandBuilder, inlineCode } from "@discordjs/builders";
import { env } from "core";
import type { Command } from "../../services/commands.js";

export const interaction: Command = {
    data: new SlashCommandBuilder().setName("help").setDescription("View all available commands"),
    async execute(interaction): Promise<void> {
        const commands = await interaction.api.applicationCommands.getGlobalCommands(env.DISCORD_APPLICATION_ID);
        const maxLength = Math.max(...commands.map((command) => command.name.length));
        const commandNames = commands
            .map((command) => `${inlineCode(`${command.name.padEnd(maxLength)} :`)} ${command.description}`)
            .join("\n");
        const embed = new EmbedBuilder().setTitle("Commands").setDescription(commandNames).setColor(0x2f3136);
        await interaction.reply({ embeds: [embed] });
    },
};
