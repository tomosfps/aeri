import type { API, APIMessageComponentSelectMenuInteraction } from "@discordjs/core";
import { MessageComponentInteraction } from "./messageComponentInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

export type SelectMenuHandler = (interaction: SelectMenuInteraction, api: API, client: HandlerClient) => Promise<void>;

export class SelectMenuInteraction extends MessageComponentInteraction {
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

    get menuValues() {
        return this.interaction.data.values.map((value) => {
            return value;
        });
    }
}
