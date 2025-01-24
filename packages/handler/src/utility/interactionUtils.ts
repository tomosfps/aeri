import { inlineCode } from "@discordjs/builders";
import {
    type APIApplicationCommandAutocompleteInteraction,
    type APIApplicationCommandInteractionDataBasicOption,
    type APIApplicationCommandInteractionDataOption,
    type APIApplicationCommandInteractionDataSubcommandOption,
    type APIChatInputApplicationCommandInteraction,
    type APIInteraction,
    type APIMessageApplicationCommandInteraction,
    type APIMessageComponentButtonInteraction,
    type APIMessageComponentSelectMenuInteraction,
    type APIModalSubmitInteraction,
    type APIUserApplicationCommandInteraction,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ComponentType,
    InteractionType,
    type Snowflake,
} from "@discordjs/core";
import { env } from "core";
import { fetchAllUsers } from "database";
import { Logger } from "log";

const logger = new Logger();

export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.Subcommand,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): APIApplicationCommandInteractionDataBasicOption[] | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.SubcommandGroup,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): APIApplicationCommandInteractionDataSubcommandOption[] | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.Number,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): number | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.Mentionable,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): Snowflake | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.Integer,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): number | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.Attachment,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): Snowflake | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.Role,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): Snowflake | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.User,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): Snowflake | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.Channel,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): Snowflake | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.Boolean,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): boolean | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType.String,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): string | null;
export function getCommandOption(
    name: string,
    type: ApplicationCommandOptionType,
    options?: APIApplicationCommandInteractionDataOption[] | undefined,
): any | null {
    if (!options) return null;

    const option = options.find((option) => option.name === name);

    if (option?.type !== type) return null;

    if (
        option.type === ApplicationCommandOptionType.Subcommand ||
        option.type === ApplicationCommandOptionType.SubcommandGroup
    )
        return option.options;
    return option.value;
}

export function isAutocompleteInteraction(
    interaction: APIInteraction,
): interaction is APIApplicationCommandAutocompleteInteraction {
    return interaction.type === InteractionType.ApplicationCommandAutocomplete;
}

export function isChatInputInteraction(
    interaction: APIInteraction,
): interaction is APIChatInputApplicationCommandInteraction {
    return (
        interaction.type === InteractionType.ApplicationCommand &&
        interaction.data.type === ApplicationCommandType.ChatInput
    );
}

export function isModalInteraction(interaction: APIInteraction): interaction is APIModalSubmitInteraction {
    return interaction.type === InteractionType.ModalSubmit;
}

export function isUserContextInteraction(
    interaction: APIInteraction,
): interaction is APIUserApplicationCommandInteraction {
    return (
        interaction.type === InteractionType.ApplicationCommand && interaction.data.type === ApplicationCommandType.User
    );
}

export function isMessageContextInteraction(
    interaction: APIInteraction,
): interaction is APIMessageApplicationCommandInteraction {
    return (
        interaction.type === InteractionType.ApplicationCommand &&
        interaction.data.type === ApplicationCommandType.Message
    );
}

export function isButtonInteraction(interaction: APIInteraction): interaction is APIMessageComponentButtonInteraction {
    return (
        interaction.type === InteractionType.MessageComponent &&
        interaction.data.component_type === ComponentType.Button
    );
}

export function isSelectMenuInteraction(
    interaction: APIInteraction,
): interaction is APIMessageComponentSelectMenuInteraction {
    return (
        interaction.type === InteractionType.MessageComponent &&
        (interaction.data.component_type === ComponentType.StringSelect ||
            interaction.data.component_type === ComponentType.UserSelect ||
            interaction.data.component_type === ComponentType.RoleSelect ||
            interaction.data.component_type === ComponentType.ChannelSelect ||
            interaction.data.component_type === ComponentType.MentionableSelect)
    );
}

export enum InteractType {
    Autocomplete = 0,
    ChatInput = 1,
    Modal = 2,
    UserContext = 3,
    MessageContext = 4,
    Button = 5,
    SelectMenu = 6,
    Unknown = 7,
}

export function determineInteractionType(interaction: APIInteraction): InteractType {
    if (isAutocompleteInteraction(interaction)) return InteractType.Autocomplete;
    if (isChatInputInteraction(interaction)) return InteractType.ChatInput;
    if (isModalInteraction(interaction)) return InteractType.Modal;
    if (isUserContextInteraction(interaction)) return InteractType.UserContext;
    if (isMessageContextInteraction(interaction)) return InteractType.MessageContext;
    if (isButtonInteraction(interaction)) return InteractType.Button;
    if (isSelectMenuInteraction(interaction)) return InteractType.SelectMenu;

    return InteractType.Unknown;
}

export function intervalTime(seconds: number, granularity = 2): string {
    const intervals: [string, number][] = [
        ["weeks", 604800],
        ["days", 86400],
        ["hours", 3600],
        ["minutes", 60],
        ["seconds", 1],
    ];

    const result: string[] = [];
    let secondsLeft = seconds;

    for (const [name, count] of intervals) {
        const value = Math.floor(secondsLeft / count);
        if (value) {
            secondsLeft -= value * count;
            let formattedName = name;
            if (value === 1) {
                formattedName = name.slice(0, -1); // Remove 's' for singular
            }
            result.push(`${value} ${formattedName}`);
        }
    }

    return result.slice(0, granularity).join(", ");
}

export async function fetchMedia(mediaType: string, mediaID: number, interaction: any): Promise<any> {
    const response = await fetch(`${env.API_URL}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            media_id: mediaID,
            media_type: mediaType,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return undefined;
    });

    if (response === null || response === undefined) {
        logger.error("Request returned null", "Anilist");
        return undefined;
    }

    const result = await response.json().catch((error) => {
        logger.error("Error while parsing JSON data.", "Anilist", error);
        return undefined;
    });

    if (result.error) {
        logger.error("An Error Occured when trying to access the API", "Anilist", result);
        return undefined;
    }

    const genresToShow = result.genres.slice(0, 3);
    const additionalGenresCount = result.genres.length - genresToShow.length;
    const genresDisplay =
        genresToShow.join(", ") + (additionalGenresCount > 0 ? ` + ${additionalGenresCount} more` : "");

    const currentEpisode = result.airing[0] ? result.airing[0].episode - 1 : null;
    const nextEpisode = result.airing[0] ? intervalTime(result.airing[0].timeUntilAiring) : null;

    const userData: {
        current: string[];
        planning: string[];
        completed: string[];
        dropped: string[];
        paused: string[];
    } = {
        current: [],
        planning: [],
        completed: [],
        dropped: [],
        paused: [],
    };

    const guildId = BigInt(interaction.guild_id);
    const allUsers = await fetchAllUsers(guildId).then((users: any) => {
        logger.debugSingle(`Fetched ${users.length} users from the database`, "Anilist");
        return users.map((user: { anilist: any }) => user.anilist.id);
    });

    if (allUsers.length !== 0) {
        for (const member in allUsers) {
            const userScore = await fetchUserData(Number(allUsers[member]), mediaID);
            logger.debug("User information", "Anilist", userScore);

            switch (userScore.status) {
                case "REPEATING":
                    userData.current.push(
                        `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.progress} | ${userScore.score}/10 (${userScore.repeat}) `)}\n`,
                    );
                    break;
                case "CURRENT": {
                    const userRepeats = userScore.repeat === 0 ? "" : `(${userScore.repeat})`;
                    userData.current.push(
                        `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.progress} | ${userScore.score}/10 ${userRepeats} `)}\n`,
                    );
                    break;
                }
                case "COMPLETED": {
                    const userRepeats = userScore.repeat === 0 ? "" : `(${userScore.repeat})`;
                    userData.completed.push(
                        `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.score}/10 ${userRepeats} `)}\n`,
                    );
                    break;
                }
                case "PLANNING":
                    userData.planning.push(`> ${inlineCode(userScore.user)}\n`);
                    break;
                case "DROPPED":
                    userData.dropped.push(
                        `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.progress} | ${userScore.score}/10 `)}\n`,
                    );
                    break;
                case "PAUSED":
                    userData.paused.push(
                        `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.progress} | ${userScore.score}/10 `)}\n`,
                    );
                    break;
                default:
                    break;
            }
        }
    }

    const isReading = mediaType === "MANGA" ? "current reading " : "current watching";
    const isPlanning = mediaType === "MANGA" ? "planning to read " : "planning to watch";

    const descriptionBuilder = [
        `${inlineCode("total episodes    :")} ${result.episodes}\n`,
        `${inlineCode("current episode   :")} ${currentEpisode}\n`,
        `${inlineCode("next airing       :")} ${nextEpisode}\n`,
        `${inlineCode("chapters          :")} ${result.chapters}\n`,
        `${inlineCode("volumes           :")} ${result.volumes}\n`,
        `${inlineCode("status            :")} ${capitalise(result.status)}\n`,
        `${inlineCode("average score     :")} ${result.averageScore}%\n`,
        `${inlineCode("mean score        :")} ${result.meanScore}%\n`,
        `${inlineCode("popularity        :")} ${result.popularity.toLocaleString()}\n`,
        `${inlineCode("favourites        :")} ${result.favourites.toLocaleString()}\n`,
        `${inlineCode("start date        :")} ${result.startDate}\n`,
        `${inlineCode("end date          :")} ${result.endDate}\n`,
        `${inlineCode("genres            :")} ${genresDisplay}\n\n`,
        `${inlineCode("completed         :")}\n ${userData.completed.join("")}\n`,
        `${inlineCode(`${isReading}  :`)}\n ${userData.current.join("")}\n`,
        `${inlineCode(`${isPlanning} :`)}\n ${userData.planning.join("")}\n`,
        `${inlineCode("dropped           :")}\n ${userData.dropped.join("")}\n`,
        `${inlineCode("paused            :")}\n ${userData.paused.join("")}\n\n`,
    ];

    if (result.banner === "null") {
        result.banner = null;
    }
    if (result.cover === "null") {
        result.cover = null;
    }

    if (result.status === "Not_Yet_Released") {
        result.status = "Not Yet Released";
    }

    const filteredDescription = descriptionBuilder.filter((line) => {
        return !(
            /^\s*$/.test(line) ||
            /null/.test(line) ||
            line === "`completed         :`\n \n" ||
            line === "`current watching  :`\n \n" ||
            line === "`current reading   :`\n \n" ||
            line === "`planning to watch :`\n \n" ||
            line === "`planning to read  :`\n \n" ||
            line === "`dropped           :`\n \n" ||
            line === "`paused            :`\n \n\n"
        );
    });

    return {
        result: result,
        description: filteredDescription,
    };
}

async function fetchUserData(user: number, media: number) {
    const response = await fetch(`${env.API_URL}/user/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: user,
            media_id: media,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });

    if (response === null) {
        logger.error("Request returned null", "Anilist");
        return;
    }

    const userScore = await response.json().catch((error) => {
        logger.error("Error while parsing JSON data.", "Anilist", error);
        return;
    });
    return userScore;
}

function capitalise(message: string) {
    return message.charAt(0).toUpperCase() + message.toLowerCase().slice(1);
}
