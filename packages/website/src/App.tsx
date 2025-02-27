import { NavLink as Link } from "react-router-dom";
import { Features } from "./components/ui/features";
import mediaSearchClosed from "@/assets/media_search_closed.svg";
import mediaSearchOpen from "@/assets/media_search_open.svg";
import userSearch from "@/assets/user_search.svg";
import updatedStatus from "@/assets/updated_status.svg";

function App() {
    return (
        <main className="h-full w-screen">

            {/* Hero */}
            <div className="h-max w-full flex flex-col justify-center items-center text-ctext-light rounded-3xl p-4 space-y-8 mb-24">
                <div className="xl:w-[70%] flex flex-col xl:flex-col justify-center items-center w-dvw">
                    <h1 className="text-4xl xl:text-6xl text-center font-bold mx-4 pt-12 pb-4">All Your <span className="text-cprimary-light">Anime</span> & <span className="text-csecondary-light">Manga</span> Needs in One Place</h1>
                    <p className="text-ctext-light/80 text-center text-base xl:text-xl 2xl:text-2xl mx-4 xl:mx-28 xl:mx-48 xl:pt-12">With a wide range of features, Aeri is the only media bot you'll need for your server.</p>
                </div>

                {/* Hero Buttons */}
                <div className="flex flex-col 2xl:flex-row 2xl:space-y-0 2xl:space-x-8 space-y-8 pb-12 text-center xl:w-max">
                    <Link to="https://discord.com/oauth2/authorize?client_id=795916241193140244" className="font-bold hover:bg-cprimary-light/40 border-2 border-cborder-light bg-cprimary-light/5 text-cprimary-light px-8 py-4 rounded-xl text-xl">Add To Discord</Link>
                    <Link to="commands" className="font-semibold hover:text-csecondary-light/40 hover:border-csecondary-light/40 border-2 border-csecondary-light px-8 text-csecondary-light py-4 rounded-xl text-xl">Commands</Link>
                </div>
            </div>

            {/* Features */}
            <section className="w-full h-max rounded-3xl p-4 space-y-6">
                <div className="flex flex-col items-center space-y-28">
                    <Features title="Media Search" description="Search for your favorite anime or manga and get detailed information about it." image={mediaSearchClosed} altImage={mediaSearchOpen} clickable={true} alt="Media Search" />
                    <Features title="User Search" description="Search for a user, or yourself and see up to date information!" image={userSearch} alt="User Search" />
                    <Features title="Update Info" description="Update the status of a media, score or anything, right through the bot." image={updatedStatus} alt="Updating Info Bot" />
                </div>

                <div className="pb-32 lg:ml-0 flex justify-center pt-6">
                    <Link to="commands" className="hover:bg-cprimary-light/40 border-2 border-cborder-light bg-cprimary-light/5 text-cprimary-light inline-flex h-9 items-center justify-center rounded-md bg-cprimary-light px-4 py-6 lg:px-6 lg:py-8 text-base lg:text-xl font-bold shadow">See More Features</Link>
                </div>
            </section>

            {/* Add Aeri */}
            <section>
                <div className="h-max flex flex-col justify-center items-center text-ctext-light mx-4 rounded-3xl space-y-4 p-4 mb-24 text-center pb-40">
                    <h1 className="text-3xl 2xl:text-5xl font-bold text-ctext-light ">Add Aeri</h1>
                    <p className="text-ctext-light/80 mt-2 text-sm 2xl:text-lg">Start fetching, viewing and updating information today!</p>
                    <Link to="https://discord.com/oauth2/authorize?client_id=795916241193140244" className="border-2 border-cborder-light bg-cprimary-light/5 text-cprimary-light font-bold hover:bg-cprimary-light/40 bg-cprimary-light px-8 py-4 2xl:px-12 2xl:py-6 rounded-xl text-base 2xl:text-xl">Add to Discord</Link>
                </div>
            </section>

        </main>
    );
}

export default App;
