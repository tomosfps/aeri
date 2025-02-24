import type { API } from "@discordjs/core";
import type {
    APIApplicationCommandAutocompleteInteraction,
    APIApplicationCommandInteractionDataIntegerOption,
    APIApplicationCommandInteractionDataNumberOption,
    APIApplicationCommandInteractionDataStringOption,
} from "discord-api-types/v10";
import { BaseInteraction } from "./baseInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

export type AutoCompleteHandler = (
    interaction: AutoCompleteInteraction,
    api: API,
    client: HandlerClient,
) => Promise<void>;

export class AutoCompleteInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIApplicationCommandAutocompleteInteraction,
        api: API,
        client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get data() {
        return this.interaction.data;
    }

    get options() {
        return this.data.options as (
            | APIApplicationCommandInteractionDataStringOption
            | APIApplicationCommandInteractionDataNumberOption
            | APIApplicationCommandInteractionDataIntegerOption
        )[];
    }

    public async respond(choices: { name: string; value: string | number }[]) {
        await this.api.interactions.createAutocompleteResponse(this.interaction.id, this.interaction.token, {
            choices,
        });
    }
}
