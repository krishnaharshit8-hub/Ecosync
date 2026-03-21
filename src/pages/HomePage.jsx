import { useState, useEffect, useRef, useCallback } from 'react';
import { WebGLShader } from '../components/ui/web-gl-shader';
import { DottedSurface } from '../components/ui/dotted-surface';
import BlurTextAnimation from '../components/ui/blur-text-animation';
import {
  Home, Brain, Bot, Link2, BarChart3, Globe, Zap, Server, AlertTriangle, Building2, Hospital, ArrowRight, ChevronDown, Circle,
} from 'lucide-react';

/* ======================================================================
   EcoSync — HomePage.jsx
   Complete, self-contained landing page for the EcoSync hackathon project.
   7 sections: Hero, Problem, How It Works, Tech Stack, Architecture, CTA, Footer
   ====================================================================== */

// ──────────────────────── GOOGLE FONTS ─────────────────────────
const FontLoader = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    `}</style>
    <link href="/ClashDisplay_Complete/ClashDisplay_Complete/Fonts/WEB/css/clash-display.css" rel="stylesheet" />
  </>
);

// ──────────────────────── GLOBAL KEYFRAMES ─────────────────────
const GlobalStyles = () => (
  <style>{`
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes grid-scroll {
      0% { transform: translateY(0); }
      100% { transform: translateY(60px); }
    }
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes word-appear {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.8);
        filter: blur(10px);
      }
      50% {
        opacity: 0.8;
        transform: translateY(10px) scale(0.95);
        filter: blur(2px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }
    .word-reveal {
      display: inline-block;
      opacity: 0;
      margin: 0 0.15em;
    }
    .word-reveal.animate {
      animation: word-appear 0.8s ease-out forwards;
    }
    .eco-card {
      transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
      will-change: transform;
    }
    .eco-card:hover {
      transform: translateY(-4px);
      border-color: rgba(0, 245, 160, 0.4) !important;
      box-shadow: 0 12px 40px rgba(0, 245, 160, 0.12) !important;
    }
    .problem-card {
      transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
      cursor: default;
    }
    .problem-card:hover {
      transform: translateY(-6px);
      border-top-color: rgba(255, 107, 107, 0.8) !important;
      box-shadow: 0 16px 40px rgba(255, 107, 107, 0.08),
                  0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .how-step {
      transition: background 0.25s ease, padding-left 0.25s ease, border-color 0.25s ease;
      border-left: 2px solid transparent;
    }
    .how-step:hover {
      background: rgba(0, 245, 160, 0.03);
      border-left-color: rgba(0, 245, 160, 0.4) !important;
      padding-left: 12px;
    }
    .tech-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .tech-card:hover {
      transform: translateY(-4px) scale(1.01);
      background: rgba(255, 255, 255, 0.05) !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    }
    .arch-row {
      transition: box-shadow 0.3s ease;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .arch-row:hover {
      box-shadow: 0 0 12px rgba(0, 245, 160, 0.08),
                  0 0 1px rgba(0, 245, 160, 0.15);
    }
    .section-label {
      animation: label-pulse 3s ease-in-out infinite;
    }
    @keyframes label-pulse {
      0%, 100% { opacity: 0.6; letter-spacing: 0.2em; }
      50%       { opacity: 1;   letter-spacing: 0.25em; }
    }
    .eco-btn-primary {
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
      will-change: transform;
    }
    .eco-btn-primary:hover {
      transform: scale(1.03);
      filter: brightness(1.1);
      box-shadow: 0 0 40px rgba(0, 245, 160, 0.5) !important;
    }
    .eco-btn-secondary {
      transition: background 0.2s ease, color 0.2s ease;
      will-change: transform;
    }
    .eco-btn-secondary:hover {
      background: rgba(0, 245, 160, 0.1);
    }
  `}</style>
);

// ──────────────────────── DESIGN TOKENS ───────────────────────
const T = {
  bg: '#000000',
  bgPanel: '#0A0A0A',
  green: '#00F5A0',
  blue: '#00D4FF',
  purple: '#7C6BFF',
  yellow: '#FFD166',
  red: '#FF6B6B',
  text: '#CBD5E1',
  muted: '#475569',
  border: 'rgba(0,245,160,0.15)',
  font: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  heading: "'ClashDisplay-Variable', sans-serif",
};

// ──────────────────────── SCROLL REVEAL HOOK ──────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { setVisible(entry.isIntersecting); },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

// ──────────────────────── COUNTER HOOK ────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setValue(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// ──────────────────────── MAIN COMPONENT ──────────────────────
export default function HomePage({ onNavigateToDashboard }) {
  const [heroLoaded, setHeroLoaded] = useState(false);
  useEffect(() => { setHeroLoaded(true); }, []);

  // Trigger word-reveal animations on mount
  useEffect(() => {
    const words = document.querySelectorAll('.word-reveal');
    words.forEach((word) => {
      const delay = parseInt(word.dataset.delay || '0');
      setTimeout(() => {
        word.classList.add('animate');
      }, delay);
    });
  }, []);

  // Counter values
  const c1 = useCounter(30, 2000, heroLoaded);
  const c2 = useCounter(100, 2000, heroLoaded);
  const c3 = useCounter(15, 2000, heroLoaded);

  // Section reveal refs
  const [problemRef, problemVis] = useScrollReveal();
  const [howRef, howVis] = useScrollReveal();
  const [techRef, techVis] = useScrollReveal();
  const [archRef, archVis] = useScrollReveal();
  const [ctaRef, ctaVis] = useScrollReveal();

  const scrollToHow = useCallback(() => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Shared section style helper
  const sectionRevealStyle = (visible, delay = 0, type = 'up') => {
    let transformStart = 'translateY(40px)';
    if (type === 'down') transformStart = 'translateY(-40px)';
    if (type === 'left') transformStart = 'translateX(50px)';
    if (type === 'right') transformStart = 'translateX(-50px)';
    if (type === 'zoom') transformStart = 'scale(0.9)';

    return {
      opacity: visible ? 1 : 0,
      transform: visible ? (type === 'zoom' ? 'scale(1)' : 'translate(0,0)') : transformStart,
      transition: visible 
        ? `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
        : `opacity 0.4s ease 0s, transform 0.4s ease 0s`,
    };
  };

  const sectionLabelStyle = (color) => ({
    fontFamily: T.mono,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: color,
    marginBottom: '12px',
  });

  const sectionHeadingStyle = {
    fontFamily: T.heading,
    fontWeight: 800,
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
    color: '#fff',
    lineHeight: 1.15,
    marginBottom: '16px',
  };

  const sectionSubStyle = {
    fontFamily: T.font,
    fontSize: '1rem',
    color: T.muted,
    maxWidth: '600px',
    margin: '0 auto 48px',
    lineHeight: 1.6,
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', overflowX: 'hidden' }}>
      <FontLoader />
      <GlobalStyles />

      {/* ================================================================
          SECTION 1 — HERO
          ================================================================ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        overflow: 'hidden',
        background: '#000000',
      }}>
        {/* WebGL Shader Background — renders animated light waves */}
        <WebGLShader />

        {/* Dark overlay to tone down the shader so text is readable */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }} />

        {/* Green orb */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0,245,160,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
        }} />

        {/* Blue orb */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '860px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Badge */}
          <div 
            className="word-reveal" 
            data-delay="0"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: `1px solid ${T.green}`,
              borderRadius: '9999px',
              padding: '6px 18px',
              marginBottom: '32px',
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: T.green,
              display: 'inline-block',
              animation: 'pulse-dot 1.5s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: T.font,
              fontSize: '0.8rem',
              color: T.green,
              fontWeight: 500,
            }}>
              <span className="word-reveal" data-delay="0" style={{ margin: 0 }}>HACK4IMPACT</span>
              <span className="word-reveal" data-delay="100" style={{ margin: '0 4px' }}>Track 2</span>
              <span className="word-reveal" data-delay="200" style={{ margin: 0 }}>Team C-Sharks</span>
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: T.heading,
            fontWeight: 800,
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
            lineHeight: 1.1,
            color: '#fff',
            marginBottom: '24px',
          }}>
            <span className="word-reveal" data-delay="200">Every</span>
            <span className="word-reveal" data-delay="350">Building</span>
            <span className="word-reveal" data-delay="500">Becomes</span><br />
            <span style={{ color: '#ffffff' }}>
              <span className="word-reveal" data-delay="650">a</span>
              <span className="word-reveal" data-delay="800">Smart</span>
              <span className="word-reveal" data-delay="950">Energy</span>
              <span className="word-reveal" data-delay="1100">Node</span>
            </span>
          </h1>

          {/* Subheading */}
          <p 
            className="word-reveal" 
            data-delay="1300"
            style={{
              display: 'block',
              fontFamily: T.font,
              fontSize: 'clamp(0.95rem, 1.5vw, 1.125rem)',
              color: T.text,
              maxWidth: '640px',
              margin: '0 auto 40px',
              lineHeight: 1.7,
            }}
          >
            EcoSync uses AI and blockchain to let buildings autonomously
            trade surplus solar power with each other like an Airbnb
            for electricity, but fully automated and tamper-proof.
          </p>

          {/* CTA Buttons */}
          <div 
            className="word-reveal" 
            data-delay="1600"
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '48px',
            }}
          >
            <button
              onClick={onNavigateToDashboard}
              className="eco-btn-primary"
              style={{
                fontFamily: T.font,
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #00F5A0, #00D4FF)',
                color: '#04101E',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0,245,160,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              View Live Dashboard <ArrowRight size={18} />
            </button>
            <button
              onClick={scrollToHow}
              className="eco-btn-secondary"
              style={{
                fontFamily: T.font,
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '14px 32px',
                background: 'transparent',
                color: T.green,
                border: `1px solid ${T.green}`,
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              How It Works <ChevronDown size={18} />
            </button>
          </div>

          {/* Impact Stats */}
          <div 
            className="word-reveal" 
            data-delay="1900"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: c1, suffix: '%', label: 'Less Energy Waste', color: T.green },
              { value: c2, suffix: '%', label: 'Critical Infrastructure Uptime', color: T.blue },
              { value: c3, suffix: '%', label: 'Cheaper Electricity Bills', color: T.yellow },
            ].map((stat, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
              }}>
                {i > 0 && (
                  <div style={{
                    width: '1px',
                    height: '48px',
                    background: 'rgba(255,255,255,0.1)',
                    margin: '0 32px',
                  }} />
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: T.heading,
                    fontWeight: 800,
                    fontSize: '2rem',
                    color: stat.color,
                    lineHeight: 1,
                  }}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div style={{
                    fontFamily: T.font,
                    fontSize: '0.75rem',
                    color: T.muted,
                    marginTop: '6px',
                  }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2 — THE PROBLEM
          ================================================================ */}
      <section ref={problemRef} style={{
        padding: '100px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={sectionRevealStyle(problemVis, 0, 'left')}>
          <div className="section-label" style={sectionLabelStyle(T.red)}>THE PROBLEM</div>
          <h2 style={sectionHeadingStyle}>The global energy grid is broken</h2>
          <p style={sectionSubStyle}>Three critical failures that EcoSync directly solves</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {[
            {
              icon: <AlertTriangle size={28} color="#FF6B6B" />,
              title: '30% of renewable energy is wasted',
              text: 'Solar and wind get switched off because grids can\'t balance supply and demand locally. Clean energy is wasted every single day.',
              delay: 0.1,
            },
            {
              icon: <Building2 size={28} color="#FF6B6B" />,
              title: 'Centralized grids fail modern cities',
              text: 'Old infrastructure was built for one-way power flow. Solar panels made it bidirectional and legacy grids simply can\'t handle it.',
              delay: 0.2,
            },
            {
              icon: <Hospital size={28} color="#FF6B6B" />,
              title: 'Hospitals lose power in blackouts',
              text: 'No smart prioritization exists today. A grid crash takes down everything, including hospitals and critical infrastructure.',
              delay: 0.3,
            },
          ].map((card, i) => (
            <div
              key={i}
              className="problem-card"
              style={{
                ...sectionRevealStyle(problemVis, card.delay),
                background: T.bgPanel,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'left',
                borderTop: `2px solid rgba(255,107,107,0.5)`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{card.icon}</div>
              <h3 style={{
                fontFamily: T.mono,
                fontWeight: 400,
                fontSize: '1.15rem',
                color: '#fff',
                marginBottom: '12px',
                lineHeight: 1.3,
              }}>
                {card.title}
              </h3>
              <p style={{
                fontFamily: T.mono,
                fontSize: '0.9rem',
                color: T.text,
                lineHeight: 1.6,
              }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          SECTION 3 — HOW IT WORKS
          ================================================================ */}
      <section id="how-it-works" ref={howRef} style={{
        padding: '100px 24px',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', ...sectionRevealStyle(howVis, 0, 'right') }}>
          <div className="section-label" style={sectionLabelStyle(T.blue)}>HOW IT WORKS</div>
          <h2 style={sectionHeadingStyle}>5 steps, solar panel to blockchain</h2>
          <p style={sectionSubStyle}>In plain English no engineering degree required</p>
        </div>

        <div style={{ position: 'relative' }}>
          {[
            {
              num: '01', icon: <Home size={18} />, title: 'Buildings Generate Solar',
              text: 'Each building has rooftop solar panels tracked by IoT sensors. Production, consumption, and battery level update every 15 minutes and stream to the EcoSync system in real time.',
            },
            {
              num: '02', icon: <Brain size={18} />, title: 'AI Predicts What\'s Coming',
              text: 'Our LSTM neural network analyzes the last 3 hours of data and predicts the next hour\'s energy state for every building with 95% accuracy before the surplus or deficit even happens.',
            },
            {
              num: '03', icon: <Bot size={18} />, title: 'AI Agents Negotiate Trades',
              text: 'Every building has its own AI agent (LangGraph). When Agent A sees it will have surplus and Agent B will run short, they negotiate a peer-to-peer trade automatically. No human needed.',
            },
            {
              num: '04', icon: <Link2 size={18} />, title: 'Blockchain Seals the Deal',
              text: 'The agreed trade is written to a Polygon blockchain smart contract. Payment is automatic, transparent, and permanent. No utility company. The transaction hash is immutable proof.',
            },
            {
              num: '05', icon: <BarChart3 size={18} />, title: 'Live Dashboard Shows Everything',
              text: 'Every trade, prediction, and grid balance is visible in real time. Full transparency from rooftop panel to blockchain transaction.',
            },
          ].map((step, i) => (
            <div key={i} className="how-step" style={{
              display: 'flex',
              gap: '32px',
              marginBottom: i < 4 ? '0' : '0',
              ...sectionRevealStyle(howVis, 0.1 * (i + 1), 'left'),
            }}>
              {/* Left: circle + line */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '60px',
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(0,245,160,0.1)',
                  border: '1px solid rgba(0,245,160,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00F5A0',
                  flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div style={{
                  fontFamily: T.mono,
                  fontSize: '0.7rem',
                  color: T.muted,
                  marginTop: '8px',
                  fontWeight: 600,
                }}>
                  {step.num}
                </div>
                {i < 4 && (
                  <div style={{
                    width: '2px',
                    flex: 1,
                    minHeight: '40px',
                    background: `linear-gradient(to bottom, ${T.border}, transparent)`,
                    marginTop: '8px',
                  }} />
                )}
              </div>

              {/* Right: content */}
              <div style={{ paddingBottom: '48px' }}>
                <h3 style={{
                  fontFamily: T.mono,
                  fontWeight: 400,
                  fontSize: '1.15rem',
                  color: '#fff',
                  marginBottom: '8px',
                  lineHeight: 1.3,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: T.mono,
                  fontSize: '0.9rem',
                  color: T.text,
                  lineHeight: 1.7,
                }}>
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          SECTION 4 — TECH STACK
          ================================================================ */}
      <section ref={techRef} style={{
        padding: '100px 24px',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={sectionRevealStyle(techVis, 0, 'zoom')}>
          <div className="section-label" style={sectionLabelStyle(T.purple)}>TECH STACK</div>
          <h2 style={sectionHeadingStyle}>Built with production-grade tools</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginTop: '16px',
        }}>
          {[
            { icon: <Brain size={20} color="#FF6B6B" />, name: 'TensorFlow LSTM', desc: 'Energy prediction AI', color: T.red },
            { icon: <Bot size={20} color="#7C6BFF" />, name: 'LangGraph', desc: 'Multi-agent negotiation', color: T.purple },
            { icon: <Link2 size={20} color="#00D4FF" />, name: 'Polygon Blockchain', desc: 'Smart contract trades', color: T.blue },
            { icon: <Zap size={20} color="#00F5A0" />, name: 'FastAPI', desc: 'Real-time Python backend', color: T.green },
            { icon: <Globe size={20} color="#FFD166" />, name: 'NVIDIA Isaac Sim', desc: 'Digital twin simulation', color: T.yellow },
            { icon: <BarChart3 size={20} color="#00D4FF" />, name: 'React.js', desc: 'Live monitoring dashboard', color: '#22d3ee' },
          ].map((tech, i) => (
            <div
              key={i}
              className="tech-card"
              style={{
                ...sectionRevealStyle(techVis, 0.05 * (i + 1), 'zoom'),
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: T.bgPanel,
                borderRadius: '10px',
                padding: '20px 24px',
                borderLeft: `3px solid ${tech.color}80`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                textAlign: 'left',
                cursor: 'default',
              }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{tech.icon}</span>
              <div>
                <div style={{
                  fontFamily: T.mono,
                  fontWeight: 400,
                  fontSize: '1rem',
                  color: '#fff',
                  marginBottom: '4px',
                }}>
                  {tech.name}
                </div>
                <div style={{
                  fontFamily: T.mono,
                  fontSize: '0.8rem',
                  color: T.muted,
                }}>
                  {tech.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          SECTION 5 — SYSTEM ARCHITECTURE
          ================================================================ */}
      <section ref={archRef} style={{
        padding: '100px 24px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={sectionRevealStyle(archVis, 0, 'left')}>
          <div className="section-label" style={sectionLabelStyle(T.green)}>ARCHITECTURE</div>
          <h2 style={sectionHeadingStyle}>How all the pieces connect</h2>
        </div>

        <div style={{
          ...sectionRevealStyle(archVis, 0.15),
          background: T.bgPanel,
          border: `1px solid ${T.green}30`,
          borderRadius: '16px',
          padding: '40px 32px',
          textAlign: 'left',
          boxShadow: `0 0 60px rgba(0,245,160,0.03)`,
        }}>
          {[
            { dot: T.green, name: 'IoT Sensors / Isaac Sim', proto: 'MQTT / JSON' },
            { dot: T.blue, name: 'Mosquitto MQTT Broker', proto: 'Paho listener' },
            { dot: T.purple, name: 'FastAPI Backend', proto: 'LSTM inference' },
            { dot: T.yellow, name: 'TensorFlow LSTM Model', proto: 'Agent state' },
            { dot: T.green, name: 'LangGraph AI Agents', proto: 'Trade agreement' },
            { dot: T.red, name: 'Polygon Smart Contract', proto: 'WebSocket' },
            { dot: T.blue, name: 'React Live Dashboard', proto: null },
          ].map((layer, i) => (
            <div key={i} className="arch-row" style={{
              opacity: archVis ? 1 : 0,
              transform: archVis ? 'translateY(0)' : 'translateY(15px)',
              transition: `all 0.4s ease ${0.1 * (i + 1)}s`,
            }}>
              {/* Layer row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: layer.dot,
                  flexShrink: 0,
                  boxShadow: `0 0 8px ${layer.dot}`,
                }} />
                <span style={{
                  fontFamily: T.mono,
                  fontWeight: 400,
                  fontSize: '0.9rem',
                  color: '#fff',
                }}>
                  {layer.name}
                </span>
              </div>

              {/* Connector */}
              {layer.proto && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 0 4px 20px',
                }}>
                  <div style={{
                    width: '2px',
                    height: '24px',
                    background: `linear-gradient(to bottom, ${T.border}, rgba(0,245,160,0.05))`,
                  }} />
                  <span style={{
                    fontFamily: T.mono,
                    fontWeight: 400,
                    fontSize: '0.7rem',
                    color: T.muted,
                    fontStyle: 'italic',
                  }}>
                    {layer.proto}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA + DOTTED SURFACE SECTION ── */}
      <section
        ref={ctaRef}
        style={{
          position: 'relative',
          minHeight: '520px',
          background: '#000000',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Dotted wave — absolutely positioned, fills section */}
        <DottedSurface
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />

        {/* Fade from black at top so it blends with section above */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '180px',
            background: 'linear-gradient(to bottom, #000000 0%, transparent 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Fade to black at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to top, #000000 0%, transparent 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Radial green glow behind the text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, rgba(0,245,160,0.06) 0%, transparent 65%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* CTA content — on top of everything */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            padding: '80px 40px',
            ...sectionRevealStyle(ctaVis, 0, 'zoom')
          }}
        >
          <h2 style={{
            fontFamily: T.heading,
            fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}>
            See it working live
          </h2>
          <BlurTextAnimation
            text="Watch AI agents negotiate energy trades in real time, then verify each one on the Polygon blockchain."
            fontSize="text-lg md:text-xl"
            textColor="text-white/55"
            animationDelay={3000}
            className="mb-8"
          />
          <button
            onClick={onNavigateToDashboard}
            className="eco-btn-primary"
            style={{
              fontFamily: T.font,
              fontWeight: 600,
              fontSize: '1.05rem',
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #00F5A0, #00D4FF)',
              color: '#04101E',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 0 24px rgba(0,245,160,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              margin: '0 auto',
            }}
          >
            Open Live Dashboard <ArrowRight size={20} />
          </button>
          <p style={{
            fontFamily: T.font,
            fontSize: '0.75rem',
            color: T.muted,
            marginTop: '20px',
          }}>
            Simulating 5 buildings · LSTM · LangGraph · Polygon Mumbai
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: '#000000',
          borderTop: '1px solid rgba(0,245,160,0.1)',
          padding: '24px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.25)',
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        <span style={{ color: '#00F5A0', fontWeight: 600 }}>
          ⚡ EcoSync Team C-Sharks
        </span>
        <span>HACK4IMPACT Track 2 · KIIT DU · 2026</span>
        <a
          href="https://github.com/ecosync-hackathon"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}
        >
          github.com/ecosync-hackathon
        </a>
      </footer>
    </div>
  );
}
