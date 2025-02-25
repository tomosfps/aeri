import { EmbedBuilder, bold, codeBlock, inlineCode } from "@discordjs/builders";
import { ApplicationCommandOptionType } from "@discordjs/core";
import { formatSeconds } from "core";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("View all available commands")
        .addExample("/help")
        .addExample("/help command:anime")
        .addStringOption((option) => option.setName("command").setDescription("The command you want to view")),
    async execute(interaction): Promise<void> {
        const option = getCommandOption(
            "command",
            ApplicationCommandOptionType.String,
            interaction.options,
        )?.toLowerCase();

        const commands = interaction.client.commands;
        const maxLength = Math.max(...Array.from(commands.values()).map((command: any) => command.data.name.length));

        if (option) {
            const command = commands.get(option);

            if (command) {
                const cooldownTimer =
                    command.cooldown && command.cooldown > 1 ? formatSeconds(command.cooldown) : "No cooldown";
                const commandOptions = command.data.options;
                let choiceDetails = "";
                let exampleDetails = "";

                if ("examples" in command.data) {
                    exampleDetails += command.data.examples.map((example: string) => `${example}`).join("\n\n");
                }

                const optionDetails = commandOptions
                    .map((option: any) => {
                        const opt = option.toJSON();
                        const details = `> ${inlineCode(`${opt.name.padEnd(maxLength)}:`)} ${opt.description} ${bold(opt.required ? "<Required>" : "<Optional>")}`;

                        const maxOptionNameLength = Math.max(...commandOptions.map((opt: any) => opt.name.length));
                        if ("choices" in opt && opt.choices?.length > 0) {
                            choiceDetails += `> ${inlineCode(`${opt.name.padEnd(maxOptionNameLength)}:`)}    :  ${opt.choices.map((choice: any) => `${choice.name}`).join(", ")}`;
                        }
                        return details;
                    })
                    .join("\n");

                const descriptionBuilder = [
                    `${inlineCode("name             :")} ${command.data.name}\n`,
                    `${inlineCode("cooldown         :")} ${cooldownTimer}\n`,
                    `${inlineCode("description      :")} ${command.data.description}\n\n`,
                    `${inlineCode("options          :")} \n${optionDetails}\n\n`,
                    `${inlineCode("choices          :")} \n${choiceDetails}\n\n`,
                    `${inlineCode("examples         :")} \n${codeBlock("js", exampleDetails)}\n`,
                ];

                const filteredDescription = descriptionBuilder.filter((line) => {
                    return !(
                        /^\s*$/.test(line) ||
                        /null/.test(line) ||
                        /undefined/.test(line) ||
                        line.trim() === "" ||
                        line.includes(" \n\n\n") ||
                        line.includes("```js\n\n```")
                    );
                });

                const embed = new EmbedBuilder()
                    .setDescription(filteredDescription.join(""))
                    .setColor(interaction.base_colour);
                interaction.base_colour;
                return await interaction.reply({ embeds: [embed] });
            }
            return await interaction.reply({ content: "Command not found", ephemeral: true });
        }

        const commandNames = Array.from(commands.values())
            .map(
                (command: any) =>
                    `${inlineCode(`${command.data.name.padEnd(maxLength)} :`)} ${command.data.description}`,
            )
            .join("\n");
        const embed = new EmbedBuilder()
            .setTitle("Commands")
            .setDescription(commandNames)
            .setColor(interaction.base_colour);
        interaction.base_colour;
        await interaction.reply({ embeds: [embed] });
    },
};
