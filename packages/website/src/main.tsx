import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import About from "./routes/about/About.tsx";
import Commands from "./routes/commands/Commands.tsx";
import Api from "./routes/api/api.tsx";
import "./index.css";
import Layout from "./Layout.tsx";

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
                path: "about",
                element: <About />,
            },
            {
                path: "commands",
                element: <Commands />,
            },
            {
                path: "login/success",
                element: <Api />,
            }
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
