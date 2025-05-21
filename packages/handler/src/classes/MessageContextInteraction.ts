import type { API, APIMessage, APIMessageApplicationCommandInteraction } from "@discordjs/core";
import { BaseInteraction } from "./BaseInteraction.js";
import type { HandlerClient } from "./HandlerClient.js";

export type MessageContextHandler = (
    interaction: MessageContextInteraction,
    api: API,
    client: HandlerClient,
) => Promise<void>;

export class MessageContextInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIMessageApplicationCommandInteraction,
        api: API,
        client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get data() {
        return this.interaction.data;
    }

    get commandName() {
        return this.interaction.data.name;
    }

    get targetID() {
        return this.interaction.data.target_id;
    }

    get target() {
        return this.interaction.data.resolved.messages[this.targetID] as APIMessage;
    }
}
