import { Outlet } from "react-router-dom";
import Navigation from "./components/ui/navigation";
import FooterSection from "./components/sections/footer/footer";

function Layout() {
    return (
        <>
            <Navigation />

            <Outlet />

            <FooterSection />
        </>
    );
}

export default Layout;
