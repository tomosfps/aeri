import { type API, GatewayDispatchEvents as Events } from "@discordjs/core";
import { Logger } from "logger";
import { ChatInputInteraction } from "../classes/chatInputCommandInteraction.js";
import type { HandlerClient } from "../classes/handlerClient.js";
import { MessageContextInteraction } from "../classes/messageContextInteraction.js";
import { ModalInteraction } from "../classes/modalInteraction.js";
import { SelectMenuInteraction } from "../classes/selectMenuInteraction.js";
import { UserContextInteraction } from "../classes/userContextInteraction.js";
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
    const transformedInteraction = interactionTransformer(interaction, api, client);
    interactionHandlers[type](transformedInteraction, api, client);
});

const interactionTransformer = (interaction: any, api: API, client: HandlerClient) => {
    const type = determineInteractionType(interaction);

    switch (type) {
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
            return new ChatInputInteraction(interaction, api, client);
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
