import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import '~/styles/404.css';

export function meta() {
  return [{ title: "404 | Aeri" }];
}

export default function NotFound() {
  const petals = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${Math.random() * 10 + 15}s`,
        transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.4 + 0.8})`,
      }
    }));
  }, []);

  return (
    <div className="kawaii-404">
      <div className="kawaii-decoration">
        <div className="pastel-clouds">
          <div className="pastel-cloud cloud-1"></div>
          <div className="pastel-cloud cloud-2"></div>
          <div className="pastel-cloud cloud-3"></div>
        </div>
        
        {petals.map(petal => (
          <div 
            key={`petal-${petal.id}`}
            className="cherry-petal"
            style={petal.style}
          ></div>
        ))}
      </div>

      <div className="kawaii-card">
        <div className="kawaii-mascot">
          <div className="mascot-container">
            <img src="/images/aeri_confused.png" alt="Confused Aeri-chan" className="mascot-image" />
          </div>
          <div className="mascot-speech">
            <div className="speech-bubble">
              <p>Oopsie! <span className='page-not-found'>Page not found</span></p>
            </div>
          </div>
        </div>

        <div className="kawaii-content">
          <h1 className="kawaii-title">
            <span className="big-text">4</span>
            <span className="big-zero">0</span>
            <span className="big-text">4</span>
          </h1>
          
          <div className="kawaii-message">
            <p>Oh no! It seems like this page has gone on an adventure to another dimension!</p>
          </div>
          
          <div className="kawaii-actions">
            <Link to="/" className="kawaii-button primary">
              <span className="button-emoji">🏠</span> Home
            </Link>
            <Link to="/commands" className="kawaii-button secondary">
              <span className="button-emoji">✨</span> Commands
            </Link>
          </div>
        </div>
      </div>
      
      <div className="kawaii-footer">
        <div className="footer-stars">
          <span className="star-item">★</span>
          <span className="star-item">☆</span>
          <span className="star-item">★</span>
        </div>
      </div>
    </div>
  );
}
