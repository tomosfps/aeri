import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import type { AutoCompleteCommand } from "../../services/commands.js";

const logger = new Logger();

export const interaction: AutoCompleteCommand<string> = {
    custom_id: "update-anime",
    async execute(interaction) {
        logger.info("Existing options", "Autocomplete", interaction.options);

        if (!interaction.options || interaction.options.length === 0) {
            await interaction.reply({
                content: "No data options provided",
                ephemeral: true,
            });
        }

        const dataOption = interaction.options.find((option) => option.name === "name");
        if (!dataOption || !("value" in dataOption)) {
            return [{ name: "ERROR", value: "ERROR" }];
        }

        const { result, error } = await api.fetch(Routes.Relations, {
            media_name: dataOption.value as string,
            media_type: MediaType.Anime,
        });

        if (error || result === null) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });
            return [{ name: "ERROR", value: "ERROR" }];
        }

        return result.relations
            .slice(0, 25)
            .map((relation) => ({
                name: relation.romaji.slice(0, 100) || "No title available",
                value: String(relation.id),
            }))
            .filter((choice) => choice.name.length >= 1 && choice.name.length <= 100);
    },
};
