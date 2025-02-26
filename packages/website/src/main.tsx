import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";

const App       = lazy(() => import("./App.tsx"));
const Success   = lazy(() => import("./routes/login/success.tsx"));
const Layout    = lazy(() => import("./Layout.tsx"));
const Fail      = lazy(() => import("./routes/login/fail.tsx"));
const Commands  = lazy(() => import("./routes/commands/commands.tsx"));

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<App />} />
                        <Route path="commands" element={<Commands />} />
                        <Route path="fail" element={<Fail />} />
                        <Route path="success" element={<Success />} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    </StrictMode>,
);
