// src/main.tsx
import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";
import LoadingSpinner from "./components/ui/loadingSpinner";

const Fallback = () => <LoadingSpinner size="lg" message="Loading Page" />;
const App = lazy(() => import("./App"));
const Success = lazy(() => import("./routes/login/success"));
const Layout = lazy(() => import("./Layout"));
const Fail = lazy(() => import("./routes/login/fail"));
const Commands = lazy(() => import("./routes/commands/commands"));
const Status = lazy(() => import("./routes/status/status"));
const Privacy = lazy(() => import("./routes/policy/policy"));
const TOS = lazy(() => import("./routes/termsOfService/tos"));
const NotFound = lazy(() => import("./routes/404/not-found"));

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Router>
            <Suspense fallback={<Fallback />}>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<App />} />
                        <Route path="commands" element={<Commands />} />
                        <Route path="status" element={<Status />} />
                        <Route path="privacy" element={<Privacy />} />
                        <Route path="terms-of-service" element={<TOS />} />
                    </Route>
                    <Route path="fail" element={<Fail />} />
                    <Route path="success" element={<Success />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </Router>
    </StrictMode>,
);