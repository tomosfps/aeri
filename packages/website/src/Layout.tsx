import { Outlet } from "react-router-dom";
import Navigation from "./components/ui/navigation";
import FooterSection from "./components/ui/footer";

function Layout() {
    return (
        <div className="h-full w-screen bg-cbackground-light">
            <Navigation />
            
            <Outlet />
            
            <FooterSection />
        </div>
    );
}

export default Layout;
