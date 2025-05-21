import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/commands", "routes/commands.tsx"),
    route("/status", "routes/status.tsx"),
    route("/terms", "routes/tos.tsx"),
    route("/privacy", "routes/privacy.tsx"),
    route("/success", "routes/success.tsx"),
    route("/fail", "routes/fail.tsx"),
    route("*", "routes/404.tsx"),
] satisfies RouteConfig;