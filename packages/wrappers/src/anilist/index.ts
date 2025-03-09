import { anilistFetch } from "./fetch.js";
export { Routes } from "./types.js";
export { MediaType, MediaListStatus, mediaListStatusString } from "./enums.js";

export const api = {
    fetch: anilistFetch,
};
