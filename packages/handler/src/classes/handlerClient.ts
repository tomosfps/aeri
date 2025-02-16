import { Client, type ClientOptions } from "@discordjs/core";
import type { Button, ChatInputCommand, MessageContextCommand, Modal, SelectMenu } from "../services/commands.js";

export interface HandlerClientOptions extends ClientOptions {
    commands: Map<string, ChatInputCommand>;
    buttons: Map<string, Button>;
    modals: Map<string, Modal>;
    selectMenus: Map<string, SelectMenu>;
    messageContext: Map<string, MessageContextCommand>;
}

export class HandlerClient extends Client {
    public commands: Map<string, ChatInputCommand>;
    public buttons: Map<string, Button>;
    public modals: Map<string, Modal>;
    public selectMenus: Map<string, SelectMenu>;
    public messageContext: Map<string, MessageContextCommand>;

    constructor(public options: HandlerClientOptions) {
        super({
            rest: options.rest,
            gateway: options.gateway,
        });

        this.commands = options.commands;
        this.buttons = options.buttons;
        this.modals = options.modals;
        this.selectMenus = options.selectMenus;
        this.messageContext = options.messageContext;
    }
}
