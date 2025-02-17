import { Footer, FooterBottom } from "@/components/ui/footer";

export default function FooterSection() {
  return (
    <footer className="w-full bg-background px-4">
      <div className="mx-auto max-w-container">
        <Footer className="pt-0">
          <FooterBottom className="mt-0 flex flex-col items-center gap-4 sm:flex-col md:flex-row text-whiteText dark:text-darkText">
            <div>© 2025 Aeri. All rights reserved</div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-whiteAccent dark:hover:text-darkAccent transition duration-300">Log in</a> <a href="#" className="hover:text-whiteAccent dark:hover:text-darkAccent transition duration-300">Log out</a>|
              <a href="#" className="hover:text-whiteAccent dark:hover:text-darkAccent transition duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-whiteAccent dark:hover:text-darkAccent transition duration-300">Terms of Service</a>
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}
