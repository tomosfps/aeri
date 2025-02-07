import { EmbedBuilder } from "@discordjs/builders";
import { fetchAnilistCharacter } from "anilist";
import { Logger } from "log";
import type { Button } from "../../services/commands.js";

const logger = new Logger();

type ButtonData = {
    characterName: string;
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "characterAnimeShow",
    toggable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid button data");
        }
        return { characterName: data[0], userId: data[1] };
    },
    async execute(interaction, data): Promise<void> {
        const characterName = data.characterName;
        const character = await fetchAnilistCharacter(characterName).catch((error: any) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (character === null) {
            return interaction.reply({
                content: `Could not find ${characterName} within the Anilist API`,
                ephemeral: true,
            });
        }

        const footer = `${character.result.dataFrom === "API" ? "Data from Anilist API" : `Displaying cached data : refreshes in ${interaction.format_seconds(character.result.leftUntilExpire)}`}`;
        const description = character.description + character.animeDescription;

        const embed = new EmbedBuilder()
            .setTitle(character.result.fullName)
            .setURL(character.result.url)
            .setDescription(description)
            .setThumbnail(character.result.image)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        await interaction.edit({
            embeds: [embed],
        });
    },
};
