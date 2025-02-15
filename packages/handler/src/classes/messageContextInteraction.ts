import type { API } from "@discordjs/core";
import type { APIContextMenuInteraction } from "discord-api-types/v10";
import { BaseInteraction } from "./baseInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

export type MessageContextHandler = (
    interaction: APIContextMenuInteraction,
    api: API,
    client: HandlerClient,
) => Promise<void>;

export class MessageContextInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIContextMenuInteraction,
        api: API,
        client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get commandName() {
        return this.interaction.data.name;
    }

    get targetId() {
        return this.interaction.data.target_id;
    }
}
