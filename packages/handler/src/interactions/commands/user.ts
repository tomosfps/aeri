import { EmbedBuilder } from "@discordjs/builders";
import { fetchAnilistUserData } from "anilist";
import { fetchAnilistUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: Command = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("View a user's anilist account")
        .addExample("/user")
        .addExample("/user username:anilist_username")
        .addStringOption((option) =>
            option.setName("username").setDescription("The targets anilist username").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        let username = getCommandOption("username", ApplicationCommandOptionType.String, interaction.options);

        if (username === null) {
            logger.debug("Attemping fetching user from database", "User");
            try {
                username = (await fetchAnilistUser(interaction.member_id)).username;
            } catch (error: any) {
                logger.error(`Error fetching user from database: ${error}`, "User");
                return interaction.reply({ content: "Please setup your account with /setup!", ephemeral: true });
            }
        }

        logger.debug(`Fetching user: ${username}`, "User");
        const userFetch = await fetchAnilistUserData(username, interaction);
        if (userFetch === null) {
            return interaction.reply({
                content: "User could not be found. Are you sure you have the correct username?",
                ephemeral: true,
            });
        }

        const footer = `${userFetch.result.dataFrom === "API" ? "Data from Anilist API" : `Displaying cached data : refreshes in ${interaction.format_seconds(userFetch.result.leftUntilExpire)}`}`;
        const embed = new EmbedBuilder()
            .setTitle(userFetch.result.name)
            .setURL(userFetch.result.url)
            .setDescription(userFetch.description)
            .setThumbnail(userFetch.result.avatar)
            .setImage(userFetch.result.banner)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        return interaction.reply({
            embeds: [embed],
        });
    },
};
