import { NavLink as Link } from "react-router-dom";
import { Features } from "./components/ui/features";
import { Card } from "./components/ui/card";

function App() {
    return (
        <main className="h-full w-screen bg-cbackground-light dark:bg-cbackground-dark">

            {/* Hero */}
            <div className="h-max w-full flex flex-col justify-center items-center text-ctext-light dark:text-ctext-dark rounded-3xl p-4 space-y-8 mb-24">
                <div className="xl:w-[70%] flex flex-col xl:flex-col justify-center items-center w-dvw">
                    <h1 className="text-4xl xl:text-6xl text-center font-bold mx-4 pt-12 pb-4">All Your <span className="text-cprimary-light dark:text-cprimary-dark">Anime</span> & <span className="text-csecondary-light dark:text-csecondary-dark">Manga</span> Needs in One Place</h1>
                    <p className="text-ctext-light/50 dark:text-ctext-dark/60 text-center text-base xl:text-xl 2xl:text-2xl mx-4 xl:mx-28 xl:mx-48 xl:pt-12">With a wide range of features, Aeri is the only media bot you'll need for your server.</p>
                </div>

                {/* Hero Buttons */}
                <div className="flex flex-col 2xl:flex-row 2xl:space-y-0 2xl:space-x-8 space-y-8 pb-12 text-center xl:w-max">
                    <Link to="/" className="hover:bg-cprimary-light/40 dark:hover:bg-cprimary-dark/40 bg-cprimary-light dark:bg-cprimary-dark px-8 py-4 rounded-xl text-xl">Add To Discord</Link>
                    <Link to="commands" className="hover:text-csecondary-light/40 dark:hover:text-csecondary-dark/40 hover:border-csecondary-light/40 dark:hover:border-csecondary-dark/40 border-2 border-csecondary-light dark:border-csecondary-dark px-8 text-csecondary-light dark:text-csecondary-dark py-4 rounded-xl text-xl font-semibold">Commands</Link>
                </div>
            </div>

            {/* Features */}
            <section className="w-full h-max rounded-3xl p-4 space-y-6">
                <div className="flex flex-col items-center space-y-28">
                    <Features title="Media Search" description="Search for your favorite anime or manga and get detailed information about it." image="https://placehold.co/600x400" alt="Anime Search" />
                    <Features title="Other Searches" description="You can search for more, the bot also offers searching for staff, characters, studio and more!" image="https://placehold.co/600x400" alt="Anime Search" />
                    <Features title="Update Info" description="Update the status of a media, score or anything, right through the bot." image="https://placehold.co/600x400" alt="Anime Search" />
                </div>

                <div className="pb-32 lg:ml-0 md:flex md:justify-center pt-6">
                    <Link to="commands" className="hover:bg-cprimary-light/40 dark:hover:bg-cprimary-dark/40 inline-flex h-9 items-center justify-center rounded-md bg-cprimary-light dark:bg-cprimary-dark px-4 py-6 lg:px-6 lg:py-8 text-base lg:text-xl font-medium text-ctext-light dark:text-ctext-dark shadow">See More Features</Link>
                </div>
            </section>
        
            {/* Github Stats */}
            <section className="w-full h-max space-y-8 lg:mx-2">
                <div className="ml-4 md:flex md:flex-col md:items-center">
                    <h1 className="text-2xl font-bold 2xl:text-6xl text-cprimary-light dark:text-cprimary-dark">Open-Source</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">All of <span className="font-bold dark:text-cprimary-dark text-cprimary-light">Aeri</span> is also open source, so you can locally host it yourself!</p>
                </div>
                <div className="flex flex-wrap justify-center 2xl:mx-26">
                    <Card title="Aeri" description="Discord bot for anime and manga fans" 
                    url="https://github.com/ehiraa/aeri" image="https://placehold.co/600x400"
                    languages={["TypeScript", "Redis", "Prisma"]}/>

                    <Card title="Website" description="The website for Aeri" 
                    url="https://github.com/ehiraa/aeri/tree/main/packages/website" image="https://placehold.co/600x400"
                    languages={["TypeScript", "React"]}/>

                    <Card title="API" description="The backend API for Aeri" 
                    url="https://github.com/ehiraa/aeri/tree/main/packages/API" image="https://placehold.co/600x400"
                    languages={["Rust", "Redis", "Dockerfile"]}/>

                    <Card title="API" description="The backend API for Aeri" 
                    url="https://github.com/ehiraa/aeri/tree/main/packages/API" image="https://placehold.co/600x400"
                    languages={["Rust", "Redis", "Dockerfile"]}/>
                </div>

                <div className="ml-4 pb-20 2xl:ml-0 md:flex md:flex-col md:items-center">
                    <Link to="https://github.com/ehiraa/aeri" target="_blank" className="hover:bg-cprimary-light/40 dark:hover:bg-cprimary-dark/40 inline-flex h-9 items-center justify-center rounded-md bg-cprimary-light dark:bg-cprimary-dark px-4 py-6 lg:px-6 lg:py-8 lg:text-lg text-base font-medium text-ctext-light dark:text-ctext-dark shadow">Learn To Locally Setup</Link>
                </div>
            </section>

            {/* Add Aeri */}
            <section>
                <div className="h-max flex flex-col justify-center items-center text-ctext-light dark:text-ctext-dark mx-4 rounded-3xl space-y-4 p-4 mb-24 text-center">
                    <h1 className="text-3xl 2xl:text-5xl font-bold text-ctext-light dark:text-ctext-dark">Add Aeri</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm 2xl:text-lg">Start fetching, viewing and updating information today!</p>
                    <Link to="/" className="hover:bg-cprimary-light/40 dark:hover:bg-cprimary-dark/40 bg-cprimary-light dark:bg-cprimary-dark px-8 py-4 2xl:px-12 2xl:py-6 rounded-xl text-base 2xl:text-xl">Add to Discord</Link>
                </div>
            </section>

        </main>
    );
}

export default App;
