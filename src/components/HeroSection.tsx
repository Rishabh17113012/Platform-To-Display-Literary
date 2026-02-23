import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";

/* ─── Right Side Decoration ─── */
const RightSideDecoration = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60);
    return () => clearInterval(t);
  }, []);

  // Floating ink droplets config (stable refs so no jitter)
  const droplets = useRef(
    Array.from({ length: 7 }).map((_, i) => ({
      x: 20 + Math.random() * 60,
      baseY: 10 + i * 13,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 0.5,
      size: 2 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.4,
    }))
  ).current;

  const t = tick / 60;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Cormorant+SC:wght@400;600;700&display=swap');

        @keyframes quill-write {
          0%   { stroke-dashoffset: 300; opacity: 0; }
          10%  { opacity: 1; }
          60%  { stroke-dashoffset: 0; opacity: 1; }
          80%  { opacity: 0.6; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes ink-drip {
          0%   { transform: scaleY(0); opacity: 0; transform-origin: top; }
          30%  { transform: scaleY(1); opacity: 1; transform-origin: top; }
          70%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(20px); }
        }
        @keyframes mandala-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes mandala-spin-rev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes verse-fade {
          0%,100% { opacity: 0; transform: translateY(8px); }
          20%,80% { opacity: 0.75; transform: translateY(0); }
        }
        @keyframes lotusBloom {
          0%   { transform: scale(0.7) rotate(-10deg); opacity: 0; }
          50%  { transform: scale(1.05) rotate(2deg); opacity: 0.9; }
          100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
        }
        @keyframes orb-float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-10px); }
        }
        @keyframes ink-pulse {
          0%,100% { opacity: 0.15; }
          50%     { opacity: 0.5; }
        }
        @keyframes calligraphy-draw {
          0%   { stroke-dashoffset: 500; }
          100% { stroke-dashoffset: 0; }
        }

        .right-deco { pointer-events: none; }
        .mandala-outer { animation: mandala-spin 28s linear infinite; transform-origin: center; }
        .mandala-inner { animation: mandala-spin-rev 18s linear infinite; transform-origin: center; }
        .verse-line-1 { animation: verse-fade 8s ease-in-out infinite; }
        .verse-line-2 { animation: verse-fade 8s ease-in-out 2s infinite; }
        .verse-line-3 { animation: verse-fade 8s ease-in-out 4s infinite; }
        .lotus-bloom  { animation: lotusBloom 2s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .orb-float    { animation: orb-float 4s ease-in-out infinite; }
        .calligraphy  {
          stroke-dasharray: 500;
          animation: calligraphy-draw 6s ease-in-out infinite alternate;
        }
        .ink-pulse    { animation: ink-pulse 3s ease-in-out infinite; }
      `}</style>

      {/* Fixed right panel */}
      <div
        className="right-deco fixed right-0 top-0 h-full flex flex-col items-center justify-center gap-8 pr-6 pl-2"
        style={{ width: 110, zIndex: 5 }}
      >
        {/* Thin vertical gold rule */}
        <div
          className="absolute left-0 top-[10%] bottom-[10%] w-px"
          style={{ background: 'linear-gradient(180deg, transparent, hsl(43,76%,52%,0.35) 30%, hsl(43,76%,52%,0.55) 50%, hsl(43,76%,52%,0.35) 70%, transparent)' }}
        />

        {/* ── Mandala ── */}
        <div style={{ position: 'relative', width: 72, height: 72 }}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ position: 'absolute', inset: 0 }}>
            {/* Outer ring */}
            <g className="mandala-outer" style={{ transformOrigin: '36px 36px' }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const x1 = 36 + 28 * Math.cos(angle);
                const y1 = 36 + 28 * Math.sin(angle);
                const x2 = 36 + 22 * Math.cos(angle);
                const y2 = 36 + 22 * Math.sin(angle);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(43,76%,52%)" strokeWidth="0.8" opacity="0.6" />;
              })}
              <circle cx="36" cy="36" r="28" fill="none" stroke="hsl(43,76%,52%)" strokeWidth="0.5" opacity="0.4" />
              <circle cx="36" cy="36" r="22" fill="none" stroke="hsl(43,70%,48%)" strokeWidth="0.5" opacity="0.3" />
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2;
                return <circle key={i} cx={36 + 25 * Math.cos(a)} cy={36 + 25 * Math.sin(a)} r="1.5" fill="hsl(43,80%,60%)" opacity="0.7" />;
              })}
            </g>
            {/* Inner ring */}
            <g className="mandala-inner" style={{ transformOrigin: '36px 36px' }}>
              {Array.from({ length: 6 }).map((_, i) => {
                const a = (i / 6) * Math.PI * 2;
                const x1 = 36 + 16 * Math.cos(a); const y1 = 36 + 16 * Math.sin(a);
                const x2 = 36 + 10 * Math.cos(a); const y2 = 36 + 10 * Math.sin(a);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(43,80%,60%)" strokeWidth="1" opacity="0.7" />;
              })}
              <circle cx="36" cy="36" r="16" fill="none" stroke="hsl(43,76%,52%)" strokeWidth="0.5" opacity="0.5" />
            </g>
            {/* Center dot */}
            <circle cx="36" cy="36" r="3" fill="hsl(43,85%,65%)" opacity="0.9" />
            <circle cx="36" cy="36" r="6" fill="none" stroke="hsl(43,76%,52%)" strokeWidth="0.8" opacity="0.6" />
          </svg>
          {/* Pulsing glow behind mandala */}
          <div className="ink-pulse absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, hsl(43,76%,52%,0.2) 0%, transparent 70%)' }} />
        </div>

        {/* ── Floating verse lines (Urdu/Hindi poetry feel) ── */}
        <div className="flex flex-col items-center gap-3" style={{ fontSize: 9, color: 'hsl(43,60%,52%)', fontFamily: 'Georgia, serif', letterSpacing: '0.05em', lineHeight: 1.8 }}>
          <span className="verse-line-1 text-center" style={{ writingMode: 'horizontal-tb', opacity: 0 }}>शब्दों की</span>
          <div className="w-px h-4" style={{ background: 'linear-gradient(180deg, transparent, hsl(43,76%,52%,0.4), transparent)' }} />
          <span className="verse-line-2 text-center" style={{ opacity: 0 }}>दुनिया में</span>
          <div className="w-px h-4" style={{ background: 'linear-gradient(180deg, transparent, hsl(43,76%,52%,0.4), transparent)' }} />
          <span className="verse-line-3 text-center" style={{ opacity: 0 }}>स्वागत है</span>
        </div>

        {/* ── Calligraphic SVG quill stroke ── */}
        <svg width="48" height="80" viewBox="0 0 48 80" fill="none" style={{ opacity: 0.65 }}>
          {/* Quill feather */}
          <path
            d="M24 4 C24 4 8 16 6 34 C4 52 14 64 24 76"
            stroke="hsl(43,76%,52%)"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="calligraphy"
            fill="none"
          />
          <path
            d="M24 4 C24 4 40 16 42 34 C44 52 34 64 24 76"
            stroke="hsl(43,65%,42%)"
            strokeWidth="0.7"
            strokeLinecap="round"
            className="calligraphy"
            fill="none"
            style={{ animationDelay: '0.5s' }}
          />
          {/* Barbs */}
          {[20, 34, 48, 60].map((y, i) => (
            <g key={i}>
              <line x1="24" y1={y} x2={24 - 10 + i * 2} y2={y - 5} stroke="hsl(43,70%,50%)" strokeWidth="0.5" opacity="0.5" />
              <line x1="24" y1={y} x2={24 + 10 - i * 2} y2={y - 5} stroke="hsl(43,70%,50%)" strokeWidth="0.5" opacity="0.5" />
            </g>
          ))}
          {/* Ink drop at tip */}
          <circle cx="24" cy="76" r="2.5" fill="hsl(43,80%,55%)" opacity="0.8" className="orb-float" />
        </svg>

        {/* ── Floating ink orbs ── */}
        <div style={{ position: 'relative', width: 60, height: 90 }}>
          {droplets.map((d, i) => {
            const y = d.baseY + Math.sin(t * d.speed + d.phase) * 6;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${d.x}%`,
                  top: `${y}%`,
                  width: d.size,
                  height: d.size,
                  background: `hsl(43, 76%, ${52 + i * 3}%)`,
                  opacity: d.opacity,
                  transition: 'top 0.1s linear',
                  boxShadow: `0 0 ${d.size * 2}px hsl(43,76%,52%,0.4)`,
                }}
              />
            );
          })}
        </div>

        {/* ── Bottom diamond ornament ── */}
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ opacity: 0.5 }}>
          <polygon points="10,1 19,10 10,19 1,10" fill="none" stroke="hsl(43,76%,52%)" strokeWidth="1" />
          <circle cx="10" cy="10" r="2" fill="hsl(43,80%,60%)" />
        </svg>
      </div>
    </>
  );
};

const GoldenFeather = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg
      className="absolute animate-feather"
      style={{ top: "30%", left: "-5%" }}
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
    >
      <path d="M30 5C30 5 15 15 10 30C5 45 15 55 30 55C25 45 20 35 25 25C30 15 30 5 30 5Z" fill="url(#featherGrad)" opacity="0.6" />
      <path d="M30 5C30 5 45 15 50 30C55 45 45 55 30 55C35 45 40 35 35 25C30 15 30 5 30 5Z" fill="url(#featherGrad2)" opacity="0.4" />
      <line x1="30" y1="5" x2="30" y2="55" stroke="hsl(43 76% 52%)" strokeWidth="0.5" opacity="0.5" />
      <defs>
        <linearGradient id="featherGrad" x1="10" y1="5" x2="30" y2="55">
          <stop offset="0%" stopColor="hsl(43, 80%, 65%)" />
          <stop offset="100%" stopColor="hsl(43, 76%, 52%)" />
        </linearGradient>
        <linearGradient id="featherGrad2" x1="50" y1="5" x2="30" y2="55">
          <stop offset="0%" stopColor="hsl(43, 76%, 52%)" />
          <stop offset="100%" stopColor="hsl(43, 70%, 38%)" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary/20 animate-glow-pulse"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
        }}
      />
    ))}
  </div>
);

/* ─── Injected CSS ─── */
const BookStyles = () => (
  <style>{`
    @keyframes book-float {
      0%, 100% { transform: rotateX(2deg) rotateY(-8deg) translateY(0px); }
      50%       { transform: rotateX(2deg) rotateY(-8deg) translateY(-14px); }
    }
    @keyframes shimmer-sweep {
      0%   { transform: translateX(-120%) skewX(-15deg); opacity: 0; }
      30%  { opacity: 1; }
      100% { transform: translateX(320%) skewX(-15deg); opacity: 0; }
    }
    @keyframes dust-rise {
      0%   { opacity: 0; transform: translate(0, 0) scale(1); }
      20%  { opacity: 0.8; }
      100% { opacity: 0; transform: translate(var(--dx), -70px) scale(0.2); }
    }
    @keyframes glow-breathe {
      0%, 100% { opacity: 0.35; transform: scaleX(1); }
      50%       { opacity: 0.65; transform: scaleX(1.08); }
    }
    @keyframes page-turn-flash {
      0%   { opacity: 0; }
      30%  { opacity: 0.15; }
      100% { opacity: 0; }
    }

    .book-scene   { perspective: 1500px; }
    .book-body    {
      transform-style: preserve-3d;
      transform: rotateX(2deg) rotateY(-8deg);
      animation: book-float 5.5s ease-in-out infinite;
      transition: transform 0.55s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .book-scene:hover .book-body {
      transform: rotateX(6deg) rotateY(-22deg) translateY(-12px) scale(1.04);
      animation-play-state: paused;
    }

    /* Shimmer on hover */
    .book-cover-shimmer {
      position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(
        105deg,
        transparent 38%,
        rgba(255,220,100,0.18) 50%,
        rgba(255,255,255,0.10) 55%,
        transparent 65%
      );
      transform: translateX(-120%) skewX(-15deg);
      border-radius: inherit;
    }
    .book-scene:hover .book-cover-shimmer {
      animation: shimmer-sweep 0.85s ease forwards;
    }

    /* Glow under book */
    .book-floor-glow {
      animation: glow-breathe 4s ease-in-out infinite;
    }

    /* Dust */
    .dust-particle {
      animation: dust-rise linear forwards;
      pointer-events: none;
    }

    /* Click flash */
    .page-flash {
      animation: page-turn-flash 0.4s ease forwards;
    }
  `}</style>
);

/* ─── Dust Particle Component ─── */
const DustParticle = ({ x, y, dx, delay, dur }: { x: number; y: number; dx: number; delay: number; dur: number }) => (
  <div
    className="dust-particle absolute rounded-full"
    style={{
      left: x,
      top: y,
      width: `${2 + Math.random() * 3}px`,
      height: `${2 + Math.random() * 3}px`,
      background: `hsl(43, 76%, ${58 + Math.random() * 18}%)`,
      opacity: 0,
      animationDelay: `${delay}s`,
      animationDuration: `${dur}s`,
      ['--dx' as any]: `${dx}px`,
    }}
  />
);

/* ─── 3D Book ─── */
const Book3D = ({ onClick }: { onClick: () => void }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const bodyRef  = useRef<HTMLDivElement>(null);
  const [dusts, setDusts]     = useState<any[]>([]);
  const [flashing, setFlashing] = useState(false);
  const idRef = useRef(0);

  /* Mouse tilt */
  const onMove = (e: React.MouseEvent) => {
    if (!sceneRef.current || !bodyRef.current) return;
    const r = sceneRef.current.getBoundingClientRect();
    const rx = ((e.clientY - r.top  - r.height / 2) / r.height) * 10;
    const ry = ((e.clientX - r.left - r.width  / 2) / r.width ) * -16;
    bodyRef.current.style.transform = `rotateX(${rx + 2}deg) rotateY(${ry - 8}deg) translateY(-12px) scale(1.04)`;
    bodyRef.current.style.animationPlayState = 'paused';
  };
  const onLeave = () => {
    if (!bodyRef.current) return;
    bodyRef.current.style.transform = '';
    bodyRef.current.style.animationPlayState = 'running';
  };

  const handleClick = () => {
    setFlashing(true);
    setTimeout(() => setFlashing(false), 450);
    // Spawn dust
    const batch = Array.from({ length: 12 }).map(() => ({
      id: idRef.current++,
      x: 20 + Math.random() * 180,
      y: 20 + Math.random() * 280,
      dx: -30 + Math.random() * 60,
      delay: Math.random() * 0.3,
      dur: 0.9 + Math.random() * 0.8,
    }));
    setDusts(p => [...p, ...batch]);
    setTimeout(() => {
      const ids = new Set(batch.map(b => b.id));
      setDusts(p => p.filter(d => !ids.has(d.id)));
    }, 2500);
    onClick();
  };

  const BOOK_W = 224; // w-56
  const BOOK_H = 320; // h-80
  const DEPTH  = 18;  // page block depth in px

  return (
    <div
      ref={sceneRef}
      className="book-scene cursor-pointer relative select-none"
      style={{ width: BOOK_W, height: BOOK_H }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={handleClick}
    >
      <BookStyles />

      {/* Floor glow */}
      <div
        className="book-floor-glow absolute pointer-events-none"
        style={{
          bottom: -28,
          left: '8%',
          width: '84%',
          height: 20,
          background: 'radial-gradient(ellipse at 50% 50%, hsl(43,76%,52%,0.55), transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Dust layer */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {dusts.map(d => <DustParticle key={d.id} {...d} />)}
      </div>

      {/* Book body — preserve-3d container */}
      <div
        ref={bodyRef}
        className="book-body absolute inset-0"
        style={{ transformStyle: 'preserve-3d', width: BOOK_W, height: BOOK_H }}
      >
        {/* ── BACK COVER ── */}
        <div
          className="absolute inset-0 rounded-r-md rounded-l-sm"
          style={{
            transform: `translateZ(-${DEPTH}px)`,
            background: 'linear-gradient(135deg, hsl(0,0%,7%), hsl(0,0%,10%))',
          }}
        />

        {/* ── SPINE FACE ── */}
        <div
          className="absolute top-0 left-0 rounded-l-sm overflow-hidden"
          style={{
            width: DEPTH,
            height: BOOK_H,
            transform: `rotateY(-90deg) translateX(-${DEPTH}px)`,
            transformOrigin: 'left center',
            background: 'linear-gradient(180deg, hsl(43,68%,28%) 0%, hsl(43,80%,50%) 35%, hsl(43,76%,44%) 65%, hsl(43,65%,26%) 100%)',
            boxShadow: 'inset -3px 0 8px rgba(0,0,0,0.45), inset 2px 0 5px rgba(255,210,80,0.12)',
          }}
        >
          {/* Spine ridges */}
          {[14, 50, 86].map(pct => (
            <div key={pct} className="absolute w-full" style={{ top: `${pct}%`, height: 2, background: 'linear-gradient(90deg, transparent, rgba(255,200,80,0.45), transparent)' }} />
          ))}
          {/* Spine text */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            <span style={{
              fontFamily: '"Cinzel", Georgia, serif',
              fontSize: 7,
              letterSpacing: '0.3em',
              background: 'linear-gradient(180deg, hsl(43,90%,72%), hsl(43,76%,52%), hsl(43,90%,68%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}>HR KI DUNIYA</span>
          </div>
        </div>



        {/* ── TOP EDGE ── */}
        <div
          className="absolute left-0 top-0"
          style={{
            width: BOOK_W,
            height: DEPTH,
            transform: `rotateX(90deg) translateZ(-${DEPTH}px)`,
            transformOrigin: 'center top',
            background: 'linear-gradient(90deg, hsl(43,65%,30%), hsl(40,25%,88%), hsl(40,25%,88%), hsl(43,65%,30%))',
          }}
        />

        {/* ── FRONT COVER ── */}
        <div
          className="absolute inset-0 rounded-r-md rounded-l-sm overflow-hidden"
          style={{
            transform: 'translateZ(0px)',
            background: `
              radial-gradient(ellipse at 30% 20%, hsl(0,0%,18%) 0%, transparent 60%),
              linear-gradient(160deg, hsl(0,0%,15%) 0%, hsl(0,0%,9%) 50%, hsl(0,0%,12%) 100%)
            `,
            boxShadow: `
              8px 6px 40px rgba(0,0,0,0.7),
              16px 12px 60px rgba(0,0,0,0.4),
              -1px 0 6px rgba(0,0,0,0.6),
              inset 4px 0 14px rgba(0,0,0,0.55),
              inset -1px 0 3px rgba(255,200,80,0.06),
              inset 0 1px 4px rgba(255,255,255,0.04)
            `,
          }}
        >
          {/* Subtle leather/linen cross-hatch texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.013) 3px, rgba(255,255,255,0.013) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.013) 3px, rgba(255,255,255,0.013) 4px)
              `,
            }}
          />

          {/* Shimmer sweep on hover */}
          <div className="book-cover-shimmer" />

          {/* Click flash */}
          {flashing && (
            <div className="page-flash absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,220,100,0.2), transparent 70%)' }} />
          )}

          {/* Outer decorative border */}
          <div
            className="absolute pointer-events-none"
            style={{ inset: 14, border: '1px solid hsl(43,62%,40% / 0.55)', borderRadius: 1 }}
          />
          {/* Inner thin border */}
          <div
            className="absolute pointer-events-none"
            style={{ inset: 18, border: '0.5px solid hsl(43,60%,40% / 0.28)', borderRadius: 1 }}
          />

          {/* Corner ornaments */}
          {[
            { style: { top: 16, left: 16 }, rotate: 0 },
            { style: { top: 16, right: 16 }, rotate: 90 },
            { style: { bottom: 16, right: 16 }, rotate: 180 },
            { style: { bottom: 16, left: 16 }, rotate: 270 },
          ].map(({ style, rotate }, i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 14 14" className="absolute" style={{ ...style, opacity: 0.65, transform: `rotate(${rotate}deg)` }}>
              <path d="M2 12 L2 2 L12 2" stroke="hsl(43,76%,52%)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <circle cx="2" cy="2" r="1.5" fill="hsl(43,76%,52%)" />
            </svg>
          ))}

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
            {/* Top ornament */}
            <svg width="36" height="36" viewBox="0 0 36 36">
              <polygon points="18,3 33,18 18,33 3,18" fill="none" stroke="hsl(43,76%,52%)" strokeWidth="0.9" opacity="0.7" />
              <polygon points="18,9 27,18 18,27 9,18" fill="hsl(43,70%,45%)" opacity="0.2" />
              <circle cx="18" cy="18" r="2.5" fill="hsl(43,85%,65%)" opacity="0.9" />
              <line x1="18" y1="3" x2="18" y2="33" stroke="hsl(43,76%,52%)" strokeWidth="0.4" opacity="0.4" />
              <line x1="3" y1="18" x2="33" y2="18" stroke="hsl(43,76%,52%)" strokeWidth="0.4" opacity="0.4" />
            </svg>

            {/* Title */}
            <h2
              style={{
                fontFamily: '"Cinzel", "Trajan Pro", Georgia, serif',
                fontSize: 22,
                letterSpacing: '0.14em',
                lineHeight: 1.3,
                fontWeight: 700,
                textAlign: 'center',
                background: 'linear-gradient(135deg, hsl(43,95%,72%) 0%, hsl(43,80%,55%) 30%, hsl(43,95%,80%) 50%, hsl(43,76%,50%) 70%, hsl(43,90%,70%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 8px hsl(43,80%,55%/0.4))',
              }}
            >
              HR ki<br />Duniya
            </h2>

            {/* Ornamental rule */}
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(43,76%,50%), hsl(43,76%,52%))' }} />
              <svg width="10" height="10" viewBox="0 0 10 10">
                <polygon points="5,1 9,5 5,9 1,5" fill="none" stroke="hsl(43,76%,52%)" strokeWidth="0.8" />
                <circle cx="5" cy="5" r="1.5" fill="hsl(43,80%,60%)" />
              </svg>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, hsl(43,76%,52%), hsl(43,76%,50%), transparent)' }} />
            </div>

            {/* Subtitle */}
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: 8,
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              color: 'hsl(43,58%,52%)',
              opacity: 0.85,
            }}>Poetry &amp; Prose</p>

            {/* Hindi line */}
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'hsl(43,48%,50%)',
              opacity: 0.65,
            }}>कविताएँ · कहानियाँ</p>

            {/* Bottom ornament */}
            <svg width="24" height="24" viewBox="0 0 24 24" style={{ opacity: 0.65, marginTop: 2 }}>
              <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="hsl(43,76%,52%)" strokeWidth="0.8" />
              <circle cx="12" cy="12" r="2" fill="hsl(43,82%,62%)" />
            </svg>
          </div>


        </div>
      </div>
    </div>
  );
};

/* ─── Hero Section ─── */
const HeroSection = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(false);

  const playPageFlipSound = () => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain-overlay">
      <RightSideDecoration />
      <GoldenFeather />
      <Particles />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center">
        {/* Title */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <p className="font-body text-lg tracking-[0.3em] text-muted-foreground uppercase">
            A Collection of Words
          </p>
          <h1
            className="text-5xl md:text-7xl lg:text-8xl gold-text-gradient gold-text-glow"
            style={{
              fontFamily: '"Cormorant SC", "Cormorant Garamond", Georgia, serif',
              fontWeight: 600,
              letterSpacing: '0.08em',
              lineHeight: 1.1,
              fontStyle: 'italic',
            }}
          >
            HR ki Duniya
          </h1>
          <p className="font-body text-xl md:text-2xl text-foreground/60 max-w-xl mx-auto">
            कविताएँ · कहानियाँ · विचार
          </p>
        </div>

        <p className="font-body text-sm md:text-base text-foreground/70 max-w-2xl mx-auto leading-relaxed tracking-wide">
          Read original Hindi poems, stories, and reflections.
        </p>

        {/* 3D Book */}
        <div className="animate-fade-up flex items-center justify-center" style={{ animationDelay: '0.5s', paddingBottom: 40 }}>
          <Book3D onClick={() => { playPageFlipSound(); navigate('/book'); }} />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 animate-fade-up" style={{ animationDelay: '0.8s' }}>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/book')}
              onMouseEnter={playPageFlipSound}
              className="flex items-center gap-3 px-8 py-3 gold-gradient text-primary-foreground font-cinzel tracking-widest text-sm rounded-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            >
              <BookOpen size={18} />
              Open the Book
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center justify-center w-10 h-10 rounded-sm border border-primary/30 text-muted-foreground hover:text-primary hover:border-primary/60 transition-all duration-300 group"
              title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
            >
              {soundEnabled
                ? <Volume2 size={16} className="group-hover:scale-110 transition-transform" />
                : <VolumeX size={16} className="group-hover:scale-110 transition-transform" />}
            </button>
          </div>
          <button
            onClick={() => { playPageFlipSound(); navigate('/book?random=true'); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm tracking-wide"
          >
            <Sparkles size={14} />
            Open to a Random Page
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;