import { TimestampStyles, time } from "@discordjs/formatters";
import { DataFrom } from "../enums.js";
import type { UniversalTransformer } from "./index.js";

export const universalTransformer: UniversalTransformer["universal"] = (data) => {
    const footer =
        data.dataFrom === DataFrom.API
            ? "-# Data from Anilist API"
            : `-# Data from Cache | expires ${time(Math.floor(Date.now() / 1000) + data.leftUntilExpire, TimestampStyles.RelativeTime)}`;

    return { footer };
};
