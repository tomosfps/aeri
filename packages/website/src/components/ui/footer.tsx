import { NavLink as Link } from "react-router-dom";

export default function FooterSection() {
  return (
    <footer className="border-t border-white/10 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <h3 className="text-2xl font-bold text-cprimary-light mb-2">Aeri</h3>
          <p className="text-sm text-ctext-light/60">Your Anime & Manga Discord Companion</p>
         </div>
                        
        <div className="flex space-x-6">
            <Link to="/commands" className="text-ctext-light/70 hover:text-cprimary-light transition-colors" onClick={() => window.scrollTo(0, 0)}>Commands</Link>
            <Link to="/privacy" className="text-ctext-light/70 hover:text-cprimary-light transition-colors" onClick={() => window.scrollTo(0, 0)}>Privacy</Link>
            <Link to="/terms-of-service" className="text-ctext-light/70 hover:text-cprimary-light transition-colors" onClick={() => window.scrollTo(0, 0)}>Terms</Link>
            <Link to="https://discord.gg/kKqsaKYUfz" className="text-ctext-light/70 hover:text-cprimary-light transition-colors" onClick={() => window.scrollTo(0, 0)}>Support</Link>
        </div>
      </div>
                    
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-sm text-ctext-light/50">
        <p>© {new Date().getFullYear()} Aeri. Not affiliated with AniList or Discord</p>
      </div>
    </footer>
  );
}