import { useState, useEffect, useRef, useCallback } from 'react';
import { WebGLShader } from '../components/ui/web-gl-shader';
import { DottedSurface } from '../components/ui/dotted-surface';
import BlurTextAnimation from '../components/ui/blur-text-animation';
import {
  Home, Brain, Bot, Link2, BarChart3, Globe, Zap, AlertTriangle, Building2, Hospital, ArrowRight, ChevronDown, Sparkles, Eye,
} from 'lucide-react';

/* ======================================================================
   EcoSync — HomePage.tsx (Enhanced)
   Beautiful animated landing page with scroll-driven section transitions,
   gradient morphing, parallax effects, and premium micro-interactions.
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
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      33% { transform: translateY(-12px) rotate(1deg); }
      66% { transform: translateY(-6px) rotate(-1deg); }
    }
    @keyframes float-reverse {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      33% { transform: translateY(8px) rotate(-1deg); }
      66% { transform: translateY(4px) rotate(1deg); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes orbit {
      0% { transform: rotate(0deg) translateX(60px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
    }
    @keyframes counter-orbit {
      0% { transform: rotate(0deg) translateX(40px) rotate(0deg); }
      100% { transform: rotate(-360deg) translateX(40px) rotate(360deg); }
    }
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.85); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes line-grow {
      from { height: 0; }
      to { height: 100%; }
    }
    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 0 20px rgba(0,245,160,0.1); }
      50% { box-shadow: 0 0 40px rgba(0,245,160,0.3), 0 0 80px rgba(0,245,160,0.1); }
    }
    @keyframes gradient-border {
      0%, 100% { border-color: rgba(0,245,160,0.3); }
      50% { border-color: rgba(0,212,255,0.5); }
    }
    @keyframes scroll-hint {
      0%, 100% { transform: translateY(0); opacity:1; }
      50% { transform: translateY(8px); opacity:0.4; }
    }

    /* scroll-driven section BG transition */
    .eco-section {
      position: relative;
      transition: opacity 0.3s ease;
    }
    .eco-card {
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease;
      will-change: transform;
    }
    .eco-card:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 0 25px rgba(0,245,160,0.25), 0 0 50px rgba(0,245,160,0.12), 0 0 80px rgba(0,245,160,0.06), 0 20px 50px rgba(0,0,0,0.3) !important;
    }
    .eco-btn-primary {
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, filter 0.25s ease;
      will-change: transform;
    }
    .eco-btn-primary:hover {
      transform: scale(1.04) translateY(-2px);
      filter: brightness(1.1);
      box-shadow: 0 0 40px rgba(0,245,160,0.5), 0 8px 30px rgba(0,245,160,0.15) !important;
    }
    .eco-btn-primary:active {
      transform: scale(0.97);
    }
    .eco-btn-secondary {
      transition: all 0.25s ease;
    }
    .eco-btn-secondary:hover {
      background: rgba(0, 245, 160, 0.08) !important;
      border-color: rgba(0, 245, 160, 0.6) !important;
      transform: translateY(-2px);
    }
    .step-card {
      transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
    }
    .step-card:hover {
      box-shadow: 0 0 20px rgba(0,245,160,0.2), 0 0 45px rgba(0,245,160,0.1), 0 0 70px rgba(0,245,160,0.05), 0 12px 40px rgba(0,0,0,0.25) !important;
    }
    .tech-chip {
      transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    .tech-chip:hover {
      transform: translateY(-4px) scale(1.03);
      box-shadow: 0 0 20px rgba(0,212,255,0.2), 0 0 45px rgba(0,212,255,0.1), 0 0 70px rgba(0,212,255,0.05), 0 14px 36px rgba(0,0,0,0.25) !important;
    }
    .arch-layer {
      transition: all 0.3s ease;
    }
    .arch-layer:hover {
      box-shadow: 0 0 15px rgba(0,245,160,0.18), 0 0 35px rgba(0,245,160,0.08) !important;
      background: rgba(0,245,160,0.04) !important;
    }

    /* smooth scroll */
    html { scroll-behavior: smooth; }
  `}</style>
);

// ──────────────────────── DESIGN TOKENS ───────────────────────
const T = {
  bg:      '#000000',
  bgPanel: '#0A0A0A',
  green:   '#00F5A0',
  blue:    '#00D4FF',
  purple:  '#7C6BFF',
  yellow:  '#FFD166',
  red:     '#FF6B6B',
  text:    '#CBD5E1',
  muted:   '#475569',
  border:  'rgba(0,245,160,0.15)',
  font:    "'Inter', sans-serif",
  mono:    "'IBM Plex Mono', monospace",
  heading: "'ClashDisplay-Variable', sans-serif",
};

// ──────────────────────── SCROLL-DRIVEN REVEAL HOOK ──────────
function useScrollReveal<T extends HTMLElement>(threshold = 0.15, persistent = false): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!persistent) obs.unobserve(entry.target);
          } else if (persistent) {
            setVisible(false);
          }
        });
      },
      persistent ? { threshold: 0.1, rootMargin: '0px 0px -30px 0px' } : { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, persistent]);

  return [ref, visible];
}

// ──────────────────────── PARALLAX SCROLL HOOK ────────────────
function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(center * speed);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, offset };
}

// ──────────────────────── ANIMATED COUNTER ────────────────────
function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.unobserve(el); }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ──────────────────────── FLOATING PARTICLES ──────────────────
function FloatingParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            background: i % 3 === 0 ? T.green : i % 3 === 1 ? T.blue : T.purple,
            borderRadius: '50%',
            opacity: 0.15 + Math.random() * 0.25,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `${i % 2 === 0 ? 'float' : 'float-reverse'} ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
            filter: `blur(${Math.random() > 0.5 ? 1 : 0}px)`,
          }}
        />
      ))}
    </div>
  );
}

// ──────────────────────── SECTION DIVIDER ─────────────────────
function SectionDivider({ color = T.green }: { color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <div style={{
        width: '60px', height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        borderRadius: '2px',
      }} />
    </div>
  );
}

// ──────────────────────── SLIDE-IN STEP CARD ──────────────────
// Each card has its own IntersectionObserver so they reveal one-by-one on scroll.
// Even-indexed cards slide from the left, odd-indexed from the right.
function SlideInStepCard({ step, index }: {
  step: { num: string; icon: React.ReactNode; title: string; text: string; color: string };
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fromLeft = index % 2 === 0;

  return (
    <div
      ref={ref}
      className="step-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateX(0) scale(1)'
          : `translateX(${fromLeft ? '-80px' : '80px'}) scale(0.97)`,
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', alignItems: 'flex-start', gap: '20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px', padding: '28px 28px',
        border: `1px solid ${step.color}18`,
        cursor: 'default',
      }}
    >
      {/* Step number badge */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        flexShrink: 0,
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: `${step.color}12`,
          border: `1px solid ${step.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: step.color,
          boxShadow: visible ? `0 0 24px ${step.color}15` : 'none',
          transition: 'box-shadow 0.8s ease 0.3s',
        }}>
          {step.icon}
        </div>
        <span style={{
          fontFamily: T.mono, fontSize: '0.65rem', fontWeight: 700,
          color: step.color, opacity: 0.6, letterSpacing: '0.05em',
        }}>
          {step.num}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontFamily: T.heading, fontWeight: 800,
          fontSize: '1.1rem', color: '#fff',
          marginBottom: '8px', lineHeight: 1.35,
        }}>
          {step.title}
        </h3>
        <p style={{
          fontFamily: T.font, fontSize: '0.88rem',
          color: T.text, lineHeight: 1.7, margin: 0,
        }}>
          {step.text}
        </p>
      </div>
    </div>
  );
}

// ──────────────────────── MAIN COMPONENT ──────────────────────
export default function HomePage({ onNavigateToDashboard }: { onNavigateToDashboard: () => void }) {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => { setHeroLoaded(true); }, []);

  // Global scroll progress for gradient morphing
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(window.scrollY / maxScroll);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger word-reveal animations
  useEffect(() => {
    const words = document.querySelectorAll('.word-reveal');
    words.forEach((word) => {
      const delay = parseInt((word as HTMLElement).dataset.delay || '0');
      setTimeout(() => word.classList.add('animate'), delay);
    });
  }, []);

  // Section refs
  const [problemRef, problemVis] = useScrollReveal<HTMLElement>(0.12, true);
  const [howRef, howVis] = useScrollReveal<HTMLElement>(0.1, true);
  const [techRef, techVis] = useScrollReveal<HTMLElement>(0.12, true);
  const [archRef, archVis] = useScrollReveal<HTMLElement>(0.12, true);
  const [ctaRef, ctaVis] = useScrollReveal<HTMLElement>(0.1, false);
  const heroParallax = useParallax(0.15);

  const scrollToHow = useCallback(() => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Reveal animation helper
  const reveal = (visible: boolean, delay = 0, type: 'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade' = 'up') => {
    const transforms: Record<string, string> = {
      up: 'translateY(50px)', down: 'translateY(-50px)',
      left: 'translateX(60px)', right: 'translateX(-60px)',
      zoom: 'scale(0.88)', fade: 'none',
    };
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(0,0) scale(1)' : transforms[type],
      transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    };
  };

  const sectionLabel = (color: string) => ({
    fontFamily: T.mono, fontSize: '0.72rem', fontWeight: 600,
    letterSpacing: '0.22em', textTransform: 'uppercase' as const,
    color, marginBottom: '14px',
  });

  const sectionHeading = {
    fontFamily: T.heading, fontWeight: 800,
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
    color: '#fff', lineHeight: 1.12, marginBottom: '16px',
  };

  // Dynamic gradient BG based on scroll
  const bgGradient = `radial-gradient(ellipse at 50% ${20 + scrollProgress * 60}%, rgba(0,245,160,${0.03 + scrollProgress * 0.03}) 0%, transparent 60%), 
                       radial-gradient(ellipse at ${30 + scrollProgress * 40}% 80%, rgba(0,212,255,${0.02 + scrollProgress * 0.02}) 0%, transparent 50%)`;

  return (
    <div style={{ background: T.bg, minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <FontLoader />
      <GlobalStyles />

      {/* Scroll-driven dynamic BG gradient */}
      <div style={{
        position: 'fixed', inset: 0, background: bgGradient,
        pointerEvents: 'none', zIndex: 0, transition: 'background 0.5s ease',
      }} />

      {/* ================================================================
          SECTION 1 — HERO
          ================================================================ */}
      <section
        ref={heroParallax.ref}
        style={{
          position: 'relative', minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px', overflow: 'hidden',
          background: '#000000',
        }}
      >
        <WebGLShader />

        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.8) 100%)',
          zIndex: 1, pointerEvents: 'none',
        }} />

        <FloatingParticles />

        {/* Green orb */}
        <div style={{
          position: 'absolute', top: '10%', left: '15%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(0,245,160,0.08) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(80px)', zIndex: 0,
          animation: 'float 8s ease-in-out infinite',
        }} />

        {/* Blue orb */}
        <div style={{
          position: 'absolute', bottom: '5%', right: '10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(80px)', zIndex: 0,
          animation: 'float-reverse 10s ease-in-out infinite',
        }} />

        <div style={{
          position: 'relative', zIndex: 2, textAlign: 'center',
          maxWidth: '880px', width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          transform: `translateY(${heroParallax.offset}px)`,
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: `1px solid ${T.green}60`, borderRadius: '9999px',
            padding: '6px 20px', marginBottom: '36px',
            background: 'rgba(0,245,160,0.04)',
            backdropFilter: 'blur(8px)',
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'translateY(0)' : 'translateY(-25px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            animation: heroLoaded ? 'gradient-border 4s ease-in-out infinite' : 'none',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: T.green, display: 'inline-block',
              animation: 'pulse-dot 1.5s ease-in-out infinite',
              boxShadow: `0 0 8px ${T.green}`,
            }} />
            <span style={{
              fontFamily: T.font, fontSize: '0.78rem', color: T.green, fontWeight: 500,
            }}>
              <span className="word-reveal" data-delay="0">HACK4IMPACT</span>
              <span className="word-reveal" data-delay="100"> — </span>
              <span className="word-reveal" data-delay="200">Track 2</span>
              <span className="word-reveal" data-delay="300"> — </span>
              <span className="word-reveal" data-delay="400">Team C-Sharks</span>
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: T.heading, fontWeight: 800,
            fontSize: 'clamp(2.6rem, 6vw, 4.4rem)', lineHeight: 1.2,
            color: '#fff', marginBottom: '28px',
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'translateY(0)' : 'translateY(-24px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
          }}>
            <span className="word-reveal" data-delay="200">Every</span>{' '}
            <span className="word-reveal" data-delay="350">Building</span><br />
            <span className="word-reveal" data-delay="500">Becomes</span>{' '}
            <span className="word-reveal" data-delay="650" style={{
              background: 'linear-gradient(135deg, #00F5A0, #00D4FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>a Smart</span><br />
            <span className="word-reveal" data-delay="800" style={{
              background: 'linear-gradient(135deg, #00D4FF, #7C6BFF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Energy Node</span>
          </h1>

          {/* Subheading */}
          <p className="word-reveal" data-delay="1100" style={{
            display: 'block', fontFamily: T.font,
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            color: T.text, maxWidth: '620px',
            margin: '0 auto 44px', lineHeight: 1.75,
          }}>
            EcoSync uses AI and blockchain to let buildings autonomously
            trade surplus solar power with each other — like an Airbnb
            for electricity, but fully automated and tamper-proof.
          </p>

          {/* CTA Buttons */}
          <div className="word-reveal" data-delay="1400" style={{
            display: 'flex', gap: '16px', justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: '56px',
          }}>
            <button
              onClick={onNavigateToDashboard}
              className="eco-btn-primary"
              style={{
                fontFamily: T.font, fontWeight: 600, fontSize: '0.95rem',
                padding: '15px 36px',
                background: 'linear-gradient(135deg, #00F5A0, #00D4FF)',
                color: '#04101E', border: 'none', borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 0 24px rgba(0,245,160,0.2), 0 4px 16px rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              View Live Dashboard <ArrowRight size={18} />
            </button>
            <button
              onClick={scrollToHow}
              className="eco-btn-secondary"
              style={{
                fontFamily: T.font, fontWeight: 600, fontSize: '0.95rem',
                padding: '15px 36px', background: 'rgba(0,245,160,0.04)',
                color: T.green, border: `1px solid ${T.green}40`,
                borderRadius: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
                backdropFilter: 'blur(8px)',
              }}
            >
              How It Works <ChevronDown size={18} />
            </button>
          </div>

          {/* Impact Stats with animated counters */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: '0', flexWrap: 'wrap',
          }}>
            {[
              { value: 30, suffix: '%', label: 'Less Energy Waste', color: T.green, delay: 1700 },
              { value: 100, suffix: '%', label: 'Infrastructure Uptime', color: T.blue, delay: 1850 },
              { value: 15, suffix: '%', label: 'Cheaper Electricity', color: T.yellow, delay: 2000 },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && (
                  <div style={{
                    width: '1px', height: '48px',
                    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)',
                    margin: '0 36px',
                  }} />
                )}
                <div className="word-reveal" data-delay={stat.delay} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                }}>
                  <div style={{
                    fontFamily: T.heading, fontWeight: 800, fontSize: '2.2rem',
                    color: stat.color, lineHeight: 1,
                  }}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div style={{
                    fontFamily: T.font, fontSize: '0.72rem',
                    color: T.muted, marginTop: '8px', letterSpacing: '0.02em',
                  }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 3,
          animation: 'scroll-hint 2s ease-in-out infinite',
          opacity: heroLoaded ? 0.5 : 0,
          transition: 'opacity 1s ease 2.5s',
        }}>
          <ChevronDown size={24} color={T.green} />
        </div>
      </section>

      {/* ================================================================
          SECTION 2 — THE PROBLEM
          ================================================================ */}
      <section ref={problemRef} className="eco-section" style={{
        padding: '120px 24px 100px',
        maxWidth: '1200px', margin: '0 auto',
        textAlign: 'center', position: 'relative',
      }}>
        <FloatingParticles />

        <div style={reveal(problemVis, 0, 'up')}>
          <div style={sectionLabel(T.red)}>⚡ THE PROBLEM</div>
          <h2 style={sectionHeading}>
            The global energy grid is <span style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>broken</span>
          </h2>
          <p style={{
            fontFamily: T.font, fontSize: '1rem', color: T.muted,
            maxWidth: '580px', margin: '0 auto 56px', lineHeight: 1.65,
          }}>
            Three critical failures that EcoSync directly solves
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {[
            {
              icon: <AlertTriangle size={24} />,
              title: '30% of renewable energy is wasted',
              text: "Solar and wind get switched off because grids can't balance supply and demand locally. Clean energy is wasted every single day.",
              gradient: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,142,83,0.05))',
              borderColor: 'rgba(255,107,107,0.3)',
              iconColor: T.red,
              delay: 0.1,
            },
            {
              icon: <Building2 size={24} />,
              title: 'Centralized grids fail modern cities',
              text: "Old infrastructure was built for one-way power flow. Solar panels made it bidirectional — and legacy grids simply can't handle it.",
              gradient: 'linear-gradient(135deg, rgba(255,209,102,0.12), rgba(255,142,83,0.04))',
              borderColor: 'rgba(255,209,102,0.3)',
              iconColor: T.yellow,
              delay: 0.2,
            },
            {
              icon: <Hospital size={24} />,
              title: 'Hospitals lose power in blackouts',
              text: 'No smart prioritization exists today. A grid crash takes down everything, including hospitals and critical infrastructure.',
              gradient: 'linear-gradient(135deg, rgba(124,107,255,0.12), rgba(255,107,107,0.04))',
              borderColor: 'rgba(124,107,255,0.3)',
              iconColor: T.purple,
              delay: 0.3,
            },
          ].map((card, i) => (
            <div
              key={i}
              className="eco-card"
              style={{
                ...reveal(problemVis, card.delay, 'up'),
                background: card.gradient,
                borderRadius: '16px', padding: '32px',
                textAlign: 'left',
                border: `1px solid ${card.borderColor}`,
                cursor: 'default',
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${card.borderColor}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px', color: card.iconColor,
              }}>
                {card.icon}
              </div>
              <h3 style={{
                fontFamily: T.heading, fontWeight: 800,
                fontSize: '1.1rem', color: '#fff',
                marginBottom: '12px', lineHeight: 1.35,
              }}>
                {card.title}
              </h3>
              <p style={{
                fontFamily: T.font, fontSize: '0.88rem',
                color: T.text, lineHeight: 1.65,
              }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider color={T.blue} />

      {/* ================================================================
          SECTION 3 — HOW IT WORKS (Alternating slide-in cards)
          ================================================================ */}
      <section id="how-it-works" ref={howRef} className="eco-section" style={{
        padding: '80px 24px 100px',
        maxWidth: '900px', margin: '0 auto',
        position: 'relative',
      }}>
        <div style={{ textAlign: 'center', ...reveal(howVis, 0, 'up') }}>
          <div style={sectionLabel(T.blue)}>🔄 HOW IT WORKS</div>
          <h2 style={sectionHeading}>
            5 steps, from <span style={{
              background: 'linear-gradient(135deg, #00D4FF, #00F5A0)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>solar panel</span> to <span style={{
              background: 'linear-gradient(135deg, #7C6BFF, #00D4FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>blockchain</span>
          </h2>
          <p style={{
            fontFamily: T.font, fontSize: '1rem', color: T.muted,
            maxWidth: '520px', margin: '0 auto 56px', lineHeight: 1.65,
          }}>
            In plain English — no engineering degree required
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {[
            {
              num: '01', icon: <Home size={20} />, title: 'Buildings Generate Solar',
              text: 'Each building has rooftop solar panels tracked by IoT sensors. Production, consumption, and battery level update every 15 minutes.',
              color: T.green,
            },
            {
              num: '02', icon: <Brain size={20} />, title: 'AI Predicts What\'s Coming',
              text: 'Our LSTM neural network predicts the next hour\'s energy state for every building with 95% accuracy — before the surplus or deficit even happens.',
              color: T.blue,
            },
            {
              num: '03', icon: <Bot size={20} />, title: 'AI Agents Negotiate Trades',
              text: 'Every building has its own AI agent (LangGraph). When Agent A sees surplus and Agent B runs short, they negotiate a peer-to-peer trade automatically.',
              color: T.purple,
            },
            {
              num: '04', icon: <Link2 size={20} />, title: 'Blockchain Seals the Deal',
              text: 'The agreed trade is written to a Polygon blockchain smart contract. Payment is automatic, transparent, and permanent.',
              color: T.yellow,
            },
            {
              num: '05', icon: <BarChart3 size={20} />, title: 'Live Dashboard Shows Everything',
              text: 'Every trade, prediction, and grid balance is visible in real time. Full transparency — from rooftop panel to blockchain transaction.',
              color: T.green,
            },
          ].map((step, i) => (
            <SlideInStepCard key={i} step={step} index={i} />
          ))}
        </div>
      </section>

      <SectionDivider color={T.purple} />

      {/* ================================================================
          SECTION 4 — TECH STACK
          ================================================================ */}
      <section ref={techRef} className="eco-section" style={{
        padding: '80px 24px 100px',
        maxWidth: '1000px', margin: '0 auto',
        textAlign: 'center', position: 'relative',
      }}>
        <div style={reveal(techVis, 0, 'zoom')}>
          <div style={sectionLabel(T.purple)}>🛠 TECH STACK</div>
          <h2 style={sectionHeading}>
            Built with <span style={{
              background: 'linear-gradient(135deg, #7C6BFF, #00D4FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>production-grade</span> tools
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px', marginTop: '40px',
        }}>
          {[
            { icon: <Brain size={20} />, name: 'TensorFlow LSTM', desc: 'Energy prediction AI', color: T.red, gradient: 'rgba(255,107,107,0.08)' },
            { icon: <Bot size={20} />, name: 'LangGraph', desc: 'Multi-agent negotiation', color: T.purple, gradient: 'rgba(124,107,255,0.08)' },
            { icon: <Link2 size={20} />, name: 'Polygon Blockchain', desc: 'Smart contract trades', color: T.blue, gradient: 'rgba(0,212,255,0.08)' },
            { icon: <Zap size={20} />, name: 'FastAPI', desc: 'Real-time Python backend', color: T.green, gradient: 'rgba(0,245,160,0.08)' },
            { icon: <Globe size={20} />, name: 'NVIDIA Isaac Sim', desc: 'Digital twin simulation', color: T.yellow, gradient: 'rgba(255,209,102,0.08)' },
            { icon: <BarChart3 size={20} />, name: 'React.js + Three.js', desc: '3D monitoring dashboard', color: '#22d3ee', gradient: 'rgba(34,211,238,0.08)' },
          ].map((tech, i) => (
            <div
              key={i}
              className="tech-chip"
              style={{
                ...reveal(techVis, 0.06 * (i + 1), 'zoom'),
                display: 'flex', alignItems: 'center', gap: '16px',
                background: tech.gradient,
                borderRadius: '14px', padding: '20px 24px',
                borderLeft: `3px solid ${tech.color}80`,
                border: `1px solid ${tech.color}20`,
                borderLeftWidth: '3px',
                borderLeftColor: `${tech.color}80`,
                textAlign: 'left', cursor: 'default',
              }}
            >
              <span style={{
                flexShrink: 0, display: 'flex',
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${tech.color}15`, alignItems: 'center',
                justifyContent: 'center', color: tech.color,
              }}>
                {tech.icon}
              </span>
              <div>
                <div style={{
                  fontFamily: T.heading, fontWeight: 800,
                  fontSize: '0.95rem', color: '#fff', marginBottom: '3px',
                }}>
                  {tech.name}
                </div>
                <div style={{
                  fontFamily: T.font, fontSize: '0.78rem', color: T.muted,
                }}>
                  {tech.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider color={T.green} />

      {/* ================================================================
          SECTION 5 — ARCHITECTURE
          ================================================================ */}
      <section ref={archRef} className="eco-section" style={{
        padding: '80px 24px 100px',
        maxWidth: '800px', margin: '0 auto', textAlign: 'center',
        position: 'relative',
      }}>
        <div style={reveal(archVis, 0, 'left')}>
          <div style={sectionLabel(T.green)}>🏗 ARCHITECTURE</div>
          <h2 style={sectionHeading}>How all the pieces connect</h2>
        </div>

        <div style={{
          ...reveal(archVis, 0.15, 'up'),
          background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(0,245,160,0.02))',
          border: `1px solid ${T.green}20`,
          borderRadius: '20px', padding: '36px 28px',
          textAlign: 'left',
          boxShadow: '0 0 60px rgba(0,245,160,0.03), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}>
          {[
            { dot: T.green, name: 'IoT Sensors / Isaac Sim', proto: 'MQTT / JSON', icon: <Eye size={14} /> },
            { dot: T.blue, name: 'Mosquitto MQTT Broker', proto: 'Paho listener', icon: <Globe size={14} /> },
            { dot: T.purple, name: 'FastAPI Backend', proto: 'LSTM inference', icon: <Zap size={14} /> },
            { dot: T.yellow, name: 'TensorFlow LSTM Model', proto: 'Agent state', icon: <Brain size={14} /> },
            { dot: T.green, name: 'LangGraph AI Agents', proto: 'Trade agreement', icon: <Bot size={14} /> },
            { dot: T.red, name: 'Polygon Smart Contract', proto: 'WebSocket', icon: <Link2 size={14} /> },
            { dot: T.blue, name: 'React Live Dashboard', proto: null, icon: <BarChart3 size={14} /> },
          ].map((layer, i) => (
            <div key={i} style={{
              opacity: archVis ? 1 : 0,
              transform: archVis ? 'translateX(0)' : 'translateX(-20px)',
              transition: `all 0.5s ease ${0.08 * (i + 1)}s`,
            }}>
              <div className="arch-layer" style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.04)',
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: layer.dot, flexShrink: 0,
                  boxShadow: `0 0 10px ${layer.dot}60`,
                }} />
                <span style={{
                  display: 'flex', alignItems: 'center', color: layer.dot,
                  opacity: 0.6, marginRight: '4px',
                }}>
                  {layer.icon}
                </span>
                <span style={{
                  fontFamily: T.font, fontWeight: 600,
                  fontSize: '0.88rem', color: '#fff',
                }}>
                  {layer.name}
                </span>
              </div>

              {layer.proto && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '2px 0 2px 22px',
                }}>
                  <div style={{
                    width: '2px', height: '22px',
                    background: `linear-gradient(to bottom, ${layer.dot}40, transparent)`,
                  }} />
                  <span style={{
                    fontFamily: T.mono, fontSize: '0.68rem',
                    color: T.muted, fontStyle: 'italic',
                  }}>
                    {layer.proto}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          SECTION 6 — FINAL CTA
          ================================================================ */}
      <section
        ref={ctaRef}
        style={{
          position: 'relative', minHeight: '520px',
          background: '#000000', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <DottedSurface
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', zIndex: 0,
          }}
        />

        {/* Fades */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '180px',
          background: 'linear-gradient(to bottom, #000000 0%, transparent 100%)',
          zIndex: 1, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
          background: 'linear-gradient(to top, #000000 0%, transparent 100%)',
          zIndex: 1, pointerEvents: 'none',
        }} />

        {/* Green glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,245,160,0.08) 0%, transparent 65%)',
          zIndex: 1, pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative', zIndex: 2, textAlign: 'center',
          padding: '80px 40px',
          ...reveal(ctaVis, 0, 'zoom'),
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '9999px',
            background: 'rgba(0,245,160,0.06)',
            border: '1px solid rgba(0,245,160,0.2)',
            marginBottom: '24px',
          }}>
            <Sparkles size={14} color={T.green} />
            <span style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.green }}>
              LIVE DEMO
            </span>
          </div>

          <h2 style={{
            fontFamily: T.heading, fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: '#fff', lineHeight: 1.15,
            marginBottom: '20px',
          }}>
            See it working <span style={{
              background: 'linear-gradient(135deg, #00F5A0, #00D4FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>live</span>
          </h2>

          <div style={{ marginBottom: '36px' }}>
            <BlurTextAnimation
              text="Watch AI agents negotiate energy trades in real time, then verify each one on the Polygon blockchain."
              fontSize="text-lg md:text-xl"
              textColor="text-white/55"
              animationDelay={3000}
            />
          </div>

          <button
            onClick={onNavigateToDashboard}
            className="eco-btn-primary"
            style={{
              fontFamily: T.font, fontWeight: 600, fontSize: '1.05rem',
              padding: '16px 44px',
              background: 'linear-gradient(135deg, #00F5A0, #00D4FF)',
              color: '#04101E', border: 'none', borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(0,245,160,0.25), 0 8px 32px rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', margin: '0 auto',
            }}
          >
            <Zap size={18} /> Open Live Dashboard <ArrowRight size={18} />
          </button>

          <p style={{
            fontFamily: T.mono, fontSize: '0.72rem',
            color: T.muted, marginTop: '20px',
            letterSpacing: '0.05em',
          }}>
            Simulating 50 buildings · LSTM · LangGraph · Polygon Mumbai
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#000000',
        borderTop: '1px solid rgba(0,245,160,0.08)',
        padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '8px',
        fontSize: '12px', color: 'rgba(255,255,255,0.25)',
        fontFamily: T.mono,
      }}>
        <span style={{ color: T.green, fontWeight: 600 }}>
          ⚡ EcoSync — Team C-Sharks
        </span>
        <span>HACK4IMPACT Track 2 · KIIT DU · 2026</span>
        <a
          href="https://github.com/ecosync-hackathon"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.2s' }}
        >
          github.com/ecosync-hackathon
        </a>
      </footer>
    </div>
  );
}
