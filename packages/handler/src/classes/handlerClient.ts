import { Client } from "@discordjs/core";
import type { Command } from "../services/commands.js";

export class HandlerClient extends Client {
    commands: Map<string, Command> = new Map();
    constructor(public client: Client) {
        super(client);
    }

    get getCommands() {
        return this.commands;
    }

    get getCooldown() {
        return this.client;
    }
}
