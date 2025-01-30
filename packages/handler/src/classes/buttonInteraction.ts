import type { API, APIMessageComponentInteraction } from "@discordjs/core";
import { BaseInteraction } from "./baseInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

export class ButtonInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIMessageComponentInteraction,
        api: API,
        client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get custom_id() {
        return this.interaction.data.custom_id;
    }

    get embed_data() {
        return this.interaction.message.embeds[0];
    }
}
