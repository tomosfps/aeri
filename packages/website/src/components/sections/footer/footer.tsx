import { Footer, FooterBottom } from "@/components/ui/footer";

export default function FooterSection() {
  return (
    <footer className="w-full bg-background px-4">
      <div className="mx-auto max-w-container">
        <Footer className="pt-0">
          <FooterBottom className="mt-0 flex flex-col items-center gap-4 sm:flex-col md:flex-row text-whiteText dark:text-darkText">
            <div>© 2025 Aeri. All rights reserved</div>
            <div className="flex items-center gap-4">
              <a href="#">Sign In</a> <a href="#">Sign Out</a>|
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}
