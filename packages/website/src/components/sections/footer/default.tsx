import { Footer, FooterBottom } from "@/components/ui/footer";
import { lazy, Suspense } from "react";

const icon = {
    star: lazy(() => import("react-icons/fa").then((module) => ({ default: module.FaStar } as const))),
}

export default function FooterSection() {
  return (
    <footer className="w-full px-4">
      <div className="mx-auto max-w-container">
        <Footer className="pt-0">
          <FooterBottom className="mt-0 flex flex-col items-center gap-4 sm:flex-col md:flex-row text-ctext-light dark:text-ctext-dark">
            <div className="flex flex-row items-center gap-4">
              <p>© 2025 Aeri. All rights reserved</p>
              <button onClick={toggleTheme} className="text-[12px] leading-4 font-normal" title="Theme Toggler">
                <Suspense fallback={<div>Loading...</div>}>
                  <icon.star className="h-4 w-4" />
                </Suspense>
                </button>
              </div>
            <div className="flex items-center gap-4">
              <a href="login" className="hover:text-cprimary-light dark:hover:text-cprimary-dark">Sign In</a> <a href="logout" className="hover:text-cprimary-light dark:hover:text-cprimary-dark">Sign Out</a>|
              <a href="privacy" className="hover:text-cprimary-light dark:hover:text-cprimary-dark">Privacy Policy</a>
              <a href="terms" className="hover:text-cprimary-light dark:hover:text-cprimary-dark">Terms of Service</a>
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
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