import { Link } from 'react-router-dom';
import '~/styles/hero.css';
import '~/styles/animations.css';

export default function Hero() {

  return (
    <section className="hero-section">
      <div className="hero-decoration-top"></div>
      
      <div className="hero-background">
        <div className="hero-circles">
          <div className="hero-circle circle-1"></div>
          <div className="hero-circle circle-2"></div>
          <div className="hero-circle circle-3"></div>
        </div>
        <div className="hero-sparkles">
          {Array(20).fill(0).map((_, i) => (
            <div 
              key={i}
              className="hero-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.7 + 0.3
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="hero-content-wrapper">
        <div className="hero-content">
          <h1 className="hero-title">
            <div className="aeri-name-wrapper">
              <span className="kawaii-letter">A</span>
              <span className="kawaii-letter">e</span>
              <span className="kawaii-letter">r</span>
              <span className="kawaii-letter">i</span>
              <div className="nav-sparkle-burst">✦</div>
            </div>
            <span className="hero-title-main">Your Anime Companion</span>
          </h1>
          <p className="hero-description">
            Discover, track, and share your favorite anime with a powerful Discord bot
            built for true anime enthusiasts.
          </p>
          <div className="hero-cta">
            <Link to="/invite" className="cta-button primary">
              <span className="button-icon">✨</span> Add to Discord
            </Link>
            <Link to="/commands" className="cta-button secondary">
              <span className="button-icon">📚</span> Explore Features
            </Link>
          </div>
        </div>
        
        <div className="hero-mascot-container">
          <div className="hero-mascot">
            <img src="/images/aeri_jumping.png" alt="Aeri mascot" />
          </div>
        </div>
      </div>
      
      <div className="hero-decoration-bottom"></div>
    </section>
  );
}