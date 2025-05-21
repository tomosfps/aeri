import { Link } from "react-router-dom";
import { useMemo } from 'react';
import '~/styles/fail.css';
import { SUPPORT_SERVER_URL } from "~/utils/constant";

export function meta() {
  return [{ title: "Account Link Failed | Aeri" }];
}

export default function Fail() {
  const droplets = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${Math.random() * 4 + 3}s`,
        transform: `scale(${Math.random() * 0.5 + 0.7})`,
      }
    }));
  }, []);

  return (
    <div className="fail-page">
      <div className="fail-decoration">
        <div className="pastel-clouds">
          <div className="pastel-cloud cloud-1"></div>
          <div className="pastel-cloud cloud-2"></div>
          <div className="pastel-cloud cloud-3"></div>
        </div>
        
        {droplets.map(droplet => (
          <div 
            key={`droplet-${droplet.id}`}
            className="raindrops"
            style={droplet.style}
          ></div>
        ))}
      </div>

      <div className="fail-card">
        <div className="fail-mascot">
          <div className="mascot-container">
            <img src="/images/aeri_sad.png" alt="Sad Aeri-chan" className="mascot-image" />
          </div>
          <div className="mascot-speech">
            <div className="speech-bubble">
              <p>Oh no! <span className='failed-text'>Account linking failed</span></p>
            </div>
          </div>
        </div>

        <div className="fail-content">
          <div className="fail-message">
            <p>Something went wrong while trying to link your account. Don't worry, this is
            usually just a temporary issue that can be easily fixed!</p>
          </div>
          
          <div className="help-box">
            <h2 className="help-title">What you can do:</h2>
            <ul className="help-list">
              <li className="help-item">
                <span className="help-dot">•</span>
                Try linking your account again
              </li>
              <li className="help-item">
                <span className="help-dot">•</span>
                Make sure your AniList profile is public
              </li>
              <li className="help-item">
                <span className="help-dot">•</span>
                Join our support server for assistance
              </li>
            </ul>
          </div>
          
          <div className="fail-actions">
            <Link to="/" className="kawaii-button primary">
              <span className="button-emoji">🏠</span> Go Home
            </Link>
            <a 
              href="https://discord.gg/kKqsaKYUfz"
              target="_blank" 
              rel="noopener noreferrer"
              className="kawaii-button secondary">
              <span className="button-emoji">💬</span> Get Support
            </a>
          </div>
        </div>
      </div>
      
      <div className="fail-footer">
        <p>Need help? Type <span className="help-tip">/help</span> in Discord</p>
        <a
          href={SUPPORT_SERVER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="discord-link"
        >
          <svg className="discord-icon" viewBox="0 0 127.14 96.36" fill="currentColor">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
          Join our Discord
        </a>
      </div>
    </div>
  );
}