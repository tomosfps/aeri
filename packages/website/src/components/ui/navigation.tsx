import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FaGithub } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import { CgAlignBottom } from "react-icons/cg";
import { useEffect, useState } from "react";
import { NavLink as Link } from "react-router-dom";

export default function Navigation() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    function toggleSheet() {
        setIsSheetOpen(!isSheetOpen);
    }

    useEffect(() => {
        loadTheme();
    }, []);

    return (
        <>
            <header className="sticky top-0 flex w-full h-24 items-center z-50">
                <div className="mx-4 lg:mx-6 xl:mx-8 2xl:mx-auto max-w-7xl flex w-full items-center border-2 rounded-lg p-4 my-8 bg-white">
                    <Link to="/" className="mr-6 flex items-center" prefetch="none">
                        <CgAlignBottom className="h-6 w-6" />
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
                            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium shadow"
                            prefetch="none"
                            target="_blank"
                        >
                            <FaGithub className="" />
                        </Link>
                        <Link
                            to="#"
                            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium shadow"
                            prefetch="none"
                            target="_blank"
                        >
                            <FaDiscord className=""/>
                        </Link>
                    </nav>
                    <div className="ml-auto flex items-center space-x-4">
                        <Link
                            to="#"
                            className="inline-flex h-9 items-center justify-center rounded-md bg-whitePrimary px-4 py-2 text-sm font-medium text-whiteBackground shadow"
                            prefetch="none"
                        >
                            Sign in
                        </Link>

                        {/* Burger Menu toggle */}
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="lg:hidden bg-whiteSecondary text-whiteText">
                                    <GiHamburgerMenu className="h-6 w-6" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-full">
                                <div className="grid gap-6 p-6 text-4xl font-bold">
                                    <Link
                                        to="/"
                                        className="hover:underline underline-offset-4 text-whiteText dark:text-darkText"
                                        prefetch="none"
                                        onClick={toggleSheet}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="commands"
                                        className="hover:underline underline-offset-4 text-whiteText dark:text-darkText"
                                        prefetch="none"
                                        onClick={toggleSheet}
                                    >
                                        Commands
                                    </Link>
                                    <div className="flex space-x-6">
                                        <Link
                                            to="https://github.com/ehiraa/aeri"
                                            target="_blank"
                                            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium shadow"
                                            prefetch="none"
                                        >
                                            <FaGithub className="" />
                                        </Link>
                                        <Link
                                            to="#"
                                            target="_blank"
                                            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium shadow"
                                            prefetch="none"
                                        >
                                            <FaDiscord className="" />
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

function loadTheme() {
    const htmlElement = document.documentElement;
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }
}
