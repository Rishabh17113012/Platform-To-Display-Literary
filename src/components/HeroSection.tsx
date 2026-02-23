import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

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
      <path
        d="M30 5C30 5 15 15 10 30C5 45 15 55 30 55C25 45 20 35 25 25C30 15 30 5 30 5Z"
        fill="url(#featherGrad)"
        opacity="0.6"
      />
      <path
        d="M30 5C30 5 45 15 50 30C55 45 45 55 30 55C35 45 40 35 35 25C30 15 30 5 30 5Z"
        fill="url(#featherGrad2)"
        opacity="0.4"
      />
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


const HeroSection = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(false);

  const playPageFlipSound = () => {
    if (!soundEnabled) return;
    // Create a simple page-flip sound effect
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create oscillator for page-flip sound
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    // Frequency sweep from high to low
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    
    // Gain envelope
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain-overlay">
      <GoldenFeather />
      <Particles />
      
      {/* Radial glow behind the book */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center">
        {/* Title */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <p className="font-body text-lg tracking-[0.3em] text-muted-foreground uppercase">
            A Collection of Words
          </p>
          <h1 className="font-cinzel text-5xl md:text-7xl lg:text-8xl tracking-wider gold-text-gradient gold-text-glow font-bold">
            HR ki Duniya
          </h1>
          <p className="font-body text-xl md:text-2xl text-foreground/60 max-w-xl mx-auto">
            कविताएँ · कहानियाँ · विचार
          </p>
        </div>

        {/* Tagline */}
        <p className="font-body text-sm md:text-base text-foreground/70 max-w-2xl mx-auto leading-relaxed tracking-wide">
          Read original Hindi poems, stories, and reflections.
        </p>

        {/* 3D Book with enhanced interactions */}
        <div
          className="animate-fade-up cursor-pointer group book-tilt-hover book-glow"
          style={{ animationDelay: "0.5s", perspective: "1200px" }}
          onClick={() => {
            playPageFlipSound();
            navigate("/book");
          }}
        >
          <div className="relative animate-float" style={{ transformStyle: "preserve-3d" }}>
            {/* Book body */}
            <div
              className="relative w-56 h-80 md:w-64 md:h-96 rounded-r-lg rounded-l-sm gold-glow transition-all duration-700 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, hsl(0 0% 12%), hsl(0 0% 8%))",
                transform: "rotateY(-8deg) rotateX(2deg)",
                transformStyle: "preserve-3d",
                boxShadow: "8px 8px 30px rgba(0,0,0,0.5), -2px 0 10px rgba(0,0,0,0.3), inset -3px 0 8px rgba(0,0,0,0.3)",
              }}
            >
              {/* Spine */}
              <div
                className="absolute left-0 top-0 w-4 h-full rounded-l-sm"
                style={{
                  background: "linear-gradient(90deg, hsl(43 70% 38%), hsl(43 76% 52%), hsl(43 70% 38%))",
                  boxShadow: "inset -2px 0 4px rgba(0,0,0,0.3)",
                }}
              />
              
              {/* Cover content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pl-10">
                {/* Top ornament */}
                <div className="text-primary/60 text-2xl mb-4">✦</div>
                
                {/* Embossed border */}
                <div className="absolute inset-6 left-10 border border-primary/30 rounded-sm" />
                
                <h2 className="font-cinzel text-xl md:text-2xl gold-text-gradient tracking-[0.15em] text-center leading-tight font-bold">
                  HR ki<br />Duniya
                </h2>
                
                <div className="w-16 h-px bg-primary/40 my-4" />
                
                <p className="font-body text-xs tracking-[0.25em] text-primary/50 uppercase">
                  Poetry & Prose
                </p>
                
                {/* Bottom ornament */}
                <div className="text-primary/60 text-2xl mt-4">✦</div>
              </div>
            </div>

            {/* Page edges */}
            <div
              className="absolute right-0 top-2 w-3 h-[calc(100%-16px)]"
              style={{
                background: "linear-gradient(90deg, hsl(40 30% 88%), hsl(40 30% 92%), hsl(40 30% 88%))",
                borderRadius: "0 2px 2px 0",
                transform: "translateX(2px)",
              }}
            />
          </div>
        </div>

        {/* CTA with Sound Toggle */}
        <div className="flex flex-col items-center gap-4 animate-fade-up" style={{ animationDelay: "0.8s" }}>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/book")}
              onMouseEnter={playPageFlipSound}
              className="flex items-center gap-3 px-8 py-3 gold-gradient text-primary-foreground font-cinzel tracking-widest text-sm rounded-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            >
              <BookOpen size={18} />
              Open the Book
            </button>
            
            {/* Sound Toggle Button */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center justify-center w-10 h-10 rounded-sm border border-primary/30 text-muted-foreground hover:text-primary hover:border-primary/60 transition-all duration-300 group"
              title={soundEnabled ? "Sound enabled" : "Sound disabled"}
            >
              {soundEnabled ? (
                <Volume2 size={16} className="group-hover:scale-110 transition-transform" />
              ) : (
                <VolumeX size={16} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
          
          <button
            onClick={() => {
              playPageFlipSound();
              navigate("/book?random=true");
            }}
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
