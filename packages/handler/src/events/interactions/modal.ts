import { Logger } from "log";
import { type ModalHandler, ModalInteraction } from "../../classes/modalInteraction.js";

const logger = new Logger();

export const handler: ModalHandler = async (interaction, api, client) => {
    logger.debugSingle(`Received modal interaction: ${interaction.data.custom_id}`, "Handler");

    const [modalId, ...data] = interaction.data.custom_id.split(":") as [string, ...string[]];
    const modal = client.modals.get(modalId);

    if (!modal) {
        logger.warn(`Modal not found: ${modalId}`, "Handler");
        return;
    }

    try {
        logger.infoSingle(`Executing modal: ${modalId}`, "Handler");
        modal.execute(new ModalInteraction(interaction, api, client), modal.parse?.(data));
    } catch (error: any) {
        logger.error("Modal execution error:", "Handler", error);
    }
};
