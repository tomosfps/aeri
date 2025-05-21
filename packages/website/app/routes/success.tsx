import { Link } from "react-router-dom";
import { useMemo } from 'react';
import '~/styles/success.css';
import { SUPPORT_SERVER_URL } from "~/utils/constant";

export function meta() {
  return [{ title: "Account Linked | Aeri" }];
}

export default function Success() {
  const sparkles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 3 + 2}s`,
      }
    }));
  }, []);

  return (
    <div className="success-page">
      <div className="success-decoration">
        <div className="pastel-clouds">
          <div className="pastel-cloud cloud-1"></div>
          <div className="pastel-cloud cloud-2"></div>
          <div className="pastel-cloud cloud-3"></div>
        </div>
        
        {sparkles.map(sparkle => (
          <div 
            key={`sparkle-${sparkle.id}`}
            className="sparkle"
            style={sparkle.style}
          ></div>
        ))}
      </div>

      <div className="success-card">
        <div className="success-mascot">
          <div className="mascot-container">
            <img src="/images/aeri_jumping.png" alt="Happy Aeri-chan" className="mascot-image" />
          </div>
          <div className="mascot-speech">
            <div className="speech-bubble">
              <p>Yay! <span className='linked-text'>Account linked successfully!</span></p>
            </div>
          </div>
        </div>

        <div className="success-content">
          <div className="success-message">
            <p>Your account has been successfully linked. You can now use all the features
            of Aeri with your AniList data!</p>
          </div>
          
          <div className="features-box">
            <h2 className="features-title">What you can do now:</h2>
            <ul className="features-list">
              <li className="feature-item">
                <span className="feature-dot">•</span>
                Track your anime and manga progress
              </li>
              <li className="feature-item">
                <span className="feature-dot">•</span>
                Update your lists directly from Discord
              </li>
              <li className="feature-item">
                <span className="feature-dot">•</span>
                Compare your tastes with other users
              </li>
            </ul>
          </div>
          
          <div className="success-actions">
            <Link to="/" className="kawaii-button primary">
              <span className="button-emoji">🏠</span> Go Home
            </Link>
          </div>
        </div>
      </div>
      
      <div className="success-footer">
        <p>Type <span className="help-tip">/help</span> in Discord to see all available commands.</p>
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