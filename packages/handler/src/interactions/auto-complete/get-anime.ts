import { Logger } from "logger";
import type { AutoCompleteCommand } from "../../services/commands.js";

const logger = new Logger();
const results = Array.from({ length: 24 }, (_, i) => ({
    name: `id_${i}`,
    value: i
}));

export const interaction: AutoCompleteCommand = {
    custom_id: "update-media",
    async execute(interaction) {
        logger.info("Returning Data Options", "Data options", interaction.dataOptions);
        return results;
    },
};
