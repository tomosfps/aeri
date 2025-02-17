import type { API, APIMessageComponentSelectMenuInteraction } from "@discordjs/core";
import { BaseInteraction } from "./baseInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

export type SelectMenuHandler = (interaction: SelectMenuInteraction, api: API, client: HandlerClient) => Promise<void>;

export class SelectMenuInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIMessageComponentSelectMenuInteraction,
        api: API,
        client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get data() {
        return this.interaction.data;
    }

    get channel() {
        return this.interaction.channel;
    }

    get message() {
        return this.interaction.message;
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
