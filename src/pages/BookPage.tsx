import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bookmark, BookOpen, Sun, Moon, ScrollText, Shuffle, Download, Share2, X, Copy, Share, BookMarked } from "lucide-react";
import { useWritings, Writing } from "@/hooks/useWritings";
import Navbar from "@/components/Navbar";
import html2canvas from "html2canvas";

type ReadingMode = "ivory" | "night" | "sepia";

// ─── Injected enhancement styles ───────────────────────────────────────────
const enhancementStyles = `
  /* Poetry text: narrower measure, generous line-height */
  .poetry-content {
    max-width: 62ch;
    line-height: 1.95;
    text-align: left;
  }

  /* Meaningful page number */
  .page-number-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    opacity: 0.85;
    font-variant-numeric: tabular-nums;
  }

  /* Mode toggle: pill track with sliding indicator */
  .mode-toggle-track {
    position: relative;
    display: inline-flex;
    background: rgba(128,128,128,0.08);
    border-radius: 6px;
    padding: 3px;
    gap: 0;
  }
  .mode-toggle-btn {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 4px;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    transition: color 0.25s ease;
    cursor: pointer;
    border: none;
    background: transparent;
    white-space: nowrap;
  }
  .mode-toggle-btn.active-mode {
    background: linear-gradient(135deg, #d4af37 0%, #b8922a 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(212,175,55,0.35);
  }
  .mode-toggle-btn:not(.active-mode) {
    color: var(--muted-foreground, #888);
  }
  .mode-toggle-btn:not(.active-mode):hover {
    color: var(--primary, #d4af37);
  }

  /* Icon pulse on mode switch */
  @keyframes iconPop {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.35) rotate(-8deg); }
    100% { transform: scale(1); }
  }
  .mode-icon-animate {
    animation: iconPop 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* Sepia grain overlay */
  .sepia-grain::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    background-size: 180px 180px;
    opacity: 0.045;
    mix-blend-mode: multiply;
  }

  /* Navigation bar: full-width card alignment + divider */
  .nav-bar {
    border-top: 1px solid rgba(128,128,128,0.13);
    padding-top: 14px;
    margin-top: 10px;
  }

  /* Arrow hover: shift 4px */
  .bookmarks-panel {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: min(340px, 90vw);
    z-index: 60;
    display: flex;
    flex-direction: column;
    box-shadow: -8px 0 32px rgba(0,0,0,0.18);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .bookmarks-panel.open {
    transform: translateX(0);
  }
  .bookmarks-panel-overlay {
    position: fixed;
    inset: 0;
    z-index: 59;
    background: rgba(0,0,0,0.35);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .bookmarks-panel-overlay.open {
    opacity: 1;
    pointer-events: all;
  }
  .bookmark-item {
    padding: 14px 18px;
    border-bottom: 1px solid rgba(128,128,128,0.1);
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .bookmark-item:hover {
    background: rgba(212,175,55,0.06);
  }
  .bookmark-item-title {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 3px;
  }
  .bookmark-item-meta {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    opacity: 0.5;
    text-transform: uppercase;
  }
  .bookmark-remove-btn {
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .bookmark-item:hover .bookmark-remove-btn {
    opacity: 1;
  }

  /* Bookmark icon button on page */
  .bookmark-icon-btn {
    position: absolute;
    top: 16px;
    right: 20px;
    z-index: 20;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
    opacity: 0.4;
  }
  .bookmark-icon-btn:hover {
    opacity: 1;
    transform: scale(1.15);
  }
  .bookmark-icon-btn.bookmarked {
    opacity: 1;
  }
  @keyframes bookmarkPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.38) translateY(-3px); }
    70%  { transform: scale(0.92); }
    100% { transform: scale(1); }
  }
  .bookmark-icon-btn.bookmark-animate {
    animation: bookmarkPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* Arrow hover: shift 4px */
  .nav-btn-prev:hover .nav-arrow {
    transform: translateX(-4px);
  }
  .nav-btn-next:hover .nav-arrow {
    transform: translateX(4px);
  }
  .nav-arrow {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
`;

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareImageData, setShareImageData] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPageReveal, setShowPageReveal] = useState(false);
  // Track which icon should animate
  const [animatingMode, setAnimatingMode] = useState<ReadingMode | null>(null);

  // ── Bookmarks panel ──
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);
  const [bookmarkAnimating, setBookmarkAnimating] = useState(false);

  const handleToggleBookmark = (id: string) => {
    setBookmarkAnimating(true);
    setTimeout(() => setBookmarkAnimating(false), 420);
    toggleBookmark(id);
  };
  // Trigger page reveal animation on page change
  useEffect(() => {
    setShowPageReveal(true);
    const timer = setTimeout(() => setShowPageReveal(false), 300);
    return () => clearTimeout(timer);
  }, [currentPage]);

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

  // Arrow key navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (writings.length === 0) return;
      if (e.key === "ArrowRight") {
        setCurrentPage((prev) => Math.min(writings.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentPage((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [writings.length]);

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

  // ── Enhanced mode switch with icon animation ──
  const handleModeSwitch = (mode: ReadingMode) => {
    if (mode === readingMode) return;
    setAnimatingMode(mode);
    setReadingMode(mode);
    setTimeout(() => setAnimatingMode(null), 400);
  };

  // Generate image for sharing
  const generateShareImage = async () => {
    const pageElement = document.getElementById("poetry-page");
    if (!pageElement) return null;
    try {
      const bgColorMap: Record<ReadingMode, string> = {
        ivory: "#FBF7F3",
        night: "#0a0a0a",
        sepia: "#f4ede4",
      };
      const canvas = await html2canvas(pageElement, {
        backgroundColor: bgColorMap[readingMode],
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        proxy: undefined,
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  };

  const handleShareClick = async () => {
    if (!showShareMenu && !shareImageData) {
      const imageData = await generateShareImage();
      if (imageData) {
        setShareImageData(imageData);
        setShowPreview(true);
        setShowShareMenu(true);
      } else {
        alert("Failed to generate image. Please try again.");
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const downloadImage = () => {
    if (!shareImageData) return;
    try {
      const link = document.createElement("a");
      link.href = shareImageData;
      link.download = `${currentWriting?.title || "poetry"}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowShareMenu(false);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image.");
    }
  };

  const copyToClipboard = async () => {
    if (!shareImageData) return;
    try {
      const blob = await fetch(shareImageData).then((res) => res.blob());
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      alert("Image copied to clipboard!");
      setShowShareMenu(false);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Failed to copy image. Your browser may not support this feature.");
    }
  };

  const shareViaWeb = async () => {
    if (!shareImageData) return;
    try {
      const blob = await fetch(shareImageData).then((res) => res.blob());
      const file = new File([blob], `${currentWriting?.title || "poetry"}.png`, {
        type: "image/png",
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: currentWriting?.title || "Poetry",
          text: `Check out this beautiful writing: ${currentWriting?.title}`,
          files: [file],
        });
        setShowShareMenu(false);
      } else {
        alert("Web Share API not supported on this device.");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

  const shareAsImage = async () => {
    const imageData = await generateShareImage();
    if (imageData) {
      setShareImageData(imageData);
      setShowPreview(true);
    } else {
      alert("Failed to generate image. Please try again.");
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
      {/* Enhancement styles injected once */}
      <style>{enhancementStyles}</style>

      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        {/* Filters */}
        <div className="mb-8 space-y-4">
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

        {/* ── Enhanced Reading mode toggle ── */}
        <div className="flex justify-center gap-3 mb-6">
          <div className="mode-toggle-track">
            {(Object.keys(modeIcons) as ReadingMode[]).map((mode) => {
              const { icon: Icon, label } = modeIcons[mode];
              const isActive = readingMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => handleModeSwitch(mode)}
                  className={`mode-toggle-btn font-body ${isActive ? "active-mode" : ""}`}
                >
                  <Icon
                    size={13}
                    className={animatingMode === mode ? "mode-icon-animate" : ""}
                  />
                  {label}
                </button>
              );
            })}
          </div>
          <button
            onClick={goRandom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-body tracking-wider text-muted-foreground hover:text-primary transition-all"
          >
            <Shuffle size={14} />
            Random
          </button>

          {/* Bookmarks panel trigger */}
          <button
            onClick={() => setShowBookmarksPanel(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-body tracking-wider text-muted-foreground hover:text-primary transition-all relative"
            title="View saved bookmarks"
          >
            <BookMarked size={14} />
            Saved
            {bookmarks.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold"
                style={{ background: "linear-gradient(135deg,#d4af37,#b8922a)", color: "#fff" }}
              >
                {bookmarks.length}
              </span>
            )}
          </button>        </div>

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
              id="poetry-page"
              className={`relative max-w-2xl mx-auto rounded-sm page-shadow paper-texture paper-vignette paper-texture-subtle paper-warm-tint vignette transition-colors duration-500 ${paperClass} ${readingMode === "sepia" ? "sepia-grain" : ""} ${showPageReveal ? "page-reveal-animation" : ""}`}
            >
              <div className="p-8 md:p-12 lg:p-16 min-h-[60vh] relative">
                {/* Page Watermark */}
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

                {/* Bookmark Icon Button */}
                <button
                  onClick={() => handleToggleBookmark(currentWriting.id)}
                  className={`bookmark-icon-btn ${bookmarks.includes(currentWriting.id) ? "bookmarked" : ""} ${bookmarkAnimating ? "bookmark-animate" : ""}`}
                  title={bookmarks.includes(currentWriting.id) ? "Remove bookmark" : "Save bookmark"}
                >
                  <Bookmark
                    size={22}
                    style={{
                      fill: bookmarks.includes(currentWriting.id)
                        ? (readingMode === "night" ? "#d4af37" : "#b8922a")
                        : "none",
                      stroke: readingMode === "night" ? "#d4af37" : "#b8922a",
                      strokeWidth: 1.8,
                      transition: "fill 0.25s ease",
                    }}
                  />
                </button>

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
                  <div className="page-title-container">
                    <h2 className={`page-title font-display text-3xl md:text-4xl mb-10 font-bold leading-tight ${
                      readingMode === "night" ? "text-primary" : "text-gold-dark"
                    }`}>
                      {currentWriting.title}
                    </h2>
                  </div>

                  {/* Divider */}
                  <div className={`h-px mb-8 transition-all duration-300 ${
                    readingMode === "night" ? "bg-primary/30" : "bg-gold-dark/20"
                  }`} style={{ width: "104px" }} />

                  {/* ── Enhanced poetry content: left-aligned, narrower, more breathing room ── */}
                  <div className={`font-body text-lg md:text-xl poetry-content ${
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

              {/* ── Enhanced page number ── */}
              <div className={`text-center py-4 ${
                readingMode === "night" ? "text-primary/80" : "text-gold-dark/70"
              }`}>
                <span className="page-number-badge font-body">
                  <span style={{ fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Page</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentPage + 1}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>{writings.length} total</span>
                </span>
              </div>
            </div>

            {/* ── Enhanced Navigation ── */}
            <div className="max-w-2xl mx-auto mt-0">
              <div className="nav-bar flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="nav-btn-prev flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary disabled:opacity-20 disabled:hover:text-muted-foreground transition-colors font-body text-sm"
                >
                  <ChevronLeft size={16} className="nav-arrow" />
                  Previous
                </button>
                <div className="relative">
                  <button
                    onClick={handleShareClick}
                    className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm"
                  >
                    <Share2 size={16} />
                    Share
                  </button>

                  {/* Share menu dropdown */}
                  {showShareMenu && shareImageData && (
                    <div className="absolute bottom-full mb-2 right-0 bg-secondary border border-border rounded-sm shadow-lg z-50 overflow-hidden">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="w-full text-left px-4 py-2.5 text-sm font-body text-foreground hover:bg-accent transition-colors flex items-center gap-2 border-b border-border"
                      >
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={downloadImage}
                        className="w-full text-left px-4 py-2.5 text-sm font-body text-foreground hover:bg-accent transition-colors flex items-center gap-2 border-b border-border"
                      >
                        <Download size={14} />
                        Download PNG
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="w-full text-left px-4 py-2.5 text-sm font-body text-foreground hover:bg-accent transition-colors flex items-center gap-2 border-b border-border"
                      >
                        <Copy size={14} />
                        Copy to Clipboard
                      </button>
                      {navigator.canShare && (
                        <button
                          onClick={shareViaWeb}
                          className="w-full text-left px-4 py-2.5 text-sm font-body text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                        >
                          <Share size={14} />
                          Share to Apps
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(writings.length - 1, currentPage + 1))}
                  disabled={currentPage === writings.length - 1}
                  className="nav-btn-next flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary disabled:opacity-20 disabled:hover:text-muted-foreground transition-colors font-body text-sm"
                >
                  Next
                  <ChevronRight size={16} className="nav-arrow" />
                </button>
              </div>
            </div>

            {/* Preview Modal */}
            {showPreview && shareImageData && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-secondary rounded-sm shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-border">
                  <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-secondary">
                    <h3 className="font-cinzel text-lg text-foreground">Preview</h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-6 flex justify-center bg-background">
                    <img
                      src={shareImageData}
                      alt="Share preview"
                      className="rounded-sm max-w-full h-auto shadow-lg"
                    />
                  </div>
                  <div className="flex gap-3 p-6 border-t border-border sticky bottom-0 bg-secondary">
                    <button
                      onClick={downloadImage}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-sm font-body text-sm hover:bg-gray-100 hover:shadow-lg transition-all duration-200"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-sm font-body text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                    {navigator.canShare && (
                      <button
                        onClick={shareViaWeb}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-sm font-body text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <Share size={16} />
                        Share
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* ── Bookmarks slide-over panel ── */}
      <div
        className={`bookmarks-panel-overlay ${showBookmarksPanel ? "open" : ""}`}
        onClick={() => setShowBookmarksPanel(false)}
      />
      <div
        className={`bookmarks-panel bg-secondary border-l border-border ${showBookmarksPanel ? "open" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookMarked size={16} className="text-primary" />
            <span className="font-cinzel text-sm tracking-widest text-foreground">Saved Pages</span>
            {bookmarks.length > 0 && (
              <span className="text-xs font-body text-muted-foreground">({bookmarks.length})</span>
            )}
          </div>
          <button
            onClick={() => setShowBookmarksPanel(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bookmark list */}
        <div className="flex-1 overflow-y-auto">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-16 px-6 text-center">
              <Bookmark size={28} className="text-muted-foreground/30" />
              <p className="font-body text-sm text-muted-foreground/60 leading-relaxed">
                No bookmarks yet.<br />
                Tap the ribbon on a page to save it.
              </p>
            </div>
          ) : (
            writings
              .map((w, idx) => ({ writing: w, idx }))
              .filter(({ writing }) => bookmarks.includes(writing.id))
              .map(({ writing, idx }) => (
                <div key={writing.id} className="bookmark-item flex items-start justify-between gap-3">
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => {
                      setCurrentPage(idx);
                      setShowBookmarksPanel(false);
                    }}
                  >
                    <div className="bookmark-item-title font-body text-foreground truncate">
                      {writing.title}
                    </div>
                    <div className="bookmark-item-meta font-body">
                      {writing.type === "poem" ? "कविता" : writing.type === "story" ? "कहानी" : "विचार"}
                      {writing.genre && <span className="ml-2 opacity-60">· {writing.genre}</span>}
                      <span className="ml-2 opacity-40">· p.{idx + 1}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(writing.id)}
                    className="bookmark-remove-btn flex-shrink-0 mt-0.5 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Remove bookmark"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        {bookmarks.length > 0 && (
          <div className="px-5 py-3 border-t border-border flex-shrink-0">
            <button
              onClick={() => setBookmarks([])}
              className="text-xs font-body text-muted-foreground/50 hover:text-red-400 transition-colors tracking-wider"
            >
              Clear all bookmarks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPage;