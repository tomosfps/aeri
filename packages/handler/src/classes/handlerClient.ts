import { Client, type ClientOptions } from "@discordjs/core";
import type { Command } from "../services/commands.js";

export interface HandlerClientOptions extends ClientOptions {
    commands: Map<string, Command>;
}

export class HandlerClient extends Client {
    public commands: Map<string, Command>;

    constructor(public options: HandlerClientOptions) {
        super(options);

        this.commands = options.commands;
    }
}
