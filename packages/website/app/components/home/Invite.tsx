import { Link } from 'react-router-dom';
import '~/styles/invite.css';
import '~/styles/animations.css';
import { useEffect, useState, useRef, useMemo } from 'react';
import Embed from '../common/Embed';
import { BOT_INVITE_URL } from '~/utils/constant';
import { botCommands, embedFields } from '~/utils/invite';

export default function Invite() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const particles = useMemo(() => {
    const particleCount = 40;
    const newParticles: Array<{
      id: number;
      type: 'sparkle' | 'star' | 'dot';
      style: React.CSSProperties;
    }> = [];
    
    for (let i = 0; i < particleCount; i++) {
      const type = Math.random() > 0.7 
        ? 'sparkle' 
        : Math.random() > 0.5 
          ? 'star' 
          : 'dot';
      
      newParticles.push({
        id: i,
        type,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${6 + Math.random() * 10}s`,
          opacity: type === 'dot' ? 0.2 + Math.random() * 0.3 : 0.5 + Math.random() * 0.5,
          transform: `scale(${0.5 + Math.random() * 1.5})`,
        }
      });
    }
    
    return newParticles;
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      className={`invite-section ${isVisible ? 'visible' : ''}`} 
      id="invite" 
      ref={sectionRef}
    >
      <div className="invite-bg-gradient"></div>
      <div className="invite-bg-pattern"></div>
      
      <div className="invite-particles-container">
        {particles.map(particle => (
          <div
            key={particle.id}
            className={`invite-particle invite-${particle.type}`}
            style={particle.style}
          />
        ))}
      </div>
      
      <div className="invite-wave invite-wave-top"></div>
      <div className="invite-wave invite-wave-bottom"></div>
      
      <div className="invite-container">
        <div className="invite-content">
          <h2 className="invite-heading animate-in">
            Add <span className="aeri-name-wrapper">
              <span className="kawaii-letter">A</span>
              <span className="kawaii-letter">e</span>
              <span className="kawaii-letter">r</span>
              <span className="kawaii-letter">i</span>
              <div className="nav-sparkle-burst">✦</div>
            </span> to your <span className="highlight">Discord</span>
          </h2>
          
          <p className="invite-description animate-in">
            Enhance your server with comprehensive anime tracking, Anilist integration, 
            and powerful anime & manga search features.
          </p>
          
          <div className="invite-commands animate-in">
            <h3 className="commands-title">Popular Commands</h3>
            <div className="commands-list">
              {botCommands.map((cmd, index) => (
                <div key={index} className="command-item">
                  <span className="command-name">{cmd.command}</span>
                  <span className="command-desc">{cmd.description}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Link to={BOT_INVITE_URL} className="kawaii-button large-button animate-in">
            <span className="button-icon">🤖</span>
            <span className="button-text">Add to Discord</span>
            <span className="button-shine"></span>
          </Link>
        </div>
        
        <div className="invite-preview animate-in">
          <div className="discord-embed-showcase">
            <Embed
              title="Aeri Bot"
              description="Your ultimate anime companion! Track your watching history, discover new anime and manga, and connect with other fans."
              thumbnail="/images/logo.png"
              fields={embedFields}
              color="var(--pastel-pink)"
              type="user"
              footer="Add Aeri to enhance your Discord experience and vote for her to help her grow!"
            />
            
            <div className="preview-decoration bot-tag">
              <span className="bot-status online"></span>
              <span className="bot-name">Aeri</span>
            </div>
            
            <div className="preview-decoration command-bubble">
              <span className="command-text">vote</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}