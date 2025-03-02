import { Client, type ClientOptions } from "@discordjs/core";
import type { HandlerMetricsClient } from "metrics";
import type {
    AutoCompleteCommand,
    Button,
    ChatInputCommand,
    MessageContextCommand,
    Modal,
    SelectMenu,
    UserContextCommand,
} from "../services/commands.js";

export interface HandlerClientOptions extends ClientOptions {
    metricsClient: HandlerMetricsClient;
    commands: Map<string, ChatInputCommand>;
    buttons: Map<string, Button>;
    modals: Map<string, Modal>;
    selectMenus: Map<string, SelectMenu>;
    messageContextCommands: Map<string, MessageContextCommand>;
    userContextCommands: Map<string, UserContextCommand>;
    autoCompleteCommands: Map<string, AutoCompleteCommand>;
}

export class HandlerClient extends Client {
    public metricsClient: HandlerMetricsClient;
    public commands: Map<string, ChatInputCommand>;
    public buttons: Map<string, Button>;
    public modals: Map<string, Modal>;
    public selectMenus: Map<string, SelectMenu>;
    public messageContextCommands: Map<string, MessageContextCommand>;
    public userContextCommands: Map<string, UserContextCommand>;
    public autoCompleteCommands: Map<string, AutoCompleteCommand>;

    constructor(public options: HandlerClientOptions) {
        super({
            rest: options.rest,
            gateway: options.gateway,
        });

        this.metricsClient = options.metricsClient;
        this.commands = options.commands;
        this.buttons = options.buttons;
        this.modals = options.modals;
        this.selectMenus = options.selectMenus;
        this.messageContextCommands = options.messageContextCommands;
        this.userContextCommands = options.userContextCommands;
        this.autoCompleteCommands = options.autoCompleteCommands;
    }
}
