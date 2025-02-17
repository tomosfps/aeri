import { NavLink } from "react-router-dom";

function App() {
    return (
        <>
            <main className="min-h-screen min-w-screen pt-4 text transition-all duration-300 ease-in-out lg:mx-56 xl:mx-40">
                <div className="flex flex-col h-full items-center lg:items-start space-y-4 mx-4 pt-56">
                    <h1 className="font-bold text-8xl lg:text-8xl bg-gradient-to-r from-whitePrimary via-whiteAccent to-whiteSecondary bg-clip-text text-transparent dark:from-darkPrimary dark:via-darkAccent dark:to-darkSecondary transition-all duration-300 ease-in-out hover:text-whitePrimary dark:hover:text-darkPrimary">Aeri</h1>
                    <p>The only Anime/Manga bot you'll need.</p>
                    <div className="flex flex-row space-x-4 pb-56">
                        <NavLink to="https://discord.com/oauth2/authorize?client_id=795916241193140244" className="px-4 py-4 bg-whitePrimary hover:bg-whiteAccent rounded-lg text-whiteBackground dark:text-darkText dark:bg-darkSecondary dark:hover:bg-darkAccent transition-all duration-300">Add To Discord</NavLink>
                        <NavLink to="commands" className="px-4 py-4 bg-transparent border-2 border-whitePrimary hover:bg-whitePrimary hover:text-whiteBackground rounded-lg text-whiteText dark:text-darkText dark:border-darkPrimary dark:hover:bg-darkPrimary transition-all duration-300">See Commands</NavLink>
                    </div>
                </div>
            </main>
        </>
    );
}

export default App;
