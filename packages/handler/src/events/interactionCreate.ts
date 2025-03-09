import { type API, GatewayDispatchEvents as Events } from "@discordjs/core";
import { Logger } from "logger";
import { AutoCompleteInteraction } from "../classes/AutoCompleteInteraction.js";
import { ButtonInteraction } from "../classes/ButtonInteraction.js";
import { ChatInputInteraction } from "../classes/ChatInputCommandInteraction.js";
import type { HandlerClient } from "../classes/HandlerClient.js";
import { MessageContextInteraction } from "../classes/MessageContextInteraction.js";
import { ModalInteraction } from "../classes/ModalInteraction.js";
import { SelectMenuInteraction } from "../classes/SelectMenuInteraction.js";
import { UserContextInteraction } from "../classes/UserContextInteraction.js";
import { event } from "../services/events.js";
import { InteractType, determineInteractionType } from "../utility/interactionUtils.js";
import {
    autoCompleteHandler,
    buttonHandler,
    chatInputHandler,
    messageContextHandler,
    modalHandler,
    selectMenuHandler,
    userContextHandler,
} from "./interactions/index.js";

const logger = new Logger();

export default event(Events.InteractionCreate, async ({ data: interaction, api, client }) => {
    logger.debugSingle(`Received interaction: ${interaction.id}`, "Handler");
    const type = determineInteractionType(interaction);
    const transformedInteraction = await interactionTransformer(interaction, api, client);
    interactionHandlers[type](transformedInteraction, api, client);
});

const interactionTransformer = async (interaction: any, api: API, client: HandlerClient) => {
    const type = determineInteractionType(interaction);
    client.metricsClient.interaction_types.inc({ type: type });

    switch (type) {
        case InteractType.Autocomplete:
            return new AutoCompleteInteraction(interaction, api, client);
        case InteractType.ChatInput:
            return new ChatInputInteraction(interaction, api, client);
        case InteractType.SelectMenu:
            return new SelectMenuInteraction(interaction, api, client);
        case InteractType.Modal:
            return new ModalInteraction(interaction, api, client);
        case InteractType.MessageContext:
            return new MessageContextInteraction(interaction, api, client);
        case InteractType.UserContext:
            return new UserContextInteraction(interaction, api, client);
        case InteractType.Button:
            return new ButtonInteraction(interaction, api, client);
        default:
            return interaction;
    }
};

const interactionHandlers: Record<InteractType, (interaction: any, api: API, client: HandlerClient) => void> = {
    [InteractType.Autocomplete]: autoCompleteHandler,
    [InteractType.ChatInput]: chatInputHandler,
    [InteractType.SelectMenu]: selectMenuHandler,
    [InteractType.Modal]: modalHandler,
    [InteractType.UserContext]: userContextHandler,
    [InteractType.MessageContext]: messageContextHandler,
    [InteractType.Button]: buttonHandler,
    [InteractType.Unknown]: (interaction: any) => {
        logger.warnSingle(`Unknown interaction type: ${interaction.type}`, "Handler");
    },
};
