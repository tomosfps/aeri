import { Link, useLocation } from 'react-router-dom';
import '~/styles/navigation.css';
import { useState, useEffect, useRef } from 'react';

export default function Navigation() {
  const [mobileMenu, setMenu] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenu(!mobileMenu);
  }

  const closeMenu = () => {
    setMenu(false);
  }

  const isActive = (path: string) => { return location.pathname === path };

  useEffect(() => {
    if (mobileMenu) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [mobileMenu]);

  const handleOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.nav-right') && !target.closest('.nav-button')) {
      closeMenu();
    }
  }

  const handleLinkClick = () => {
    closeMenu();
  }

  const handleLogoHover = () => {
    setLogoHovered(true);
    setTimeout(() => setLogoHovered(false), 1000);
  }
  
  return (
    <nav className="nav" ref={navRef}>
      <div className="nav-container">
        <Link 
          to="" // Blank is index route
          className='nav-left'
          onMouseEnter={handleLogoHover}
        >
            <img 
              src="/images/logo.png" 
              alt="Aeri Logo" 
              className={`nav-logo-img ${logoHovered ? 'logo-bounce' : ''}`}
            />
            <span className='nav-logo-text'>
              <span className="kawaii-letter">A</span>
              <span className="kawaii-letter">e</span>
              <span className="kawaii-letter">r</span>
              <span className="kawaii-letter">i</span>
            </span>
          {logoHovered && <div className="nav-sparkle-burst">✦</div>}
        </Link>

        <div className={`nav-overlay ${mobileMenu ? 'nav-overlay-active' : ''}`}></div>

        <div className={`nav-right ${mobileMenu ? 'nav-right-active' : ''}`}>
          <Link 
            to="/" 
            onClick={handleLinkClick}
            className={isActive('/') ? 'active' : ''}
          >
            <span className="nav-link-icon">🏠</span> Home
          </Link>
          <Link 
            to="/commands" 
            onClick={handleLinkClick}
            className={isActive('/commands') ? 'active' : ''}
          >
            <span className="nav-link-icon">📚</span> Commands
          </Link>
          <Link 
            to="/status" 
            onClick={handleLinkClick}
            className={isActive('/status') ? 'active' : ''}
          >
            <span className="nav-link-icon">📊</span> Status
          </Link>
          <Link 
            to="/invite" 
            onClick={handleLinkClick} 
            className={`nav-special-link ${isActive('/invite') ? 'active' : ''}`}
          >
            <span className="nav-link-icon">💖</span> Invite Aeri
          </Link>
        </div>

        <button className="nav-button" type="button" onClick={toggleMenu} aria-label="Toggle navigation menu">
          {mobileMenu ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu">
              <path d="M3 6h18M3 12h18m-7 6h7"></path>
            </svg>
          )}
        </button>
      </div>
    </nav>
  )
}