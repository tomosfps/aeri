import { EmbedBuilder, inlineCode } from "@discordjs/builders";
import type { ChatInputCommand, SelectMenu } from "../../services/commands.js";

type SelectMenuData = {
    userID: string;
};

export const interaction: SelectMenu<SelectMenuData> = {
    data: { custom_id: "help" },
    parse(data) {
        if (!data[0]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { userID: data[0] };
    },
    async execute(interaction, _data): Promise<void> {
        const category = interaction.menuValues[0];
        const categoryMaxLength = Math.max(
            ...Array.from(interaction.client.commands.values()).map((command: any) => command.data.category.length),
        );
        const commands = Array.from(interaction.client.commands.values()).filter(
            (command: ChatInputCommand) => command.data.category === category,
        );
        const maxLength = Math.max(...commands.map((command: any) => command.data.name.length));

        const commandNames = Array.from(commands.values())
            .map(
                (command: any) =>
                    `${inlineCode(`${command.data.name.padEnd(maxLength)} :`)} ${command.data.description}`,
            )
            .join("\n");
        const embed = new EmbedBuilder()
            .setTitle(inlineCode(` ${category} commands `.padEnd(categoryMaxLength).padStart(categoryMaxLength + 3)))
            .setDescription(commandNames)
            .setColor(interaction.baseColour);

        await interaction.updateMessage({ embeds: [embed] });
    },
};
