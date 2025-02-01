import type { API, APIMessageComponentSelectMenuInteraction } from "@discordjs/core";
import { BaseInteraction } from "./baseInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

export type SelectMenuHandler = (
    interaction: APIMessageComponentSelectMenuInteraction,
    api: API,
    client: HandlerClient,
) => Promise<void>;

export class SelectMenuInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIMessageComponentSelectMenuInteraction,
        api: API,
        client: HandlerClient,
    ) {
        super(interaction, api, client);
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
