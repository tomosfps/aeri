import { SectionBuilder, ThumbnailBuilder, bold, inlineCode } from "@discordjs/builders";
import type { ChatInputCommand, SelectMenu } from "../../services/commands.js";
import { getUserAvatar } from "../../utility/formatUtils.js";

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
        const selectedCategory = interaction.menuValues[0];
        const container = interaction.getContainer();

        if (!selectedCategory) {
            container.updateComponent("error", "No category selected.");
            await interaction.replyContainer(true);
            return;
        }

        const allCommands = interaction.client.commands;
        const maxLength = Math.max(
            0,
            ...Array.from(allCommands.values()).map((command: any) => command.data.name.length),
        );

        const commandsForCategory = Array.from(allCommands.values()).filter(
            (command: ChatInputCommand) => command.data.category === selectedCategory,
        );

        const commandListString = commandsForCategory
            .map(
                (command: any) =>
                    `${bold(inlineCode(`/${command.data.name.padEnd(maxLength)} :`))} ${command.data.description}`,
            )
            .join("\n");

        const getBotAvatar = getUserAvatar(interaction.client.bot.id, interaction.client.bot.avatar);

        let newContent = "## 📚 Help Commands\nSelect a category from the dropdown below to view commands.\n\n";
        if (commandsForCategory.length > 0) {
            newContent += `### ${selectedCategory} Commands\n${commandListString}`;
        } else {
            newContent += `### ${selectedCategory} Commands\nNo commands found in this category.`;
        }

        const updatedSection = new SectionBuilder()
            .addTextDisplayComponents((builder) => builder.setContent(newContent))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(getBotAvatar));

        container.setComponent("section", [updatedSection]);
        await interaction.updateContainer();
    },
};
