import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

export default function Fail() {
    return (
        <main className="min-h-dvh w-full flex flex-col items-center py-24 px-4 bg-cbackground-light">
            <div className="max-w-2xl mx-auto w-full">
                <div className="bg-cbackground-light rounded-xl shadow-sm p-8 md:p-12 text-center">
                    {/* Error Header */}
                    <div className="relative h-36 md:h-40 mb-6 md:mb-8">
                        <div className="text-7xl md:text-8xl font-bold tracking-tighter leading-none text-red-500/10 absolute inset-0 flex items-center justify-center">
                            Error
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="h-28 w-28 md:h-40 md:w-40 text-red-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" />
                                <path
                                    d="M8.5 9C8.5 8.17157 9.17157 7.5 10 7.5C10.8284 7.5 11.5 8.17157 11.5 9C11.5 9.82843 10.8284 10.5 10 10.5C9.17157 10.5 8.5 9.82843 8.5 9Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M12.5 9C12.5 8.17157 13.1716 7.5 14 7.5C14.8284 7.5 15.5 8.17157 15.5 9C15.5 9.82843 14.8284 10.5 14 10.5C13.1716 10.5 12.5 9.82843 12.5 9Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M9 16C9.5 14.5 10.8333 13.5 12 13.5C13.1667 13.5 14.5 14.5 15 16"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold mb-4 text-cprimary-light">Login Failed</h1>

                    <div className="mb-8 px-4">
                        <p className="text-base md:text-lg text-ctext-light/80">
                            An error occurred while trying to link your account. This could be due to an expired
                            session or authentication issues.
                        </p>
                    </div>

                    {/* Suggestions Section */}
                    <div className="mb-8 bg-cprimary-light/5 p-4 rounded-lg inline-block">
                        <h2 className="text-lg font-medium text-cprimary-light mb-2">You can try:</h2>
                        <ul className="text-sm text-ctext-light space-y-1 text-left">
                            <li className="flex items-center">
                                <span className="text-csecondary-light mr-2">•</span>
                                Attempting to login again
                            </li>
                            <li className="flex items-center">
                                <span className="text-csecondary-light mr-2">•</span>
                                Clearing your browser cookies
                            </li>
                            <li className="flex items-center">
                                <span className="text-csecondary-light mr-2">•</span>
                                Waiting a few minutes before trying again
                            </li>
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/">
                            <Button
                                variant="default"
                                className="bg-cprimary-light hover:bg-cprimary-light/50 text-black flex items-center gap-2 px-6 py-2 h-11 w-full"
                            >
                                <HomeIcon className="h-4 w-4" />
                                Go Home
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-ctext-light/60">
                    <p>If you continue experiencing issues, please contact our support team.</p>
                    <a
                        href="https://discord.gg/kKqsaKYUfz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-csecondary-light hover:underline mt-2"
                    >
                        <svg className="h-4 w-4 mr-1" viewBox="0 0 127.14 96.36" fill="currentColor">
                            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                        </svg>
                        Join our Discord
                    </a>
                </div>
            </div>
        </main>
    );
}