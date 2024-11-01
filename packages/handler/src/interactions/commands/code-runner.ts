import {
    ActionRowBuilder,
    type ModalActionRowComponentBuilder,
    ModalBuilder,
    SlashCommandBuilder,
    TextInputBuilder,
} from "@discordjs/builders";
import { TextInputStyle } from "@discordjs/core";
import { env } from "core";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import type { Command } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

type Runtime = {
    language: string;
    version: string;
    aliases: string[];
    runtime: string;
};
const logger = new Logger();

const languages = Array.from([
    { name: "Bash", value: "bash" },
    { name: "Brainfuck", value: "bf" },
    { name: "C", value: "c" },
    { name: "C++", value: "cpp" },
    { name: "C#", value: "cs" },
    { name: "Elixir", value: "elixir" },
    { name: "Erlang", value: "erl" },
    { name: "F#", value: "fs" },
    { name: "Go", value: "go" },
    { name: "Haskell", value: "hs" },
    { name: "Java", value: "java" },
    { name: "JavaScript", value: "js" },
    { name: "Kotlin", value: "kt" },
    { name: "LLVM IR", value: "llvm" },
    { name: "Lua", value: "lua" },
    { name: "NASM", value: "nasm" },
    { name: "NASM64", value: "nasm64" },
    { name: "Powershell", value: "ps" },
    { name: "Python", value: "py" },
    { name: "Rust", value: "rs" },
    { name: "Swift", value: "swift" },
    { name: "TypeScript", value: "ts" },
    { name: "Zig", value: "zig" },
]);

const runtimes = (await (await fetch(`${env.PISTON_URL}/runtimes`)).json()) as Runtime[];
logger.info("Loaded runtimes", "Piston", runtimes);

export const interaction: Command = {
    data: new SlashCommandBuilder()
        .setName("code-runner")
        .setDescription("Run code in a variety of languages")
        .addStringOption((option) =>
            option
                .setName("language")
                .setDescription("The language to run the code in")
                .setRequired(true)
                .addChoices(languages),
        ),
    async execute(interaction): Promise<void> {
        const languageOption = getCommandOption("language", ApplicationCommandOptionType.String, interaction.options);

        if (!languageOption || !languages.some((lang) => lang.value === languageOption))
            return await interaction.reply({ content: "Invalid Language", ephemeral: true });

        const runtime = runtimes.find((runtime) => runtime.aliases.includes(languageOption));

        if (!runtime) {
            logger.warn(`No runtime found for ${languageOption}`, "Piston", runtimes);
            return await interaction.reply({ content: "Problem finding runtime", ephemeral: true });
        }

        const codeInput = new TextInputBuilder()
            .setCustomId("coderunner-code")
            .setPlaceholder("console.log('Hello, World!')")
            .setMinLength(3)
            .setLabel("Code")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(codeInput);

        const modal = new ModalBuilder()
            .setCustomId(`coderunner-modal:${languageOption}:${runtime.version}`)
            .setTitle("Code input")
            .addComponents(row);

        await interaction.deployModal(modal);
    },
};
