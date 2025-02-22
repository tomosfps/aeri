import { Footer, FooterBottom } from "@/components/ui/footer";

export default function FooterSection() {
  return (
    <footer className="w-full px-4">
      <div className="mx-auto max-w-container">
        <Footer className="pt-0">
          <FooterBottom className="mt-0 flex flex-col items-center gap-4 sm:flex-col md:flex-row text-ctext-light">
            <div className="flex flex-row items-center gap-4">
              <p>© 2025 Aeri. All rights reserved</p>
              </div>
            <div className="flex items-center gap-4">
              <a className="hover:text-cprimary-light ">Sign In</a> <a className="hover:text-cprimary-light">Sign Out</a>|
              <a href="privacy" className="hover:text-cprimary-light">Privacy Policy</a>
              <a href="terms" className="hover:text-cprimary-light">Terms of Service</a>
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}