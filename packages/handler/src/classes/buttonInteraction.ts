import type { API, APIMessageComponentButtonInteraction } from "@discordjs/core";
import { BaseInteraction } from "./baseInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

export type ButtonHandler = (interaction: ButtonInteraction, api: API, client: HandlerClient) => Promise<void>;

export class ButtonInteraction extends BaseInteraction {
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

    get custom_id() {
        return this.interaction.data.custom_id;
    }

    get embed_data() {
        return this.interaction.message.embeds[0];
    }

    get channel() {
        return this.interaction.channel;
    }

    get message() {
        return this.interaction.message;
    }
}
