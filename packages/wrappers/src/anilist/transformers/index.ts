import { type BaseResponse, type BaseTransformed, type RouteMap, Routes } from "../types.js";
import { characterTransformer } from "./character.js";
import { mediaTransformer } from "./media.js";
import { staffTransformer } from "./staff.js";
import { studioTransformer } from "./studio.js";
import { universalTransformer } from "./universal.js";
import { userTransformer } from "./user.js";

export type TransformersType = {
    [key in Routes as RouteMap[key]["transformed"] extends never ? never : key]: (
        data: RouteMap[key]["response"],
    ) => RouteMap[key]["transformed"] | Promise<RouteMap[key]["transformed"]>;
};

export type UniversalTransformer = {
    universal: (data: BaseResponse) => BaseTransformed;
};

export const transformers: TransformersType & UniversalTransformer = {
    [Routes.User]: userTransformer,
    [Routes.Character]: characterTransformer,
    [Routes.Staff]: staffTransformer,
    [Routes.Studio]: studioTransformer,
    [Routes.Media]: mediaTransformer,
    universal: universalTransformer,
};
