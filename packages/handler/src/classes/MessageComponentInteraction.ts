import type { API, APIMessageComponentInteraction } from "@discordjs/core";
import { BaseInteraction } from "./BaseInteraction.js";
import type { HandlerClient } from "./HandlerClient.js";

export class MessageComponentInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIMessageComponentInteraction,
        public override api: API,
        public override client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get customID() {
        return this.interaction.data.custom_id;
    }

    get channel() {
        return this.interaction.channel;
    }

    get message() {
        return this.interaction.message;
    }

    public async deferUpdate() {
        await this.api.interactions.deferMessageUpdate(this.id, this.token);
    }
}
