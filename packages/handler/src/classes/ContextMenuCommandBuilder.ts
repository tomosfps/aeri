import { ContextMenuCommandBuilder as ContextMenuCommandBuilderOriginal } from "@discordjs/builders";

export class ContextMenuCommandBuilder extends ContextMenuCommandBuilderOriginal {
    cooldown = 0;
    owner_only = false;

    setCooldown(cooldown: number): this {
        this.cooldown = cooldown;
        return this;
    }

    setOwnerOnly(owner_only: boolean): this {
        this.owner_only = owner_only;
        return this;
    }
}
