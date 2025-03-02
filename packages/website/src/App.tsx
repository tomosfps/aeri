import { NavLink as Link } from "react-router-dom";
import { Features } from "./components/ui/features";
import mediaSearchClosed from "@/assets/media_search_closed.svg";
import mediaSearchOpen from "@/assets/media_search_open.svg";
import userSearch from "@/assets/user_search.svg";
import updatedStatus from "@/assets/updated_status.svg";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import discord from "@/assets/discord.svg";

function App() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <main className="h-full w-screen overflow-x-hidden">
            {/* Hero Section with Floating Elements */}
            <section className="relative h-max w-full flex flex-col justify-center items-center text-ctext-light rounded-3xl p-4 space-y-8 mb-24 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-cprimary-light/5 blur-3xl transform -translate-y-1/2" 
                         style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
                    <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-csecondary-light/5 blur-3xl transform -translate-y-1/2"
                         style={{ transform: `translateY(${scrollY * -0.15}px)` }} />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="xl:w-[70%] flex flex-col xl:flex-col justify-center items-center w-dvw pt-12 md:pt-24"
                >
                    <h1 className="text-4xl md:text-5xl xl:text-6xl text-center font-bold mx-4 pt-8 pb-4 leading-tight">
                        All Your <span className="text-cprimary-light bg-cprimary-light/5 px-2 rounded-md">Anime</span> & <span className="text-csecondary-light bg-csecondary-light/5 px-2 rounded-md">Manga</span> Needs in One Place
                    </h1>
                    <p className="text-ctext-light/80 text-center text-base xl:text-xl 2xl:text-2xl mx-4 xl:mx-28 2xl:mx-48 xl:pt-8 max-w-3xl">
                        With a wide range of features, Aeri is the only media bot you'll need for your Discord server.
                    </p>
                </motion.div>

                {/* Hero Buttons */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row sm:space-y-0 sm:space-x-8 space-y-6 pb-12 text-center"
                >
                    <Link to="https://discord.com/oauth2/authorize?client_id=795916241193140244" 
                          className="font-bold transition-all duration-300 hover:bg-cprimary-light hover:text-white border-2 border-cprimary-light bg-cprimary-light/5 text-cprimary-light px-10 py-4 rounded-xl text-xl shadow-sm hover:shadow-md">
                        Add To Discord
                    </Link>
                    <Link to="commands" 
                          className="font-semibold transition-all duration-300 hover:bg-csecondary-light/10 border-2 border-csecondary-light px-10 text-csecondary-light py-4 rounded-xl text-xl shadow-sm hover:shadow-md">
                        Explore Commands
                    </Link>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="w-full h-max rounded-3xl p-4 space-y-6 ">
                <div className="flex flex-col items-center space-y-40 md:space-y-56">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, margin: "-100px" }}
                        
                    >
                        <Features 
                            title="Media Search" 
                            description="Search for your favorite anime or manga and get detailed information about characters, studios, ratings, and more." 
                            image={mediaSearchClosed} 
                            altImage={mediaSearchOpen} 
                            clickable={true} 
                            alt="Media Search" 
                        />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <Features 
                            title="User Search" 
                            description="Look up AniList users to see their watching history, favorites, stats and recommendations that match their taste." 
                            image={userSearch} 
                            alt="User Search" 
                        />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <Features 
                            title="Update Info" 
                            description="Manage your AniList profile directly through Discord. Update watch status, scores, and progress without leaving your server." 
                            image={updatedStatus} 
                            alt="Updating Info Bot" 
                        />
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="pb-32 lg:ml-0 flex justify-center pt-16"
                >
                    <Link to="commands" 
                          className="transition-all duration-300 hover:bg-cprimary-light hover:text-white border-2 border-cprimary-light bg-cprimary-light/5 text-cprimary-light inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-bold shadow-sm hover:shadow-md">
                        See All Commands
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </motion.div>
            </section>

            {/* Call to Action Section */}
            <section className="relative">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-cprimary-light/5 blur-3xl" />
                    <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-csecondary-light/5 blur-3xl" />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="h-max flex flex-col justify-center items-center text-ctext-light mx-4 rounded-3xl space-y-8 p-8 mb-24 text-center pb-40"
                >
                    <div className="max-w-md">
                        <h1 className="text-3xl 2xl:text-5xl font-bold text-ctext-light">Add Aeri Today</h1>
                        <p className="text-ctext-light/80 mt-4 text-sm 2xl:text-lg max-w-md">
                            Enhance your Discord server with comprehensive anime and manga information, user statistics, and profile management.
                        </p>
                    </div>
                    
                    <Link to="https://discord.com/oauth2/authorize?client_id=795916241193140244" 
                          className="transition-all duration-300 relative group border-2 border-cprimary-light bg-cprimary-light/5 hover:bg-cprimary-light text-cprimary-light hover:text-white font-bold px-10 py-4 2xl:px-12 2xl:py-6 rounded-xl text-base 2xl:text-xl shadow-sm hover:shadow-md">
                        <span className="flex items-center">
                            Add to Discord
                            <img 
                                src={discord} 
                                alt="Discord Logo" 
                                className="ml-2 h-6 w-6 group-hover:brightness-0 group-hover:invert transition-colors duration-300" 
                            />
                        </span>
                        <div className="absolute -bottom-1 left-1/2 w-0 h-1 bg-csecondary-light rounded-full group-hover:w-4/5 -translate-x-1/2 transition-all duration-300"></div>
                    </Link>
                </motion.div>
            </section>
        </main>
    );
}

export default App;