import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [easterEgg, setEasterEgg] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 7) {
      setEasterEgg(true);
      setLogoClicks(0);
      setTimeout(() => setEasterEgg(false), 8000);
    }
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/book", label: "The Book" },
    { to: "/about", label: "About" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/90 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={handleLogoClick} className="focus:outline-none">
            <Link to="/" className="font-cinzel text-xl md:text-2xl tracking-widest gold-text-gradient font-bold">
              HR ki Duniya
            </Link>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-body text-lg tracking-wide golden-underline-hover transition-colors duration-300 ${
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground/70 hover:text-primary transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border animate-fade-up">
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`font-body text-lg tracking-wide transition-colors ${
                    location.pathname === link.to ? "text-primary" : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Easter Egg */}
      {easterEgg && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-8 animate-fade-up">
          <div className="max-w-lg text-center space-y-6">
            <div className="text-primary text-5xl">✦</div>
            <h2 className="font-display text-2xl md:text-3xl gold-text-gradient">
              छुपी हुई कविता
            </h2>
            <div className="golden-divider" />
            <p className="font-body text-lg md:text-xl leading-relaxed text-foreground/80 italic">
              "शब्दों के पीछे छुपा है एक राज़,<br />
              जो ढूँढे उसे, मिले हर आवाज़।<br />
              सात बार दस्तक दी तुमने द्वार पर,<br />
              खुल गया ये ख़ज़ाना, बस तुम्हारे लिए।"
            </p>
            <div className="golden-divider" />
            <p className="text-muted-foreground text-sm font-body">— HR ki Duniya का रहस्य</p>
            <button
              onClick={() => setEasterEgg(false)}
              className="text-primary/60 hover:text-primary text-sm transition-colors font-body"
            >
              वापस जाएँ ✦
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
