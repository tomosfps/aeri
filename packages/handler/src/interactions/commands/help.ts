import { EmbedBuilder, bold, inlineCode } from "@discordjs/builders";
import { ApplicationCommandOptionType } from "@discordjs/core";
import { Logger } from "log";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: Command = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("View all available commands")
        .addStringOption((option) => option.setName("command").setDescription("The command you want to view")),
    async execute(interaction): Promise<void> {
        const option = getCommandOption("command", ApplicationCommandOptionType.String, interaction.options);
        const commands = interaction.client.commands;
        const maxLength = Math.max(...Array.from(commands.values()).map((command) => command.data.name.length));

        logger.debug("Help command executed", "Commands", commands);

        if (option) {
            const command = commands.get(option);

            if (command) {
                const cooldownTimer = command.cooldown && command.cooldown > 1 ? `${command.cooldown} seconds` : "None";
                const commandOptions = command.data.options;
                let choiceDetails = "";
                const optionDetails = commandOptions
                    .map((option: any) => {
                        const opt = option.toJSON();
                        const details = `> ${inlineCode(opt.name)}    : ${opt.description} ${bold(opt.required ? "<Required>" : "<Optional>")}`;

                        if ("choices" in opt && opt.choices?.length > 0) {
                            choiceDetails += `> ${inlineCode(opt.name)}    :  ${opt.choices.map((choice: any) => `${choice.name}`).join(", ")}`;
                        }
                        return details;
                    })
                    .join("\n");

                const descriptionBuilder = [
                    `${inlineCode("name             :")} ${command.data.name}\n`,
                    `${inlineCode("cooldown         :")} ${cooldownTimer}\n`,
                    `${inlineCode("description      :")} ${command.data.description}\n\n`,
                    `${inlineCode("options          :")} \n${optionDetails}\n\n`,
                    `${inlineCode("choices          :")} \n${choiceDetails}\n`,
                ];

                if (choiceDetails === "") {
                    descriptionBuilder.pop();
                }

                const embed = new EmbedBuilder().setDescription(descriptionBuilder.join("")).setColor(0x2f3136);
                return await interaction.reply({ embeds: [embed] });
            }
            return await interaction.reply({ content: "Command not found", ephemeral: true });
        }

        const commandNames = Array.from(commands.values())
            .map((command) => `${inlineCode(`${command.data.name.padEnd(maxLength)} :`)} ${command.data.description}`)
            .join("\n");
        const embed = new EmbedBuilder().setTitle("Commands").setDescription(commandNames).setColor(0x2f3136);
        await interaction.reply({ embeds: [embed] });
    },
};
