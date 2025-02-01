import {
    ActionRowBuilder,
    type ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
} from "@discordjs/builders";
import { TextInputStyle } from "@discordjs/core";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";

export const interaction: Command = {
    data: new SlashCommandBuilder().setName("testing-modal").setDescription("This is just a testing modal"),
    async execute(interaction): Promise<void> {
        const modal = new ModalBuilder().setCustomId("test-modal").setTitle("create Post");

        const titleInput = new TextInputBuilder()
            .setCustomId("test-modal-title")
            .setPlaceholder("Test PlaceHolder")
            .setLabel("Title")
            .setMinLength(3)
            .setMaxLength(32)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const titleRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput);

        modal.addComponents(titleRow);
        await interaction.deployModal(modal);
    },
};
