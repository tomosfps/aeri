import { env } from "core";
import { Logger } from "log";
import { checkResponse } from "../util/anilistUtil.js";

const logger = new Logger();

export async function fetchAnilistRelations(media_name: string, media_type: string): Promise<any> {
    const response = await fetch(`${env.API_URL}/relations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            media_name: media_name,
            media_type: media_type,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });
    const result = await checkResponse(response, "Relations");

    if (result === null) {
        return null;
    }

    logger.debug("Relations data", "Anilist", result);

    if (result.relations.length === 0) {
        return null;
    }

    return result.relations;
}
