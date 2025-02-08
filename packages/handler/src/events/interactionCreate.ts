import { type API, GatewayDispatchEvents as Events } from "@discordjs/core";
import { Logger } from "logger";
import type { HandlerClient } from "../classes/handlerClient.js";
import { event } from "../services/events.js";
import { InteractType, determineInteractionType } from "../utility/interactionUtils.js";
import {
    autoCompleteHandler,
    buttonHandler,
    chatInputHandler,
    modalHandler,
    selectMenuHandler,
    userContextHandler,
} from "./interactions/index.js";

const logger = new Logger();

export default event(Events.InteractionCreate, async ({ data: interaction, api, client }) => {
    logger.debugSingle(`Received interaction: ${interaction.id}`, "Handler");
    const type = determineInteractionType(interaction);
    interactionHandlers[type](interaction, api, client);
});

const interactionHandlers: Record<InteractType, (interaction: any, api: API, client: HandlerClient) => void> = {
    [InteractType.Autocomplete]: autoCompleteHandler,
    [InteractType.ChatInput]: chatInputHandler,
    [InteractType.SelectMenu]: selectMenuHandler,
    [InteractType.Modal]: modalHandler,
    [InteractType.UserContext]: userContextHandler,
    [InteractType.MessageContext]: () => {
        logger.warnSingle("Message context interactions are not supported", "Handler");
    },
    [InteractType.Button]: buttonHandler,
    [InteractType.Unknown]: (interaction: any) => {
        logger.warnSingle(`Unknown interaction type: ${interaction.type}`, "Handler");
    },
};
