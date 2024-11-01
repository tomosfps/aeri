import { bold, codeBlock, inlineCode } from "@discordjs/builders";
import { env } from "core";
import { Logger } from "log";
import type { Modal } from "../../services/commands.js";

type ExecutionResult = {
    run: {
        stdout: string;
        stderr: string;
        code: number;
        output: string;
        message: string | null;
        status: string | null;
        cpu_time: number;
        wall_time: number;
    };
    language: string;
    version: string;
};

type ModalData = {
    language: string;
    version: string;
};

const logger = new Logger();

export const interaction: Modal<ModalData> = {
    custom_id: "coderunner-modal",
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid modal data");
        }

        return {
            language: data[0],
            version: data[1],
        };
    },
    async execute(interaction, data): Promise<void> {
        await interaction.defer();

        const code = interaction.getModalValue("coderunner-code")?.value;

        if (!code) {
            return await interaction.reply({ content: "Please input the code to run", ephemeral: true });
        }

        const response = (await fetch(`${env.PISTON_URL}/execute`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                language: data.language,
                version: data.version,
                files: [{ content: code }],
            }),
        }).catch((err) => {
            logger.error("Error contacting piston", "Piston", err);
            return interaction.reply({ content: "Problem running code", ephemeral: true });
        })) as Response;

        if (response.status !== 200) {
            logger.error("Error executing code", "Piston", response);
            return await interaction.reply({ content: "Problem running code", ephemeral: true });
        }

        const result = (await response.json().catch((err) => {
            logger.error("Error parsing response", "Piston", err);
            return interaction.reply({ content: "Problem running code", ephemeral: true });
        })) as ExecutionResult;

        if (result.run.code !== 0) {
            await interaction.followUp({
                content: `Error running code:\n${result.run.message ? `${inlineCode(result.run.message)}\n` : ""}\n${codeBlock(data.language, result.run.output)}\n\n${bold("Input:")}${codeBlock(data.language, code)}`,
            });
        } else {
            await interaction.followUp({
                content: `Code ran successfully:\n\n${bold("Output:")}${codeBlock(result.run.output)}\n\n${bold("Input:")}${codeBlock(data.language, code)}`,
            });
        }
    },
};
