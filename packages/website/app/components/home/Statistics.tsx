import '~/styles/statistics.css';
import '~/styles/animations.css';
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatNumber } from '~/utils/formating';
import GetStats, { type Statistics as StatsData } from '~/requests/getStats';

gsap.registerPlugin(ScrollTrigger);

interface StatItem {
  label: string;
  value: any;
  isPercentage?: boolean;
  displayValue?: string | number;
}

export default function Statistics() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRefs = useRef<HTMLDivElement[]>([]);
  const numbersRefs = useRef<HTMLHeadingElement[]>([]);
  const [stats, setStats] = useState<StatsData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [animatedStats, setAnimatedStats] = useState<StatItem[]>([]);
  const animationCreated = useRef(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await GetStats();
        if (data && data.length > 0) {
          setStats(data);
        }
      } catch (error) {
        setStats([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  useEffect(() => {
    if (!stats || loading) return;

    const initialStats: StatItem[] = [
      {
        label: "Servers",
        value: stats[0] || 0,
        displayValue: "0"
      },
      {
        label: "Users",
        value: stats[1] || 0,
        displayValue: "0"
      },
      {
        label: "Commands Used",
        value: stats[2] || 0,
        displayValue: "0"
      },
      {
        label: "Uptime",
        value: "99.99%",
        isPercentage: true,
        displayValue: "0"
      }
    ];

    setAnimatedStats(initialStats);
  }, [stats, loading]);
  
  useEffect(() => {
    if (!sectionRef.current || loading || !animatedStats.length || animationCreated.current) return;
    
    animationCreated.current = true;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        once: true
      }
    });
    
    statsRefs.current.forEach((el, i) => {
      tl.fromTo(
        el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        i * 0.15
      );
    });
  
    const finalDisplayValues = animatedStats.map((stat) => {
      if (typeof stat.value === 'number' && !stat.isPercentage) {
        return formatNumber(stat.value);
      } else if (stat.isPercentage) {
        const percentValue = parseFloat(String(stat.value));
        return isNaN(percentValue) ? "99.99%" : `${percentValue.toFixed(2)}%`;
      }
      return stat.displayValue;
    });
    
    numbersRefs.current.forEach((el, i) => {
      if (!el) return;
      
      tl.fromTo(
        el,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
        0.3 + i * 0.15
      );
      
      const stat = animatedStats[i];
      if (!stat) return;
      
      if (typeof stat.value === 'number' && !stat.isPercentage) {
        const obj = { value: 0 };
      
        tl.to(obj, {
          value: stat.value,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            if (el) {
              el.textContent = formatNumber(Math.floor(obj.value));
            }
          },
          onComplete: () => {
            if (el) {
              el.textContent = finalDisplayValues[i]?.toString() || '';
            }
          }
        }, 0.5 + i * 0.2);
      } else if (stat.isPercentage) {
        let percentValue = parseFloat(String(stat.value));
        if (isNaN(percentValue)) percentValue = 99.99;
        
        const obj = { value: 0 };
        tl.to(obj, {
          value: percentValue,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            if (el) {
              el.textContent = `${obj.value.toFixed(2)}%`;
            }
          },
          onComplete: () => {
            if (el) {
              el.textContent = finalDisplayValues[i]?.toString() || '';
            }
          }
        }, 0.5 + i * 0.2);
      }
    });
    
    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      animationCreated.current = false;
    };
  }, [loading, animatedStats]);

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="stats-decoration-top"></div>
      <div className="stats-container">
        <h2 className="section-title no-underline">
          <span className="aeri-stats-name">
            <span className="kawaii-letter">A</span>
            <span className="kawaii-letter">e</span>
            <span className="kawaii-letter">r</span>
            <span className="kawaii-letter">i</span>
          </span>
          <span>Statistics</span>
          <span className="title-emoji">📊</span>
        </h2>
        <p className="section-subtitle">Join the growing community of anime enthusiasts!</p>
        
        <div className="stats-grid">
          {animatedStats.map((stat, index) => (
            <div 
              key={index} 
              className={`stat-card kawaii-card ${loading ? "loading" : ""}`}
              ref={el => { if (el) statsRefs.current[index] = el }}
            >
              <div className="stat-number-container">
                <div className="stat-sparkles">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className="stat-sparkle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`
                      }}
                    ></div>
                  ))}
                </div>
                <h3 
                  className="stat-number pastel-number count-up"
                  ref={el => { if (el) numbersRefs.current[index] = el }}
                >
                  {loading ? "..." : (stat.displayValue || "0")}
                </h3>
              </div>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="stats-decoration-bottom"></div>
    </section>
  );
}