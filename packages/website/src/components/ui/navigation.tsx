/**
 * v0 by Vercel.
 * @see https://v0.dev/t/gJyKNmKLLzv
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { NavLink as Link, Outlet } from "react-router-dom"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { FaGithub } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa6";

export default function Navigation() {
  return (
    <>
      <header className="flex h-16 w-full items-center border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl flex w-full items-center px-4 md:px-6">
          <Link to="/" className="mr-6 flex items-center" prefetch="none">
            <MountainIcon className="h-6 w-6" />
            <span className="sr-only">Aeri</span>
          </Link>
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:underline underline-offset-4" prefetch="none">
              Home
            </Link>
            <Link to="about" className="text-sm font-medium hover:underline underline-offset-4" prefetch="none">
              About
            </Link>
            <Link to="commands" className="text-sm font-medium hover:underline underline-offset-4" prefetch="none">
              Commands
            </Link>
            <Link
                to="https://github.com/ehiraa/aeri"
                className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium text-black shadow transition-colors  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                prefetch="none"
                target="_blank"
              >
                <FaGithub/>
              </Link>
              <Link
                to="#"
                className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium text-black shadow transition-colors  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                prefetch="none"
                target="_blank"
              >
                <FaDiscord/>
              </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <Link
              to="#"
              className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
              prefetch="none"
            >
              Login
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="grid gap-6 p-6">
                  <Link to="/" className="text-sm font-medium hover:underline underline-offset-4" prefetch="none">
                    Home
                  </Link>
                  <Link to="about" className="text-sm font-medium hover:underline underline-offset-4" prefetch="none">
                    About
                  </Link>
                  <Link to="commands" className="text-sm font-medium hover:underline underline-offset-4" prefetch="none">
                    Commands
                  </Link>
                  <div className="flex space-x-6">
                    <Link to="https://github.com/ehiraa/aeri" target="_blank" className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium text-black shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300" prefetch="none">
                      < FaGithub/>
                    </Link>
                    <Link to="#" target="_blank" className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium text-black shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300" prefetch="none">
                      < FaDiscord/>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <Outlet />
    </>
  )
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


function MountainIcon(props: any) {
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
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}