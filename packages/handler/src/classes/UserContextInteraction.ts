import type { API, APIUser, APIUserApplicationCommandInteraction } from "@discordjs/core";
import { BaseInteraction } from "./BaseInteraction.js";
import type { HandlerClient } from "./HandlerClient.js";

export type UserContextHandler = (
    interaction: UserContextInteraction,
    api: API,
    client: HandlerClient,
) => Promise<void>;

export class UserContextInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIUserApplicationCommandInteraction,
        api: API,
        client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get data() {
        return this.interaction.data;
    }

    get name() {
        return this.interaction.data.name;
    }

    get targetID() {
        return this.interaction.data.target_id;
    }

    get target() {
        return this.data.resolved.users[this.targetID] as APIUser;
    }
}
