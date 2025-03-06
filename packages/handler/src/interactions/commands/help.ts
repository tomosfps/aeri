import {
    ActionRowBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    bold,
    codeBlock,
    formatEmoji,
    inlineCode,
} from "@discordjs/builders";
import { ApplicationCommandOptionType } from "@discordjs/core";
import { formatSeconds } from "core";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationIntegrationType } from "discord-api-types/v10";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("View all available commands")
        .addExample("/help")
        .addExample("/help command:anime")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option.setName("command").setDescription("The command you want to view").setRequired(false),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Show hidden commands").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
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
                const cooldownTimer = command.data.cooldown > 1 ? formatSeconds(command.data.cooldown) : "No cooldown";
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
                    `${formatEmoji("1344752820875825282")} ${inlineCode("name             :")} ${command.data.name}\n`,
                    `${formatEmoji("1344752908679516233")} ${inlineCode("cooldown         :")} ${cooldownTimer}\n`,
                    `${formatEmoji("1344752859702366311")} ${inlineCode("description      :")} ${command.data.description}\n\n`,
                    `${formatEmoji("1344752926308171859")} ${inlineCode("options          :")} \n${optionDetails}\n\n`,
                    `${formatEmoji("1344752808351498322")} ${inlineCode("choices          :")} \n${choiceDetails}\n\n`,
                    `${formatEmoji("1344752799317102593")} ${inlineCode("examples         :")} \n${codeBlock("js", exampleDetails)}\n`,
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
                return await interaction.reply({ embeds: [embed] });
            }
            return await interaction.reply({ content: "Command not found", ephemeral: true });
        }

        const uniqueCategories = new Set();
        const categoryOptions = Array.from(commands.values())
            .map((command: any) => {
                return {
                    label: command.data.category,
                    value: command.data.category,
                };
            })
            .filter((option) => {
                // Only keep the first occurrence of each category
                if (!uniqueCategories.has(option.value)) {
                    uniqueCategories.add(option.value);
                    return true;
                }
                return false;
            })
            .sort((a, b) => a.label.localeCompare(b.label));

        const select = new StringSelectMenuBuilder()
            .setCustomId(`help_selection:${interaction.user_id}`)
            .setPlaceholder("Choose A Category...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(categoryOptions);

        const row = new ActionRowBuilder().addComponents(select);
        await interaction.reply({ components: [row], ephemeral: hidden });
    },
};
