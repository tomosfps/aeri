import { SlashCommandBuilder } from "@discordjs/builders";
import { env } from "core";
import { createAnilistUser, fetchUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import type { Command } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: Command = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Setup your anilist account!")
        .addStringOption((option) =>
            option.setName("username").setDescription("Your anilist username").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        const username = getCommandOption("username", ApplicationCommandOptionType.String, interaction.options);
        const isInDatabase = await fetchUser(interaction.member_id);

        if (isInDatabase === null) {
            const request = await fetch(`${env.API_URL}/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: username,
            }).catch((error) => {
                logger.error("Error while fetching data from the API.", "Anilist", error);
                return null;
            });

            if (request === null) {
                return interaction.reply({
                    content: `Unable to find ${username} within the Anilist API. `,
                    ephemeral: true,
                });
            }

            const result = await request.json().catch((error) => {
                logger.error("Error while parsing JSON data.", "Anilist", error);
                return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
            });

            if (result.error) {
                logger.error("An Error Occured when trying to access the API", "Anilist", result);
                return interaction.reply({
                    content: `Unable to find ${username} within the Anilist API. `,
                    ephemeral: true,
                });
            }

            if (interaction.guild_id === undefined) {
                return interaction.reply({
                    content: "This command can only be used in a server.",
                    ephemeral: true,
                });
            }

            createAnilistUser(
                interaction.member_id,
                interaction.member_name,
                result.id,
                result.name,
                BigInt(interaction.guild_id),
            );

            return interaction.reply({
                content: `Successfully linked ${result.name} to your discord account.`,
                ephemeral: true,
            });
        }

        return interaction.reply({
            content:
                "You already have an anilist account linked to your discord account. Use /unlink to unlink your account.",
            ephemeral: true,
        });
    },
};
