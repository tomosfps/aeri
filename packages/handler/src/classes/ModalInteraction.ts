import type { API, APIModalSubmitInteraction } from "@discordjs/core";
import { BaseInteraction } from "./BaseInteraction.js";
import type { HandlerClient } from "./HandlerClient.js";

export type ModalHandler = (interaction: APIModalSubmitInteraction, api: API, client: HandlerClient) => Promise<void>;

export class ModalInteraction extends BaseInteraction {
    constructor(
        public override interaction: APIModalSubmitInteraction,
        api: API,
        client: HandlerClient,
    ) {
        super(interaction, api, client);
    }

    get custom_id() {
        return this.interaction.data.custom_id;
    }

    get modalValues() {
        return this.interaction.data.components.map((component) => {
            const item = component.components[0];

            if (!item) {
                throw new Error("Invalid modal component");
            }

            return {
                custom_id: item.custom_id,
                value: item.value,
            };
        });
    }

    public getModalValue(custom_id: string) {
        return this.modalValues.find((value) => value.custom_id === custom_id);
    }
}
