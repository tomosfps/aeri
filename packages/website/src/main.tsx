import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";

const App       = lazy(() => import("./App.tsx"));
const Commands  = lazy(() => import("./routes/commands/Commands.tsx"));
const Success   = lazy(() => import("./routes/login/success.tsx"));
const Layout    = lazy(() => import("./Layout.tsx"));
const Login     = lazy(() => import("./routes/login/login.tsx"));
const Fail      = lazy(() => import("./routes/login/fail.tsx"));
const Dashboard = lazy(() => import("./routes/dashboard/Dashboard.tsx"));
const Settings  = lazy(() => import("./routes/settings/Settings.tsx"));
const Status    = lazy(() => import("./routes/status/Status.tsx"));
const Logout    = lazy(() => import("./routes/login/logout.tsx"));

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<App />} />
                        <Route path="commands" element={<Commands />} />
                        <Route path="login" element={<Login />} />
                        <Route path="logout" element={<Logout />} />
                        <Route path="fail" element={<Fail />} />
                        <Route path="success" element={<Success />} />
                        <Route path="status" element={<Status />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    </StrictMode>,
);
