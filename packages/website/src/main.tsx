import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App.tsx";
import Commands from "./routes/commands/Commands.tsx";
import Success from "./routes/api/success.tsx";
import Layout from "./Layout.tsx";
import Login from "./routes/api/login.tsx";
import Fail from "./routes/api/fail.tsx";
import Dashboard from "./routes/dashboard/Dashboard.tsx";
import Profile from "./routes/profile/Profile.tsx";
import Settings from "./routes/settings/Settings.tsx";
import Status from "./routes/status/Status.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <App />,
            },
            {
                path: "commands",
                element: <Commands />,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "login/fail",
                element: <Fail />,
            },
            {
                path: "login/success",
                element: <Success />,
            },
            {
                path: "dashboard",
                element: <Dashboard />,
            },
            {
                path: "profile",
                element: <Profile />,
            },
            {
                path: "settings",
                element: <Settings />,
            },
            {
                path: "status",
                element: <Status />,
            }
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
