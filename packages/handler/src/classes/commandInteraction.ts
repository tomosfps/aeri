import type { API, APIChatInputApplicationCommandInteraction } from "@discordjs/core";
import { BaseInteraction } from "./baseInteraction.js";
import type { HandlerClient } from "./handlerClient.js";

export type ChatInputHandler = (
    interaction: APIChatInputApplicationCommandInteraction,
    api: API,
    client: HandlerClient,
) => Promise<void>;

export class CommandInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIChatInputApplicationCommandInteraction,
        api: API,
        client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get name() {
        return this.interaction.data.name;
    }

    get options() {
        return this.interaction.data.options;
    }
}
