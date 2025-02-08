import { env } from "core";

export enum Route {
    Relations = "relations",
}

export interface RouteBodyMap {
    [Route.Relations]: {
        media_name: string;
        media_type: string;
    };
}

export async function anilistFetch<T extends Route>(route: T, body: RouteBodyMap[T]): Promise<Response> {
    return await fetch(`${env.API_URL}/${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}
