import type { API, APIMessageComponentSelectMenuInteraction } from "@discordjs/core";
import { BaseInteraction } from "./baseInteraction.js";

export class SelectMenuInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIMessageComponentSelectMenuInteraction,
        api: API,
    ) {
        super(interaction, api);
    }

    get custom_id() {
        return this.interaction.data.custom_id;
    }

    get menuValues() {
        return this.interaction.data.values.map((value) => {
            return value;
        });
    }
}
