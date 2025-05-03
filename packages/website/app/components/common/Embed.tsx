import React from 'react';
import '~/styles/embed.css';

interface EmbedField {
  name: string;
  value: string | number;
  inline?: boolean;
}

interface EmbedProps {
  title?: string;
  description?: string;
  thumbnail: string;
  fields?: EmbedField[];
  color?: string;
  footer?: string;
  type: string;
}

const DiscordEmbed: React.FC<EmbedProps> = ({ 
  title, 
  description, 
  thumbnail,
  fields = [],
  color = 'var(--pastel-pink)',
  footer,
  type
}) => {
  // Helper function to determine what emoji to show in decoration badge
  const getDecorationEmoji = () => {
    switch(type) {
      case 'anime': return '🎬';
      case 'manga': return '📖';
      case 'user': return '👤';
      default: return '✨';
    }
  };

  // Generate random pastel sparkles
  const sparkles = Array(5).fill(0).map((_) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 10 + 5}px`,
    delay: `${Math.random() * 3}s`
  }));

  return (
    <div className="discord-embed-container">
      {/* Floating kawaii decoration */}
      <div className="discord-embed-kawaii-decoration">
        {type === 'anime' ? '🌸' : type === 'manga' ? '✨' : '💫'}
      </div>
      
      <div className="discord-embed" style={{ borderColor: color }} data-type={type}>
        {/* Decorative badge at top */}
        <div className="discord-embed-decoration">
          {getDecorationEmoji()}
        </div>
        
        {/* Cute bubbles in background */}
        <div className="discord-embed-bubbles">
          <div className="discord-embed-bubble"></div>
          <div className="discord-embed-bubble"></div>
          <div className="discord-embed-bubble"></div>
        </div>
        
        {/* Sparkle effects */}
        <div className="discord-embed-sparkles">
          {sparkles.map((sparkle, i) => (
            <div 
              key={i} 
              className="discord-embed-sparkle"
              style={{
                top: sparkle.top,
                left: sparkle.left,
                width: sparkle.size,
                height: sparkle.size,
                animationDelay: sparkle.delay
              }}
            />
          ))}
        </div>
        
        {title && <div className="discord-embed-title">{title}</div>}
        
        <div className="discord-embed-content">
          {thumbnail && (
            <div className="discord-embed-thumbnail">
              <img src={thumbnail} alt={title || 'Embed thumbnail'} />
            </div>
          )}
          
          <div className="discord-embed-inner-content">
            {description && <div className="discord-embed-description">{description}</div>}
            
            {fields.length > 0 && (
              <div className="discord-embed-fields">
                {fields.map((field, index) => (
                  <div 
                    key={index} 
                    className={`discord-embed-field ${field.inline ? 'inline' : ''}`}
                  >
                    <div className="discord-embed-field-name">
                      {field.name}
                    </div>
                    <div className="discord-embed-field-value">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {footer && <div className="discord-embed-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default DiscordEmbed;