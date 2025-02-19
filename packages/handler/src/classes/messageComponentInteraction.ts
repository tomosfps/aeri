import type { API } from "@discordjs/core";
import type { APIMessageComponentInteraction } from "discord-api-types/v10";
import { BaseInteraction } from "./baseInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

export class MessageComponentInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIMessageComponentInteraction,
        public override api: API,
        public override client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get custom_id() {
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
