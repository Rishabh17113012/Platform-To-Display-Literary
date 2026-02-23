import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bookmark, BookOpen, Sun, Moon, ScrollText, Shuffle, Download, Share2, X, Copy, Share } from "lucide-react";
import { useWritings, Writing } from "@/hooks/useWritings";
import Navbar from "@/components/Navbar";
import html2canvas from "html2canvas";

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareImageData, setShareImageData] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPageReveal, setShowPageReveal] = useState(false);

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

  // Open share menu with preview
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

  // Download as PNG
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

  // Copy image to clipboard
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

  // Share via Web Share API
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

  // Share as image
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
              id="poetry-page"
              className={`relative max-w-2xl mx-auto rounded-sm page-shadow paper-texture paper-vignette paper-texture-subtle paper-warm-tint vignette transition-colors duration-500 ${paperClass} ${showPageReveal ? "page-reveal-animation" : ""}`}
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
            <div className="flex items-center justify-between max-w-2xl mx-auto mt-6 relative">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary disabled:opacity-20 disabled:hover:text-muted-foreground transition-colors font-body text-sm"
              >
                <ChevronLeft size={16} />
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
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary disabled:opacity-20 disabled:hover:text-muted-foreground transition-colors font-body text-sm"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Preview Modal */}
            {showPreview && shareImageData && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-secondary rounded-sm shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-border">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-secondary">
                    <h3 className="font-cinzel text-lg text-foreground">Preview</h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Preview Image */}
                  <div className="p-6 flex justify-center bg-background">
                    <img
                      src={shareImageData}
                      alt="Share preview"
                      className="rounded-sm max-w-full h-auto shadow-lg"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 p-6 border-t border-border sticky bottom-0 bg-secondary ">
                    <button
  onClick={downloadImage}
  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
  bg-white text-black rounded-sm font-body text-sm 
  hover:bg-gray-100 hover:shadow-lg transition-all duration-200"
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
    </div>
  );
};

export default BookPage;
