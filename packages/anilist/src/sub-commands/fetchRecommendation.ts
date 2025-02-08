import { env } from "core";
import { Logger } from "logger";
import { checkResponse } from "../util/anilistUtil.js";

const logger = new Logger();

export async function fetchRecommendation(mediaType: string, genres: string[]): Promise<any> {
    const response = await fetch(`${env.API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            media: mediaType,
            genres: genres,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });

    const result = await checkResponse(response, "Recommendation");

    if (result === null) {
        return null;
    }

    logger.debug("Recommendation data", "Anilist", result);
    return result;
}
