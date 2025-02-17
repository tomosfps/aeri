import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FaGithub } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaAppleAlt } from "react-icons/fa";
import { CiLight } from "react-icons/ci";
import { useEffect } from "react";

import { NavLink as Link, Outlet } from "react-router-dom";
import FooterSection from "../sections/footer/default";

export default function Navigation() {
    useEffect(() => {
        loadTheme();
    }, []);

    return (
        <>
            <header className="flex h-16 w-full items-center border-b border-gray-200 dark:border-gray-800">
                <div className="mx-auto max-w-7xl flex w-full items-center px-4 md:px-6">
                    <Link to="/" className="mr-6 flex items-center" prefetch="none">
                        <FaAppleAlt className="h-6 w-6 text-whiteText hover:text-whiteAccent dark:text-darkText dark:hover:text-darkAccent transition-colors duraction-300" />
                        <span className="sr-only">Aeri</span>
                    </Link>
                    <nav className="hidden lg:flex items-center space-x-6">
                        <Link to="/" className="text-sm font-medium hover:underline underline-offset-4" prefetch="none">
                            Home
                        </Link>
                        <Link
                            to="commands"
                            className="text-sm font-medium hover:underline underline-offset-4"
                            prefetch="none"
                        >
                            Commands
                        </Link>
                        <Link
                            to="https://github.com/ehiraa/aeri"
                            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium text-whiteText dark:text-darkText shadow transition-colors duraction-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-darkPrimary  dark:hover:bg-darkAccent hover:bg-whiteAccent dark:focus-visible:ring-gray-300"
                            prefetch="none"
                            target="_blank"
                        >
                            <FaGithub className="text-darkBackground dark:text-whiteBackground" />
                        </Link>
                        <Link
                            to="#"
                            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium text-whiteText dark:text-darkText shadow transition-colors duraction-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-darkSecondary  dark:hover:bg-darkAccent hover:bg-whiteAccent dark:focus-visible:ring-gray-300"
                            prefetch="none"
                            target="_blank"
                        >
                            <FaDiscord className="text-darkBackground dark:text-whiteBackground" />
                        </Link>
                    </nav>
                    <div className="ml-auto flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="text-whiteText bg-whiteSecondaryhover:bg-whiteAccent dark:text-darkText dark:bg-darkSecondary dark:hover:bg-darkAccent"
                            onClick={toggleTheme}
                            >
                            <CiLight className="h-6 w-6" />
                            <span className="sr-only">Toggle Theme</span>
                        </Button>
                        <Link
                            to="#"
                            className="inline-flex h-9 items-center justify-center rounded-md bg-whitePrimary px-4 py-2 text-sm font-medium text-whiteBackground shadow transition-colors hover:bg-whiteAccent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-darkPrimary dark:text-darkText dark:hover:bg-darkAccent dark:focus-visible:ring-gray-300"
                            prefetch="none"
                        >
                            Link Anilist
                        </Link>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="lg:hidden bg-whiteSecondary text-whiteText hover:bg-whiteAccent dark:text-darkText dark:bg-darkSecondary dark:hover:bg-darkAccent">
                                    <GiHamburgerMenu className="h-6 w-6" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <div className="grid gap-6 p-6">
                                    <Link
                                        to="/"
                                        className="text-sm font-medium hover:underline underline-offset-4 text-whiteText dark:text-darkText"
                                        prefetch="none"
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="commands"
                                        className="text-sm font-medium hover:underline underline-offset-4 text-whiteText dark:text-darkText"
                                        prefetch="none"
                                    >
                                        Commands
                                    </Link>
                                    <div className="flex space-x-6">
                                        <Link
                                            to="https://github.com/ehiraa/aeri"
                                            target="_blank"
                                            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium text-whiteText dark:text-darkText shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-darkPrimary  dark:hover:bg-darkAccent dark:focus-visible:ring-gray-300"
                                            prefetch="none"
                                        >
                                            <FaGithub className="text-darkBackground dark:text-whiteBackground" />
                                        </Link>
                                        <Link
                                            to="#"
                                            target="_blank"
                                            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium text-whiteText dark:text-darkText shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-darkSecondary  dark:hover:bg-darkAccent dark:focus-visible:ring-gray-300"
                                            prefetch="none"
                                        >
                                            <FaDiscord className="text-darkBackground dark:text-whiteBackground" />
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <Outlet />

            <FooterSection />
        </>
    );
}

function toggleTheme() {
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('dark')) {
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}


function loadTheme() {
    const htmlElement = document.documentElement;
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }
}