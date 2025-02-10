import { env } from "core";
import { transformers } from "./transformers/index.js";
import type { BaseTransformed, RouteMap, Routes } from "./types.js";

async function validateResponse<T extends object>(response: Response): Promise<T | null> {
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }

        const result = (await response.json().catch((error) => {
            throw new Error(`Error while parsing error response (${response.status})`, { cause: error });
        })) as { error: string };

        throw new Error(`Response not ok (${response.status}):\n${result.error}`);
    }

    return (await response.json().catch((error) => {
        throw new Error("Error while parsing response", { cause: error });
    })) as T;
}

type TransformableRoutes = keyof Omit<typeof transformers, "universal">;

function isTransformableRoute(route: Routes): route is TransformableRoutes {
    return route in transformers;
}

type RouteBody<T extends Routes> = RouteMap[T]["body"];
type RouteResponse<T extends Routes> = RouteMap[T]["response"] & BaseTransformed;
type RouteTransformed<T extends Routes> = RouteMap[T]["transformed"];
type RouteTransformedResponse<T extends Routes> = RouteTransformed<T> & RouteResponse<T>;

export async function anilistFetch<T extends TransformableRoutes>(
    route: T,
    body: RouteBody<T>,
): Promise<RouteTransformedResponse<T> | null>;

export async function anilistFetch<T extends Exclude<Routes, TransformableRoutes>>(
    route: T,
    body: RouteBody<T>,
): Promise<RouteResponse<T> | null>;

export async function anilistFetch<T extends Routes>(route: T, body: RouteBody<T>): Promise<object | null> {
    const response = await fetch(`${env.API_URL}/${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    let result = await validateResponse<RouteResponse<T>>(response);

    if (result === null) {
        return null;
    }

    result = {
        ...result,
        ...transformers.universal(result),
    };

    if (isTransformableRoute(route)) {
        return {
            ...result,
            ...(await transformers[route](result as any)),
        } as RouteTransformedResponse<T>;
    }

    return result as RouteResponse<T>;
}
