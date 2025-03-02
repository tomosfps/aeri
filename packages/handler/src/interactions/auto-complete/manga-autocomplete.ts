import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import type { AutoCompleteCommand } from "../../services/commands.js";

const logger = new Logger();

export const interaction: AutoCompleteCommand<string> = {
    command: "update-manga",
    option: "name",
    async execute(_interaction, option) {
        if (!option.value) {
            return [{ name: "No results found...", value: "" }];
        }

        const { result, error } = await api.fetch(Routes.Relations, {
            media_name: option.value as string,
            media_type: MediaType.Manga,
        });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });
            return [{ name: "No results found...", value: "" }];
        }

        if (!result) {
            return [{ name: "No results found...", value: "" }];
        }

        return result.relations
            .map((relation) => ({
                name: relation.english || relation.romaji || relation.native || "",
                value: relation.id.toString(),
                similarity: relation.similarity,
            }))
            .filter((relation) => relation.name)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 25);
    },
};
