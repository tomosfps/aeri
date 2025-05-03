import { Link } from 'react-router-dom';
import '~/styles/footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      
      <div className="footer-decoration-top">
        <div className="footer-wave"></div>
      </div>
      
      <div className="footer-container">
        <div className="footer-section footer-brand">
          <h3 className="footer-title">
            <span className="kawaii-letter">A</span>
            <span className="kawaii-letter">e</span>
            <span className="kawaii-letter">r</span>
            <span className="kawaii-letter">i</span>
          </h3>
        </div>
        
        <div className="footer-section">
          <h4>Links <span className="kawaii-emoji">🔗</span></h4>
          <ul className="footer-links">
            <li><Link to="/" className="footer-link-item">Home</Link></li>
            <li><Link to="/privacy" className="footer-link-item">Privacy Policy</Link></li>
            <li><Link to="/terms" className="footer-link-item">Terms of Service</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Connect <span className="kawaii-emoji">🌟</span></h4>
          <div className="footer-social">
            <a 
              href="https://discord.gg/invite" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon"
            >
              <span>Discord</span>
            </a>
            <a 
              href="https://github.com/aeri-bot" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon"
            >
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {currentYear} Aeri • Made with <span className="footer-heart">💖</span> by anime fans, for anime fans <br/> Not affiliated with AniList or Discord</p>
      </div>
    </footer>
  );
}