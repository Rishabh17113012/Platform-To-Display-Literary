import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bookmark, BookOpen, Sun, Moon, ScrollText, Shuffle } from "lucide-react";
import { useWritings, Writing } from "@/hooks/useWritings";
import Navbar from "@/components/Navbar";

type ReadingMode = "ivory" | "night" | "sepia";

const BookPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const { writings, loading, genres, types } = useWritings(
    selectedType || undefined,
    selectedGenre || undefined
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [readingMode, setReadingMode] = useState<ReadingMode>("ivory");
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem("hr-bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  // Resume reading
  useEffect(() => {
    const saved = localStorage.getItem("hr-last-page");
    if (saved && !searchParams.get("random")) {
      setCurrentPage(parseInt(saved, 10));
    }
  }, []);

  // Random page
  useEffect(() => {
    if (searchParams.get("random") === "true" && writings.length > 0) {
      setCurrentPage(Math.floor(Math.random() * writings.length));
    }
  }, [searchParams, writings.length]);

  // Save progress
  useEffect(() => {
    localStorage.setItem("hr-last-page", currentPage.toString());
  }, [currentPage]);

  // Save bookmarks
  useEffect(() => {
    localStorage.setItem("hr-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const currentWriting = writings[currentPage];

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const goRandom = () => {
    if (writings.length > 1) {
      let next = currentPage;
      while (next === currentPage) {
        next = Math.floor(Math.random() * writings.length);
      }
      setCurrentPage(next);
    }
  };

  const paperClass = readingMode === "ivory" ? "paper-ivory" : readingMode === "sepia" ? "paper-sepia" : "paper-night";

  const modeIcons: Record<ReadingMode, { icon: typeof Sun; label: string }> = {
    ivory: { icon: Sun, label: "Day" },
    night: { icon: Moon, label: "Night" },
    sepia: { icon: ScrollText, label: "Sepia" },
  };

  const typeLabels: Record<string, string> = {
    poem: "कविताएँ (Poems)",
    story: "कहानियाँ (Stories)",
    quote: "विचार (Quotes)",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Type filters - only show if multiple types */}
          {types.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => { setSelectedType(""); setCurrentPage(0); }}
                className={`px-5 py-2 rounded-sm font-body text-sm tracking-wider transition-all duration-300 ${
                  !selectedType
                    ? "gold-gradient text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-primary hover:border-primary/30"
                }`}
              >
                All
              </button>
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => { setSelectedType(t); setCurrentPage(0); }}
                  className={`px-5 py-2 rounded-sm font-body text-sm tracking-wider transition-all duration-300 ${
                    selectedType === t
                      ? "gold-gradient text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-primary hover:border-primary/30"
                  }`}
                >
                  {typeLabels[t] || t}
                </button>
              ))}
            </div>
          )}

          {/* Genre filter - only if >1 genre */}
          {genres.length > 1 && (
            <div className="flex justify-center">
              <select
                value={selectedGenre}
                onChange={(e) => { setSelectedGenre(e.target.value); setCurrentPage(0); }}
                className="bg-secondary border border-border rounded-sm px-4 py-2 font-body text-sm text-foreground/80 focus:outline-none focus:border-primary/50"
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Reading mode & controls */}
        <div className="flex justify-center gap-3 mb-6">
          {(Object.keys(modeIcons) as ReadingMode[]).map((mode) => {
            const { icon: Icon, label } = modeIcons[mode];
            return (
              <button
                key={mode}
                onClick={() => setReadingMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-body tracking-wider transition-all ${
                  readingMode === mode
                    ? "gold-gradient text-primary-foreground"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
          <button
            onClick={goRandom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-body tracking-wider text-muted-foreground hover:text-primary transition-all"
          >
            <Shuffle size={14} />
            Random
          </button>
        </div>

        {/* Book area */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-primary animate-glow-pulse font-cinzel tracking-widest">
              Opening the book...
            </div>
          </div>
        ) : writings.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-xl text-muted-foreground">
              No writings found in this category yet.
            </p>
          </div>
        ) : currentWriting ? (
          <div className="relative">
            {/* The page */}
            <div
              className={`relative max-w-2xl mx-auto rounded-sm page-shadow paper-texture vignette transition-colors duration-500 ${paperClass}`}
            >
              <div className="p-8 md:p-12 lg:p-16 min-h-[60vh] relative">
                {/* Page Watermark - visible in all modes */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  <div className="text-6xl md:text-7xl font-cinzel font-bold text-center" style={{
                    transform: 'rotate(-45deg)',
                    color: readingMode === 'night' ? '#d4af37' : readingMode === 'sepia' ? '#8B6F47' : '#9B8B7A',
                    opacity: readingMode === 'night' ? 0.08 : 0.12,
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.2em',
                    mixBlendMode: readingMode === 'night' ? 'screen' : 'multiply',
                    textShadow: readingMode === 'night' ? 'none' : '0 0 1px rgba(0,0,0,0.1)'
                  }}>
                    HR Ki Duniya
                  </div>
                </div>

                {/* Bookmark Ribbon */}
                <div
                  onClick={() => toggleBookmark(currentWriting.id)}
                  className={`bookmark-ribbon ${bookmarks.includes(currentWriting.id) ? "active" : ""}`}
                  title={bookmarks.includes(currentWriting.id) ? "Remove bookmark" : "Add bookmark"}
                />

                {/* Content */}
                <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <span className={`text-xs font-body tracking-[0.2em] uppercase ${
                    readingMode === "night" ? "text-primary/60" : "text-gold-dark/60"
                  }`}>
                    {currentWriting.type === "poem" ? "कविता" : currentWriting.type === "story" ? "कहानी" : "विचार"}
                  </span>
                  <span className={`text-xs ${readingMode === "night" ? "text-primary/30" : "text-gold-dark/20"}`}>•</span>
                  <span className={`text-xs font-body tracking-wider ${
                    readingMode === "night" ? "text-primary/40" : "text-gold-dark/40"
                  }`}>
                    {currentWriting.genre}
                  </span>
                </div>

                {/* Title */}
                <h2 className={`font-display text-2xl md:text-3xl mb-6 ${
                  readingMode === "night" ? "text-primary" : "text-gold-dark"
                }`}>
                  {currentWriting.title}
                </h2>

                {/* Divider */}
                <div className={`w-20 h-px mb-8 ${
                  readingMode === "night" ? "bg-primary/30" : "bg-gold-dark/20"
                }`} />

                {/* Content */}
                <div className={`font-body text-lg md:text-xl leading-relaxed whitespace-pre-line ${
                  readingMode === "night" ? "text-foreground/80" : ""
                }`}>
                  {currentWriting.content}
                </div>

                {/* Bottom ornament */}
                <div className={`text-center mt-12 text-xl ${
                  readingMode === "night" ? "text-primary/30" : "text-gold-dark/20"
                }`}>
                  ✦
                </div>
                </div>
              </div>

              {/* Page number */}
              <div className={`text-center py-4 text-xs font-body tracking-widest ${
                readingMode === "night" ? "text-primary/30" : "text-gold-dark/20"
              }`}>
                {currentPage + 1} / {writings.length}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between max-w-2xl mx-auto mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary disabled:opacity-20 disabled:hover:text-muted-foreground transition-colors font-body text-sm"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(writings.length - 1, currentPage + 1))}
                disabled={currentPage === writings.length - 1}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary disabled:opacity-20 disabled:hover:text-muted-foreground transition-colors font-body text-sm"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BookPage;
