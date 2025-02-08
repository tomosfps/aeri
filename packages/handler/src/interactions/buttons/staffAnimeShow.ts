import { EmbedBuilder } from "@discordjs/builders";
import { fetchAnilistStaff } from "anilist";
import { Logger } from "logger";
import type { Button } from "../../services/commands.js";

const logger = new Logger();

type ButtonData = {
    staffName: string;
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "staffAnimeShow",
    toggable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid button data");
        }
        return { staffName: data[0], userId: data[1] };
    },
    async execute(interaction, data): Promise<void> {
        const staffName = data.staffName;

        const staff = await fetchAnilistStaff(staffName, "ANIME").catch((error: any) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (staff === null) {
            return interaction.reply({ content: "No staff member found", ephemeral: true });
        }

        const footer = `${staff.result.dataFrom === "API" ? "Data from Anilist API" : `Displaying cached data : refreshes in ${interaction.format_seconds(staff.result.leftUntilExpire)}`}`;
        const description = staff.description + staff.animeDescription;

        const embed = new EmbedBuilder()
            .setTitle(staff.result.fullName)
            .setURL(staff.result.url)
            .setThumbnail(staff.result.image)
            .setDescription(description)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        await interaction.edit({
            embeds: [embed],
        });
    },
};
