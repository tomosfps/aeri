import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import GetCommands, { type Command } from "~/requests/getCommands";
import { ChevronDownIcon, ClockIcon, ZapIcon } from "~/components/icons";
import "~/styles/commands.css";
import { categoryIcons, mascotEmojis, alphabetEmojis } from "~/utils/commands";

export function meta() {
  return [{ title: "Commands | Aeri" }];
}

export default function Commands() {
  const [selectedCategory] = useState<string | null>(null);
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set());
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const commandsContainerRef = useRef<HTMLDivElement>(null);

  const getRandomEmojiForLetter = (letter: string) => {
    const charCode = letter.charCodeAt(0);
    return alphabetEmojis[charCode % alphabetEmojis.length];
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchCommands = async () => {
      try {
        const commandData = await GetCommands();
        if (isMounted) {
          if (Array.isArray(commandData)) {
            setCommands(commandData);
          } else {
            setCommands([]);
          }
        }
      } catch (error) {
        setCommands([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCommands();
    return () => { isMounted = false; };
  }, []);

  const filteredCommands = useMemo(() => 
    commands.filter(cmd => selectedCategory ? cmd.category === selectedCategory : true),
    [commands, selectedCategory]
  );

  const toggleCommandExpanded = useCallback((name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setExpandedCommands(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  }, []);

  const groupedCommands = useMemo(() => {
    if (activeTab === 1) {
      const groups: Record<string, Command[]> = {};
      filteredCommands.forEach(cmd => {
        const firstLetter = cmd.name.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
          groups[firstLetter] = [];
        }
        groups[firstLetter].push(cmd);
      });
      return groups;
    }
    return {};
  }, [filteredCommands, activeTab]);

  const categorizedCommands = useMemo(() => {
    if (activeTab === 0) {
      const groups: Record<string, Command[]> = {};
      filteredCommands.forEach(cmd => {
        const category = cmd.category || "Miscellaneous";
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(cmd);
      });
      
      Object.keys(groups).forEach(category => {
        if (groups[category]) {
          groups[category].sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      
      return groups;
    }
    return {};
  }, [filteredCommands, activeTab]);

  const groupKeys = useMemo(() => {
    if (activeTab === 0) {
      return Object.keys(categorizedCommands).sort();
    } else {
      return Object.keys(groupedCommands).sort();
    }
  }, [categorizedCommands, groupedCommands, activeTab]);

  const getCommandsForGroup = useCallback((group: string) => {
    if (activeTab === 0) {
      return categorizedCommands[group] || [];
    } else {
      return groupedCommands[group] || [];
    }
  }, [categorizedCommands, groupedCommands, activeTab]);

  const getRandomMascotEmoji = () => {
    return mascotEmojis[Math.floor(Math.random() * mascotEmojis.length)];
  };

  const createSparkle = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const sparkleContainer = card.querySelector('.kawaii-sparkle-container');
    if (!sparkleContainer) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const sparkle = document.createElement('div');
    sparkle.className = 'kawaii-sparkle';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    
    sparkleContainer.appendChild(sparkle);
    setTimeout(() => {
      if (sparkleContainer.contains(sparkle)) {
        sparkleContainer.removeChild(sparkle);
      }
    }, 800);
  };
  
  const renderFloatingDecorations = () => {
    return Array.from({ length: 12 }, (_, i) => (
      <div 
        key={i}
        className={`floating-decoration ${i % 3 === 0 ? 'sparkle' : i % 3 === 1 ? 'flower' : 'heart'}`}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 10}s`
        }}
      >
        {i % 3 === 0 ? '✨' : i % 3 === 1 ? '🌸' : '💖'}
      </div>
    ));
  };

  return (
    <div className="kawaii-commands-page">
      <div className="floating-decorations">
        {renderFloatingDecorations()}
      </div>
            
      <div className="kawaii-commands-container">
        <div className="kawaii-tab-container-wrapper">
          <div className="kawaii-tab-container">
            <button 
              className={`kawaii-tab-button ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              <span className="tab-icon">📑</span> By Category
            </button>
            <button 
              className={`kawaii-tab-button ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              <span className="tab-icon">🔤</span> Alphabetical
            </button>
            <div className={`tab-slider position-${activeTab}`}></div>
          </div>
        </div>
        
        {loading ? (
          <div className="kawaii-loading">
            <div className="sakura-loader">
              <div className="sakura-petal"></div>
              <div className="sakura-petal"></div>
              <div className="sakura-petal"></div>
              <div className="sakura-petal"></div>
              <div className="sakura-petal"></div>
              <div className="sakura-center">{getRandomMascotEmoji()}</div>
            </div>
            <p className="loading-text">Loading magical commands...</p>
            <div className="loading-subtext">Gathering all the sparkles~</div>
          </div>
        ) : (
          <div className="commands-content" ref={commandsContainerRef}>
            {groupKeys.length > 0 ? (
              <div className="commands-groups">
                {groupKeys.map(group => (
                  <div className="commands-group" key={group}>
                    <div className="group-header">
                      <div className="group-title-wrapper">
                        <span className="group-icon">
                          {activeTab === 0 
                            ? (categoryIcons[group] || "✨") 
                            : getRandomEmojiForLetter(group)}
                        </span>
                        <h2 className="group-title">
                          {group}
                        </h2>
                      </div>
                      <div className="group-decoration"></div>
                    </div>
                    
                    <div className="kawaii-commands-list">
                      {getCommandsForGroup(group).map((command) => (
                        <div 
                          key={command.name} 
                          className="kawaii-command-card" 
                          onMouseEnter={createSparkle}
                          onClick={createSparkle}
                        >
                          <div className="kawaii-sparkle-container"></div>
                          <div className="card-deco-top"></div>
                          
                          <div className="command-main">
                            <div className="command-header">
                              <h3 className="command-name">
                                <span className="command-slash">/</span>{command.name}
                              </h3>
                              <div className="command-badges">
                                {command.category && (
                                  <span className="command-badge category-badge">
                                    {categoryIcons[command.category] || "✨"} {command.category}
                                  </span>
                                )}
                                {command.cooldown && command.cooldown > 0 ? (
                                  <span className="command-badge cooldown-badge">
                                    <ClockIcon size={12} /> {command.cooldown}s
                                  </span>
                                ) : (
                                  <span className="command-badge no-cooldown-badge">
                                    <ClockIcon size={12} /> No cooldown
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <p className="command-description">{command.description}</p>
                            
                            {(command.options?.length > 0 || command.examples?.length > 0) && (
                              <button 
                                className="details-toggle"
                                onClick={(e) => toggleCommandExpanded(command.name, e)}
                              >
                                <span>
                                  {expandedCommands.has(command.name) ? 'Hide details' : 'Show details'}
                                </span>
                                <ChevronDownIcon 
                                  size={14} 
                                  className={expandedCommands.has(command.name) ? 'rotated' : ''}
                                />
                              </button>
                            )}
                          </div>
                          
                          {expandedCommands.has(command.name) && (
                            <div className="command-details-expanded">
                              {command.options && command.options.length > 0 && (
                                <div className="command-options-section">
                                  <h4>
                                    <span className="section-icon">🔧</span>
                                    Options
                                  </h4>
                                  <div className="command-options-grid">
                                    {command.options.map((option, index) => (
                                      <div key={index} className="option-chip">
                                        <span className="option-name">{option.name}</span>
                                        {option.required && <span className="required-star">✧</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {command.examples && command.examples.length > 0 && (
                                <div className="command-examples-section">
                                  <h4>
                                    <span className="section-icon">💡</span>
                                    Examples
                                  </h4>
                                  <div className="examples-list">
                                    {command.examples.map((example, index) => (
                                      <div key={index} className="example-item">
                                        <ZapIcon size={12} />
                                        <code className="example-code">{example}</code>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="card-decoration">
                            <div className="card-sparkle"></div>
                            <div className="card-sparkle"></div>
                            <div className="card-sparkle"></div>
                          </div>
                          <div className="card-deco-bottom"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">(◕︿◕✿)</div>
                <p className="empty-state-message">No commands found!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}