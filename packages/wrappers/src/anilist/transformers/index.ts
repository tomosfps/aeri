import { type BaseResponse, type BaseTransformed, type RouteMap, Routes } from "../types.js";
import { chacaterTransformer } from "./character.js";
import { universalTransformer } from "./universal.js";
import { userTransformer } from "./user.js";

export type TransformersType = {
    [key in Routes as RouteMap[key]["transformed"] extends never ? never : key]: (
        data: RouteMap[key]["response"],
    ) => RouteMap[key]["transformed"];
};

export type UniversalTransformer = {
    universal: (data: BaseResponse) => BaseTransformed;
};

export const transformers: TransformersType & UniversalTransformer = {
    [Routes.User]: userTransformer,
    [Routes.Character]: chacaterTransformer,
    universal: universalTransformer,
};
