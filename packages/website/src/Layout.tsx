import { Outlet } from "react-router-dom";
import Navigation from "./components/ui/navigation";
import FooterSection from "./components/sections/footer/default";

function Layout() {
    return (
        <div className="h-full w-screen bg-cbackground-light dark:bg-cbackground-dark">
            <Navigation />
            
            <Outlet />
            
            <FooterSection />
        </div>
    );
}

export default Layout;
