import type { API } from "@discordjs/core";
import type { APIUser, APIUserApplicationCommandInteraction } from "discord-api-types/v10";
import { BaseInteraction } from "./baseInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

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

    get target() {
        return this.interaction.data.target_id;
    }

    get target_user() {
        return this.interaction.data.resolved.users[this.target] as APIUser;
    }
}
