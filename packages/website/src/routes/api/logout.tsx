import { NavLink } from "react-router-dom";

export default function Logout() {
    return (
        <>
            <main className="min-h-screen min-w-screen pt-4 text transition-all duration-300 ease-in-out lg:mx-56 xl:mx-40">
                <div className="flex flex-col h-full items-center space-y-4 mx-4 pt-56">
                    <p className="text-4xl">Logout</p>
                    <div className="flex flex-row space-x-4 pb-56">
                        <NavLink to="/" className="px-4 py-4 bg-whitePrimary hover:bg-whiteAccent rounded-lg text-whiteBackground dark:text-darkText dark:bg-darkSecondary dark:hover:bg-darkAccent transition-all duration-300">Return Home</NavLink>
                    </div>
                </div>
            </main>
        </>
    );
}
