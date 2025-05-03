import { Link } from 'react-router-dom';
import '~/styles/features.css';
import DiscordEmbed from '../common/Embed';
import { useEffect, useRef, useState } from 'react';
import { embedFields } from '~/utils/embed';

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<HTMLDivElement[]>([]);
  
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      const successElem = document.getElementById(`copy-success-${index}`);
      if (successElem) {
        successElem.classList.add('active');
        
        setTimeout(() => {
          successElem.classList.remove('active');
        }, 2000);
      }
    });
  };
  const [hearts, setHearts] = useState<Array<{id: number, style: React.CSSProperties}>>([]);
  
  useEffect(() => {
    const heartCount = 12;
    const newHearts = [];
    
    for (let i = 0; i < heartCount; i++) {
      newHearts.push({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 20}s`,
          animationDuration: `${10 + Math.random() * 15}s`
        }
      });
    }
    
    setHearts(newHearts);
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('feature-in-view');
          } else {
            entry.target.classList.remove('feature-in-view');
          }
        });
      },
      { threshold: 0.1 }
    );

    featureRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => {
      featureRefs.current.forEach((item) => {
        if (item) observer.unobserve(item);
      });
    };
  }, []);

  return (
    <section className="features-section" ref={sectionRef}>
      {/* Background decorations */}
      <div className="features-decoration decoration-1"></div>
      <div className="features-decoration decoration-2"></div>
      <div className="features-cloud cloud-1"></div>
      <div className="features-cloud cloud-2"></div>
      
      {/* Floating hearts */}
      <div className="feature-floating-hearts">
        {hearts.map(heart => (
          <span 
            key={heart.id} 
            className="feature-floating-heart" 
            style={heart.style}
          >
            {heart.id % 3 === 0 ? '♡' : heart.id % 3 === 1 ? '♥' : '💕'}
          </span>
        ))}
      </div>
      
      <div className="features-title-container">
        <h2 className="features-title">
          <span className="kawaii-letter">F</span>
          <span className="kawaii-letter">e</span>
          <span className="kawaii-letter">a</span>
          <span className="kawaii-letter">t</span>
          <span className="kawaii-letter">u</span>
          <span className="kawaii-letter">r</span>
          <span className="kawaii-letter">e</span>
          <span className="kawaii-letter">s</span>
        </h2>
        <p className="features-subtitle">
          Meet your new anime companion with these helpful features
        </p>
      </div>
      
      <div className="features-showcase">
        {embedFields.map((feature, index) => (
          <div 
            key={index} 
            className={`feature-showcase-item ${feature.align === 'left' ? 'reverse' : ''}`}
            ref={el => { if (el) featureRefs.current[index] = el }}
            style={{ marginBottom: '8rem', position: 'relative' }}
          >
            <div className="feature-showcase-image-container">
              <div className="feature-emoji-decoration">{feature.emoji}</div>
              <div className="feature-larger-embed">
                <DiscordEmbed
                  title={feature.embed.title}
                  thumbnail={feature.embed.thumbnail}
                  fields={feature.embed.fields}
                  color={feature.embed.color}
                  footer={feature.embed.footer}
                  type={feature.embed.type}
                />
              </div>
            </div>
            
            <div className="feature-showcase-content">
              <h3 className="feature-showcase-title">{feature.title}</h3>
              <p className="feature-showcase-description">{feature.description}</p>
              <div className="feature-showcase-command">
                <code onClick={() => copyToClipboard(feature.command, index)}>
                  {feature.command}
                  <button 
                    className="copy-button" 
                    title="Copy command"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(feature.command, index);
                    }}
                  >
                    📋
                  </button>
                </code>
                <div id={`copy-success-${index}`} className="copy-success">
                  Command copied! ✨
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="features-cta">
        <Link to="/commands" className="features-button">
          <span>Explore All Commands</span>
          <div className="button-sparkle"></div>
        </Link>
      </div>
    </section>
  );
}