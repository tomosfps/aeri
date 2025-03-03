import { GatewayDispatchEvents } from "discord-api-types/v10";

export function isUnwantedEvent(event: GatewayDispatchEvents): boolean {
    switch (event) {
        case GatewayDispatchEvents.GuildUpdate:
            return true;
        case GatewayDispatchEvents.GuildRoleCreate:
            return true;
        case GatewayDispatchEvents.GuildRoleUpdate:
            return true;
        case GatewayDispatchEvents.GuildRoleDelete:
            return true;
        case GatewayDispatchEvents.ChannelCreate:
            return true;
        case GatewayDispatchEvents.ChannelUpdate:
            return true;
        case GatewayDispatchEvents.ChannelDelete:
            return true;
        case GatewayDispatchEvents.ChannelPinsUpdate:
            return true;
        case GatewayDispatchEvents.ThreadCreate:
            return true;
        case GatewayDispatchEvents.ThreadUpdate:
            return true;
        case GatewayDispatchEvents.ThreadDelete:
            return true;
        case GatewayDispatchEvents.ThreadListSync:
            return true;
        case GatewayDispatchEvents.ThreadMemberUpdate:
            return true;
        case GatewayDispatchEvents.StageInstanceCreate:
            return true;
        case GatewayDispatchEvents.StageInstanceUpdate:
            return true;
        case GatewayDispatchEvents.StageInstanceDelete:
            return true;
        case GatewayDispatchEvents.GuildMemberUpdate:
            return true;
        case GatewayDispatchEvents.ThreadMembersUpdate:
            return true;
        // @ts-expect-error Undocumented event
        case "VOICE_CHANNEL_STATUS_UPDATE":
            return true;
        default:
            return false;
    }
}
