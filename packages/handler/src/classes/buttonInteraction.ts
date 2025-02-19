import type { API, APIMessageComponentButtonInteraction } from "@discordjs/core";
import { MessageComponentInteraction } from "./messageComponentInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

export type ButtonHandler = (interaction: ButtonInteraction, api: API, client: HandlerClient) => Promise<void>;

export class ButtonInteraction extends MessageComponentInteraction {
    constructor(
        public override interaction: APIMessageComponentButtonInteraction,
        api: API,
        client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get data() {
        return this.interaction.data;
    }

    get embed_data() {
        return this.interaction.message.embeds[0];
    }
}
