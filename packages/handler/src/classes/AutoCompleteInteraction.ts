import {
    type API,
    type APIApplicationCommandAutocompleteInteraction,
    type APIApplicationCommandInteractionDataIntegerOption,
    type APIApplicationCommandInteractionDataNumberOption,
    type APIApplicationCommandInteractionDataStringOption,
    ApplicationCommandOptionType,
} from "@discordjs/core";
import { BaseInteraction } from "./BaseInteraction.js";
import type { HandlerClient } from "./HandlerClient.js";

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

    get subcommandGroup() {
        return this.data.options?.[0]?.type === ApplicationCommandOptionType.SubcommandGroup
            ? this.data.options?.[0]?.name
            : null;
    }

    get subcommand() {
        const option = this.data.options?.[0];

        if (option?.type === ApplicationCommandOptionType.SubcommandGroup) {
            return option.options?.[0]?.name || null;
        }

        return option?.type === ApplicationCommandOptionType.Subcommand ? option.name : null;
    }

    get options() {
        const option = this.data.options?.[0];

        if (option?.type === ApplicationCommandOptionType.SubcommandGroup) {
            const subcommand = option.options?.[0];
            if (subcommand?.type === ApplicationCommandOptionType.Subcommand) {
                return subcommand.options as (
                    | APIApplicationCommandInteractionDataStringOption
                    | APIApplicationCommandInteractionDataNumberOption
                    | APIApplicationCommandInteractionDataIntegerOption
                )[];
            }
        }

        if (option?.type === ApplicationCommandOptionType.Subcommand) {
            return option.options as (
                | APIApplicationCommandInteractionDataStringOption
                | APIApplicationCommandInteractionDataNumberOption
                | APIApplicationCommandInteractionDataIntegerOption
            )[];
        }

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
