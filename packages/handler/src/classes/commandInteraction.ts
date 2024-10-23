import type { API, APIChatInputApplicationCommandInteraction } from "@discordjs/core";
import { BaseInteraction } from "./baseInteraction.js";

export class CommandInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIChatInputApplicationCommandInteraction,
        api: API,
    ) {
        super(interaction, api);
    }

    get name() {
        return this.interaction.data.name;
    }

    get options() {
        return this.interaction.data.options;
    }
}
