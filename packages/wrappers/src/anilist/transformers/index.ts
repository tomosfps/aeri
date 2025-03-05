import type { TransformableRoutesWithArgs, TransformableRoutesWithoutArgs } from "../fetch.js";
import { type BaseResponse, type BaseTransformed, type RouteMap, Routes } from "../types.js";
import { affinityTransformer } from "./affinity.js";
import { characterTransformer } from "./character.js";
import { mediaTransformer } from "./media.js";
import { relationsTransformer } from "./relations.js";
import { staffTransformer } from "./staff.js";
import { studioTransformer } from "./studio.js";
import { universalTransformer } from "./universal.js";
import { userTransformer } from "./user.js";
import { watchListTransformer } from "./watchlist.js";

type Awaitable<T> = T | Promise<T>;

type TransformersTypeWithoutArgs = {
    [key in TransformableRoutesWithoutArgs]: (
        data: RouteMap[key]["response"],
    ) => Awaitable<RouteMap[key]["transformed"]>;
};

type TransformersTypeWithArgs = {
    [key in TransformableRoutesWithArgs]: (
        data: RouteMap[key]["response"],
        args: RouteMap[key]["transformer_args"],
    ) => Awaitable<RouteMap[key]["transformed"]>;
};

export type TransformersType = TransformersTypeWithoutArgs & TransformersTypeWithArgs;

export type UniversalTransformer = {
    universal: (data: BaseResponse) => BaseTransformed;
};

export const transformers: TransformersType & UniversalTransformer = {
    [Routes.User]: userTransformer,
    [Routes.Character]: characterTransformer,
    [Routes.Staff]: staffTransformer,
    [Routes.Studio]: studioTransformer,
    [Routes.Media]: mediaTransformer,
    [Routes.Affinity]: affinityTransformer,
    [Routes.Relations]: relationsTransformer,
    [Routes.WatchList]: watchListTransformer,
    universal: universalTransformer,
};

export { filteredDescription } from "./util.js";
