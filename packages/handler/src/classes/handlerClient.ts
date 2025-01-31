import { Client, type ClientOptions } from "@discordjs/core";
import type { Command, Button, Modal, SelectMenu } from "../services/commands.js";

export interface HandlerClientOptions extends ClientOptions {
    commands: Map<string, Command>;
    buttons: Map<string, Button>;
    modals: Map<string, Modal>;
    selectMenus: Map<string, SelectMenu>;
}

export class HandlerClient extends Client {
    public commands: Map<string, Command>;
    public buttons: Map<string, Button>;
    public modals: Map<string, Modal>;
    public selectMenus: Map<string, SelectMenu>;

    constructor(public options: HandlerClientOptions) {
        super(options);

        this.commands = options.commands;
        this.buttons = options.buttons;
        this.modals = options.modals;
        this.selectMenus = options.selectMenus;
    }
}
