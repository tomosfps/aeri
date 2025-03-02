import { formatSeconds } from "core";
import { DataFrom } from "../enums.js";
import type { UniversalTransformer } from "./index.js";

export const universalTransformer: UniversalTransformer["universal"] = (data) => {
    const footer =
        data.dataFrom === DataFrom.API
            ? "Data from Anilist API"
            : `Displaying cached data : refreshes in ${formatSeconds(data.leftUntilExpire)}`;

    return { footer };
};
