import {
    type API,
    type APIChatInputApplicationCommandInteraction,
    ApplicationCommandOptionType,
} from "@discordjs/core";
import { BaseInteraction } from "./BaseInteraction.js";
import type { HandlerClient } from "./HandlerClient.js";

export type ChatInputHandler = (interaction: ChatInputInteraction, api: API, client: HandlerClient) => Promise<void>;

export class ChatInputInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIChatInputApplicationCommandInteraction,
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

    get options() {
        return this.interaction.data.options;
    }

    get subcommand() {
        return (
            this.interaction.data.options?.filter(
                (option) => option.type === ApplicationCommandOptionType.Subcommand,
            )[0]?.name || null
        );
    }
}
