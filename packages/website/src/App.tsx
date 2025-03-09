import { NavLink as Link } from "react-router-dom";
import { Features } from "./components/ui/features";
import mediaSearchOpen from "@/assets/media_search_open.svg";
import userSearch from "@/assets/user_search.svg";
import updatedStatus from "@/assets/updated_status.svg";
import { motion } from "framer-motion";
import discord from "@/assets/discord.svg";
import { useEffect, useState } from "react";
import GetStats, { Statistics } from "./components/requests/getStats";
import LoadingSpinner from "./components/ui/loadingSpinner";
import { FAQ } from "./components/ui/FAQ";
import { StatisticDisplay } from "./components/ui/statisticDisplay";

function App() {
    const [stats, setStats] = useState<Statistics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchShards = async () => {
            try {
                const shardData = await GetStats();
                if (isMounted) {
                    setStats(shardData);
                }
            } catch (error) {
                console.error("Failed to fetch statistics:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchShards();
        return () => { isMounted = false; };
    }, []);
    
    return (
        <>
            <main className="h-full w-screen overflow-x-hidden">
                {/* Hero Section with Floating Elements */}

                <section className="relative min-h-[90vh] w-full flex flex-col justify-center items-center text-ctext-light p-4 overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <motion.div 
                            animate={{ 
                                x: [0, 15, 0], 
                                y: [0, -15, 0],
                                opacity: [0.5, 0.7, 0.5]
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 10,
                                ease: "easeInOut"
                            }}
                            className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cprimary-light/10 blur-3xl"
                        />
                        <motion.div 
                            animate={{ 
                                x: [0, -20, 0], 
                                y: [0, 20, 0],
                                opacity: [0.4, 0.6, 0.4]
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 12,
                                ease: "easeInOut",
                                delay: 1
                            }}
                            className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-csecondary-light/10 blur-3xl"
                        />
                    </div>
                    
                    <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center">
                        {/* Hero Content */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2 flex flex-col justify-center pt-12 md:pt-0 text-center lg:text-left"
                        >
                            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-cprimary-light/10 text-cprimary-light font-medium text-sm">
                                The Ultimate Anime & Manga Discord Bot
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                                Bringing <span className="text-cprimary-light bg-cprimary-light/5 px-2 rounded-md">Anime</span> & <span className="text-csecondary-light bg-csecondary-light/5 px-2 rounded-md">Manga</span> to Your Discord
                            </h1>
                            
                            <p className="text-ctext-light/80 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
                                Enhance your server with detailed information on series, characters, and studios. Track your AniList progress and discover new favorites, all without leaving Discord.
                            </p>
                            
                            {/* Hero Buttons */}
                            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-12 justify-center lg:justify-start">
                                <Link to="https://discord.com/oauth2/authorize?client_id=795916241193140244" 
                                    className="w-full sm:w-auto hover:text-black/50 font-bold transition-all duration-300 bg-cprimary-light hover:bg-cprimary-light/90 text-white px-8 py-3 rounded-xl text-lg shadow-lg flex items-center justify-center">
                                    <img src={discord} alt="Discord Logo" className="mr-2 h-5 w-5 brightness-0 invert " />
                                    Add To Discord
                                </Link>
                                
                                <Link to="commands" 
                                    className="w-full sm:w-auto font-semibold transition-all duration-300 hover:bg-csecondary-light hover:text-white border-2 border-csecondary-light text-csecondary-light px-8 py-3 rounded-xl text-lg">
                                    Explore Commands
                                </Link>
                            </div>
                            
                            {/* Stats Section */}
                            {loading ? (
                                <div className="flex justify-center mt-4">
                                    <LoadingSpinner fullScreen={false} message="Loading Statistics"/>
                                </div>
                            ) : (
                                <div className="flex flex-row justify-around md:grid md:grid-cols-3 md:gap-4 mt-4">
                                    {stats.length > 0 && (
                                            <>
                                                <StatisticDisplay value={stats[0] ?? 0} label="Guilds"/>
                                                <StatisticDisplay value={stats[1] ?? 0} label="User Installs"/>
                                                <StatisticDisplay value={stats[2] ?? 0} label="Commands"/>
                                            </>
                                        )}
                                </div>
                            )}
                        </motion.div>
                        
                        {/* Hero Image */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:w-1/2 mt-12 lg:mt-0"
                        >
                            <div className="relative">
                                <img 
                                    src={mediaSearchOpen} 
                                    alt="Aeri Discord Bot Interface" 
                                    className="rounded-2xl shadow-2xl border border-white/10 max-w-full mx-auto" 
                                />
                                
                                {/* Floating elements */}
                                <div className="absolute -right-6 -top-6 bg-csecondary-light/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg hidden md:block">
                                    <div className="text-sm font-medium">Browse Anime</div>
                                    <div className="text-xs opacity-70">Command used: /anime</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    
                    {/* Scroll indicator */}
                    <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5L12 19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </motion.div>
                </section>

                {/* Features Section */}
                <section className="w-full py-24 px-4 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-1/3 -left-36 w-72 h-72 rounded-full bg-cprimary-light/5 blur-3xl"></div>
                        <div className="absolute bottom-1/3 -right-36 w-72 h-72 rounded-full bg-csecondary-light/5 blur-3xl"></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto mb-16 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <span className="px-4 py-1 text-sm font-medium rounded-full bg-cprimary-light/10 text-cprimary-light inline-block mb-4">
                                Powerful Features
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cprimary-light">
                                Everything You Need in One Bot
                            </h2>
                            <p className="text-ctext-light/70 max-w-2xl mx-auto">
                                Aeri provides powerful tools and features for anime and manga fans to track, discover, and share their passion.
                            </p>
                        </motion.div>
                    </div>
                    
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <Features 
                            title="Rich Media Search"
                            description="Get detailed information on anime, manga, characters, studios, and staff with beautiful embeds and interactive components."
                            image={mediaSearchOpen}
                            alt="Media Search"
                            commandExample="/anime name:Jujutsu Kaisen"
                            learnMoreLink="/commands"
                            learnMoreText="Learn more about media search commands"
                            isRightAligned={false}
                            animationDirection="left"
                            titleColor="text-cprimary-light"
                        />
                        
                        <Features 
                            title="User Profiles & Stats"
                            description="View detailed AniList profiles, compare taste with friends, and get personalized recommendations based on your watch history."
                            image={userSearch}
                            alt="User Profiles"
                            commandExample="/user username:JavaScript"
                            learnMoreLink="/commands"
                            learnMoreText="Explore user profile commands"
                            isRightAligned={true}
                            animationDirection="right"
                            titleColor="text-csecondary-light"
                        />
                        
                        <Features 
                            title="AniList Integration"
                            description="Update your watching status, scores, and progress directly through Discord without switching between apps."
                            image={updatedStatus}
                            alt="AniList Integration"
                            commandExample="/update-anime name:Jujutsu Kaisen progress:17"
                            learnMoreLink="/commands"
                            learnMoreText="See AniList integration commands"
                            isRightAligned={false}
                            animationDirection="left"
                            titleColor="text-cprimary-light"
                        />
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="pt-16 flex justify-center"
                    >
                        <Link to="commands" 
                            className="group relative hover:text-black/50 inline-flex items-center justify-center transition-all duration-300 bg-cprimary-light/90 hover:bg-cprimary-light text-white rounded-xl px-8 py-4 text-lg font-bold shadow-lg hover:shadow-cprimary-light/20 hover:shadow-2xl"
                        >
                            Explore All Commands
                            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="absolute -bottom-1 left-1/2 w-0 h-1 bg-white rounded-full group-hover:w-4/5 -translate-x-1/2 transition-all duration-300"></span>
                        </Link>
                    </motion.div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 px-4">
                    <FAQ 
                        items={[
                            {
                                question: "Is Aeri free to use?",
                                answer: "Yes, Aeri is completely free to use with all core features available to everyone."
                            },
                            {
                                question: "How do I connect my AniList account?",
                                answer: <>You may use <code className="bg-csecondary-light/10 text-csecondary-light px-1.5 py-0.5 rounded">/link</code> or <code className="bg-csecondary-light/10 text-csecondary-light px-1.5 py-0.5 rounded">/login</code> to connect your AniList account to Aeri.</>
                            },
                            {
                                question: "Does Aeri work in DMs?",
                                answer: "Yes, Aeri works in both server channels and direct messages."
                            },
                            {
                                question: "How can I suggest a feature or report a bug?",
                                answer: "You may join our support server and submit a feature request or bug report in the appropriate channel."
                            },
                            {
                                question: "How can I invite Aeri to my server?",
                                answer: "You may invite Aeri to your server by clicking the 'Add to Discord' button on this page."
                            },
                        ]}
                    />
                </section>

                {/* Call to Action Section */}
                <section className="relative py-24">
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.05, 1],
                                opacity: [0.5, 0.7, 0.5]
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 8,
                                ease: "easeInOut"
                            }} 
                            className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-cprimary-light/10 blur-3xl" 
                        />
                        <motion.div
                            animate={{ 
                                scale: [1, 1.1, 1],
                                opacity: [0.4, 0.6, 0.4]
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 10,
                                ease: "easeInOut",
                                delay: 1
                            }} 
                            className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-csecondary-light/10 blur-3xl" 
                        />
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center px-4"
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-cprimary-light">Ready to Transform Your Discord?</h2>
                        <p className="text-ctext-light/80 mb-10 text-lg max-w-3xl mx-auto">
                            Join the community of Aeri to ehance your server with the best anime and manga bot on Discord.
                        </p>
                        
                        <Link to="https://discord.com/oauth2/authorize?client_id=795916241193140244" 
                            className="group relative inline-flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-cprimary-light to-csecondary-light text-white font-bold px-10 py-5 rounded-xl text-xl shadow-lg hover:text-black/50 hover:shadow-cprimary-light/20 hover:shadow-2xl">
                            <span className="flex items-center">
                                Add Aeri to Discord
                                <img 
                                    src={discord} 
                                    alt="Discord Logo" 
                                    className="ml-3 h-6 w-6 brightness-0 invert" 
                                />
                            </span>
                            <span className="absolute -bottom-1 left-1/2 w-0 h-1 bg-white rounded-full group-hover:w-4/5 -translate-x-1/2 transition-all duration-300"></span>
                        </Link>
                        <p className="mt-6 text-sm text-ctext-light/60">Setup in seconds</p>
                    </motion.div>
                </section>
            </main>
        </>
    );
}

export default App;