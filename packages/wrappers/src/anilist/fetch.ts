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

type ErrorResult = {
    result: null;
    error: Error;
};

type SuccessResult<T> = {
    result: T;
    error: null;
};

type Result<T> = ErrorResult | SuccessResult<T>;

export type TransformableRoutesWithArgs = {
    [K in keyof RouteMap]: "transformed" extends keyof RouteMap[K]
        ? "transformer_args" extends keyof RouteMap[K]
            ? K
            : never
        : never;
}[keyof RouteMap];

export type TransformableRoutesWithoutArgs = Exclude<
    {
        [K in keyof RouteMap]: "transformed" extends keyof RouteMap[K] ? K : never;
    }[keyof RouteMap],
    TransformableRoutesWithArgs
>;

type TransformableRoutes = TransformableRoutesWithArgs | TransformableRoutesWithoutArgs;

type NonTransformableRoutes = Exclude<Routes, TransformableRoutes>;

type RouteBody<T extends Routes> = RouteMap[T]["body"];
type RouteResponse<T extends Routes> = RouteMap[T]["response"] & BaseTransformed;
type RouteTransformed<T extends TransformableRoutes> = RouteMap[T]["transformed"];
type RouteTransformerArgs<T extends TransformableRoutesWithArgs> = RouteMap[T]["transformer_args"];
type RouteTransformedResponse<T extends TransformableRoutes> = RouteTransformed<T> & RouteResponse<T>;

function isTransformableRoute(route: Routes): route is TransformableRoutes {
    return route in transformers;
}

export async function anilistFetch<T extends NonTransformableRoutes>(
    route: T,
    data: RouteBody<T>,
): Promise<Result<RouteResponse<T> | null>>;

export async function anilistFetch<T extends TransformableRoutesWithArgs>(
    route: T,
    data: RouteBody<T>,
    transformer_args: RouteTransformerArgs<T>,
): Promise<Result<RouteTransformedResponse<T> | null>>;

export async function anilistFetch<T extends TransformableRoutesWithoutArgs>(
    route: T,
    data: RouteBody<T>,
): Promise<Result<RouteTransformedResponse<T> | null>>;

export async function anilistFetch<T extends Routes>(
    route: T,
    data: RouteBody<T>,
    transformer_args?: "transformer_args" extends keyof RouteMap[T] ? RouteMap[T]["transformer_args"] : never,
): Promise<Result<object | null>> {
    try {
        const requestOptions: RequestInit & { headers: { [key: string]: string } } = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        };

        if ("token" in data) {
            requestOptions.headers["Authorization"] = `Bearer ${data.token}`;
            Reflect.deleteProperty(data, "token");
        }

        requestOptions.body = JSON.stringify(data);

        const response = await fetch(`${env.API_URL}/${route}`, requestOptions);

        let result = await validateResponse<RouteResponse<typeof route>>(response);

        if (result === null) {
            return { result: null, error: null };
        }

        result = {
            ...result,
            ...transformers.universal(result),
        };

        if (isTransformableRoute(route)) {
            result = {
                ...result,
                ...(await (transformers[route] as any)(result, transformer_args)),
            };

            return {
                result,
                error: null,
            };
        }

        return {
            result,
            error: null,
        };
    } catch (error: unknown) {
        return { result: null, error: error as Error };
    }
}
