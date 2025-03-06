"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Suspense, useEffect, useState } from "react";
import { NavLink as Link } from "react-router-dom";
import { MobileNavItem, NavigationItem } from "./navigationLinks";
import github from "@/assets/github.svg";
import discord from "@/assets/discord.svg";
import logo from "@/assets/aeri_logo.svg";
import LoadingSpinner from "./loadingSpinner";
import { SocialButton } from "./socialButton";

export default function Navigation() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    function toggleSheet() {
        setIsSheetOpen(!isSheetOpen);
    }

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY && window.scrollY > 75) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
            setLastScrollY(window.scrollY);
        };
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [lastScrollY]);

    return (
        <>
            <header 
                className={`sticky top-0 flex w-full items-center z-50 transition-all duration-300 ${
                    isVisible ? 'translate-y-0' : '-translate-y-full'
                } ${
                    scrolled ? 'h-16 backdrop-blur-md bg-cbackground-light/80 shadow-lg shadow-black/5' : 'h-20'
                }`}
            >
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link 
                        to="/"
                        className="flex items-center space-x-2"
                    >
                        <div className="bg-gradient-to-r from-cprimary-light to-csecondary-light rounded-lg w-9 h-9 flex items-center justify-center text-white font-bold text-lg">
                            <img src={logo} alt="Aeri Logo" className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-cprimary-light to-csecondary-light bg-clip-text text-transparent">
                            Aeri
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center">
                        <ul className="flex space-x-1">
                            <NavigationItem href="/" label="Home" />
                            <NavigationItem href="/commands" label="Commands" />
                            <NavigationItem href="/status" label="Status" />
                        </ul>
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center space-x-3">
                        
                        <SocialButton 
                            href="https://github.com/tomosfps/aeri"
                            icon={<GithubIcon className="h-5 w-5" />}
                            label="GitHub"
                        />
                        
                        <SocialButton 
                            href="https://discord.gg/kKqsaKYUfz"
                            icon={<DiscordIcon className="h-5 w-5" />}
                            label="Discord"
                        />

                        {/* Burger Menu toggle */}
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="lg:hidden bg-cbackground-light border border-cprimary-light/20 text-cprimary-light hover:bg-cprimary-light/10 transition-colors"
                                >
                                    <Suspense fallback={<LoadingSpinner fullScreen={false} message="Loading Icon..." />}>
                                        <MenuIcon className="h-5 w-5" />
                                    </Suspense>
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-full sm:w-80 border-l border-cprimary-light/20 bg-cbackground-light">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center mb-8 mt-4">
                                        <div className="bg-gradient-to-r from-cprimary-light to-csecondary-light rounded-lg w-10 h-10 flex items-center justify-center text-white font-bold text-xl">
                                            <img src={logo} alt="Aeri Logo" className="h-6 w-6" />
                                        </div>
                                        <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-cprimary-light to-csecondary-light bg-clip-text text-transparent">
                                            Aeri
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-6 flex-1">
                                        <div className="space-y-2">
                                            <h3 className="text-xs uppercase tracking-wider text-ctext-light/50 font-medium ml-4">Navigation</h3>
                                            <MobileNavItem href="/" label="Home" onClick={toggleSheet} />
                                            <MobileNavItem href="/commands" label="Commands" onClick={toggleSheet} />
                                            <MobileNavItem href="/status" label="Status" onClick={toggleSheet} />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-xs uppercase tracking-wider text-ctext-light/50 font-medium ml-4">Support</h3>
                                            <MobileNavItem href="https://discord.gg/kKqsaKYUfz" label="Discord Server" onClick={toggleSheet} />
                                            <MobileNavItem href="https://github.com/tomosfps/aeri" label="GitHub Repository" onClick={toggleSheet} />
                                        </div>
                                    </div>
                                    
                                    <div className="py-4 mt-auto">
                                        <Link
                                            to="https://discord.com/oauth2/authorize?client_id=795916241193140244"
                                            className="flex items-center justify-center w-full py-3 rounded-lg bg-gradient-to-r from-cprimary-light to-csecondary-light text-white font-medium"
                                            onClick={toggleSheet}
                                            target="_blank"
                                        >
                                            <Suspense fallback={<LoadingSpinner fullScreen={false} message="Loading Icon..." />}>
                                                <DiscordIcon className="h-5 w-5 mr-2" />
                                            </Suspense>
                                            Add to Discord
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
        </>
    );
}

function MenuIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
    )
}

function GithubIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <image href={github} width="24" height="24" />
        </svg>
    )
}

function DiscordIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <image href={discord} width="24" height="24" />
        </svg>
    )
}