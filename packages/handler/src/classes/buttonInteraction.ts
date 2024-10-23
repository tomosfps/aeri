import type { API, APIMessageComponentInteraction } from "@discordjs/core";
import { BaseInteraction } from "./baseInteraction.js";

export class ButtonInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIMessageComponentInteraction,
        api: API,
    ) {
        super(interaction, api);
    }

    get custom_id() {
        return this.interaction.data.custom_id;
    }

    get embed_data() {
        return this.interaction.message.embeds[0];
    }
}
