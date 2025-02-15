import { Client, type ClientOptions } from "@discordjs/core";
import type { Button, MessageContext, Modal, SelectMenu } from "../services/commands.js";
import type { Command } from "./slashCommandBuilder.js";

export interface HandlerClientOptions extends ClientOptions {
    commands: Map<string, Command>;
    buttons: Map<string, Button>;
    modals: Map<string, Modal>;
    selectMenus: Map<string, SelectMenu>;
    messageContext: Map<string, MessageContext>;
}

export class HandlerClient extends Client {
    public commands: Map<string, Command>;
    public buttons: Map<string, Button>;
    public modals: Map<string, Modal>;
    public selectMenus: Map<string, SelectMenu>;
    public messageContext: Map<string, MessageContext>;

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
