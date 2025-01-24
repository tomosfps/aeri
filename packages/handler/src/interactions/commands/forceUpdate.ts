import { SlashCommandBuilder } from "@discordjs/builders";
import { env } from "core";
import { fetchAnilistUser } from "database";
import { Logger } from "log";
import type { Command } from "../../services/commands.js";

const logger = new Logger();

export const interaction: Command = {
    cooldown: 600,
    data: new SlashCommandBuilder()
        .setName("force-update")
        .setDescription("Remove your scores from the cache so that they may be updated again!"),
    async execute(interaction): Promise<void> {
        const anilistUser = await fetchAnilistUser(interaction.member_id);
        const userID = anilistUser ? anilistUser.id : null;
        logger.debug(`User ID: ${userID}`, "Force-Update");

        if (!userID) {
            return interaction.reply({
                content:
                    "You must link your Anilist account to use this command. You can do so by using the `/setup` command.",
                ephemeral: true,
            });
        }

        const response = await fetch(`${env.API_URL}/expire-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: String(userID),
            }),
        }).catch((error) => {
            logger.error("Error when trying to remove cache", "Force-Update", error);
            return null;
        });

        if (!response) {
            logger.error("Request returned null", "Anilist");
            return interaction.reply({ content: "Problem trying to remove cache", ephemeral: true });
        }

        const result = await response.json().catch((error) => {
            logger.error("Error while parsing JSON data.", "Force-Update", error);
            return interaction.reply({ content: "Problem trying to remove cache", ephemeral: true });
        });

        if (!result) {
            return interaction.reply({ content: "Problem trying to remove cache", ephemeral: true });
        }

        if (result.status === "success") {
            return interaction.reply({ content: "Successfully removed your scores from the cache!", ephemeral: true });
        }

        logger.error("Error while trying to remove cache", "Force-Update", result);
        return interaction.reply({ content: "Problem trying to remove cache", ephemeral: true });
    },
};
