import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Writing } from "@/hooks/useWritings";
import { Plus, Edit2, Trash2, LogOut, Eye, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPage = () => {
  const { session, isAdmin, loading, roleLoading, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "poem" as "poem" | "story" | "quote",
    genre: "",
    is_published: true,
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [readingMode, setReadingMode] = useState<"ivory" | "night" | "sepia">("ivory");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Validation helpers
  const isTitleEmpty = !form.title.trim();
  const isContentEmpty = !form.content.trim();
  const canSave = !isTitleEmpty && !isContentEmpty;

  // Pagination logic
  const totalPages = Math.ceil(writings.length / itemsPerPage);
  const startIdx = currentPage * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedWritings = writings.slice(startIdx, endIdx);

  // Auto-capitalize genre on change
  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    setForm({ ...form, genre: capitalized });
  };

  // CSS class selection for reading mode
  const paperClass = readingMode === "ivory" ? "paper-ivory" : readingMode === "sepia" ? "paper-sepia" : "paper-night";

  useEffect(() => {
    if (isAdmin) fetchWritings();
  }, [isAdmin]);

  async function fetchWritings() {
    const { data } = await supabase
      .from("writings")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setWritings(data);
      setCurrentPage(0); // Reset to first page when fetching
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
    setAuthLoading(false);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("writings")
        .update(form)
        .eq("id", editingId);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Updated successfully!" });
        setEditingId(null);
        resetForm();
        fetchWritings();
      }
    } else {
      const { error } = await supabase.from("writings").insert(form);
      if (error) {
        toast({ title: "Insert failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Created successfully!" });
        resetForm();
        fetchWritings();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this?")) return;
    const { error } = await supabase.from("writings").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      fetchWritings();
    }
  }

  function editWriting(w: Writing) {
    setEditingId(w.id);
    setForm({
      title: w.title,
      content: w.content,
      type: w.type,
      genre: w.genre,
      is_published: w.is_published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm({ title: "", content: "", type: "poem", genre: "", is_published: true });
    setEditingId(null);
    setCurrentPage(0); // Reset pagination when starting new entry
  }

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary font-cinzel tracking-widest animate-glow-pulse">Loading...</p>
      </div>
    );
  }

  // Login form
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="font-cinzel text-3xl gold-text-gradient mb-2">Admin Access</h1>
            <p className="text-muted-foreground font-body text-sm">HR ki Duniya Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary border border-border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={authLoading}
              className="w-full gold-gradient text-primary-foreground font-cinzel tracking-widest py-3 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {authLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <button
            onClick={() => navigate("/")}
            className="w-full text-center text-muted-foreground hover:text-primary text-sm font-body transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <h1 className="font-display text-2xl text-primary">Access Denied</h1>
          <p className="text-muted-foreground font-body">You do not have admin privileges.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => signOut()} className="text-sm text-muted-foreground hover:text-primary font-body">
              Sign Out
            </button>
            <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-primary font-body">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-cinzel text-xl gold-text-gradient">Admin Dashboard</h1>
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-primary text-sm font-body flex items-center gap-1"
          >
            <BookOpen size={14} /> View Site
          </button>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 text-muted-foreground hover:text-destructive text-sm font-body transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Form Header */}
        <div>
          <h2 className="font-display text-lg text-primary mb-4">
            {editingId ? "Edit Writing" : "Add New Writing"}
          </h2>
        </div>

        {/* Meta fields */}
        <div className="bg-card border border-border rounded-sm p-6 space-y-4 form-container-refined">
          <div>
            <label className="block text-xs font-body text-muted-foreground mb-2">Title *</label>
            <input
              placeholder="Enter title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`w-full bg-secondary border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors ${
                isTitleEmpty ? "border-destructive/50" : "border-border"
              }`}
            />
            {isTitleEmpty && (
              <p className="text-xs text-destructive mt-1">Title is required</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-body text-muted-foreground mb-2">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full bg-secondary border border-border rounded-sm px-4 py-3 font-body text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="poem">Poem (कविता)</option>
                <option value="story">Story (कहानी)</option>
                <option value="quote">Quote (विचार)</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-body text-muted-foreground mb-2">Genre</label>
              <input
                placeholder="e.g., Romance, Philosophy"
                value={form.genre}
                onChange={handleGenreChange}
                className="w-full bg-secondary border border-border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 font-body text-sm text-foreground/70">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="accent-primary"
              />
              Published
            </label>
          </div>
        </div>

        {/* Split Editor & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="bg-card border border-border rounded-sm p-6 space-y-4 form-container-refined">
            <div>
              <label className="block text-xs font-body text-muted-foreground mb-2">Content * (Live preview On)</label>
              <textarea
                placeholder="Enter content (supports line breaks)"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={18}
                className={`w-full bg-secondary border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-y textarea-parchment ${
                  isContentEmpty ? "border-destructive/50" : "border-border"
                }`}
              />
              {isContentEmpty && (
                <p className="text-xs text-destructive mt-1">Content is required</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="gold-button-refined create-button-animated text-primary-foreground font-cinzel tracking-wider px-6 py-2 rounded-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="border border-border text-muted-foreground px-6 py-2 rounded-sm hover:text-foreground transition-colors font-body text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-sm p-4 form-container-refined">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-body text-muted-foreground">Preview (Book Page)</label>
                <div className="flex gap-2">
                  {(["ivory", "sepia", "night"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setReadingMode(mode)}
                      className={`px-2 py-1 text-xs rounded font-body transition-colors ${
                        readingMode === mode
                          ? "gold-gradient text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div
                className={`relative rounded-sm page-shadow paper-texture vignette transition-colors duration-500 ${paperClass} p-8 min-h-[80vh] max-h-[80vh] overflow-y-auto`}
              >
                {/* Type badge */}
                <div className="flex items-center gap-2 mb-6">
                  <span className={`text-xs font-body tracking-[0.2em] uppercase ${
                    readingMode === "night" ? "text-primary/60" : "text-gold-dark/60"
                  }`}>
                    {form.type === "poem" ? "कविता" : form.type === "story" ? "कहानी" : "विचार"}
                  </span>
                  <span className={`text-xs ${readingMode === "night" ? "text-primary/30" : "text-gold-dark/20"}`}>•</span>
                  <span className={`text-xs font-body tracking-wider ${
                    readingMode === "night" ? "text-primary/40" : "text-gold-dark/40"
                  }`}>
                    {form.genre || "Genre"}
                  </span>
                </div>

                {/* Title */}
                <h2 className={`font-display text-2xl md:text-3xl mb-6 ${
                  readingMode === "night" ? "text-primary" : "text-gold-dark"
                }`}>
                  {form.title || "(Title)"}
                </h2>

                {/* Divider */}
                <div className={`w-20 h-px mb-8 ${
                  readingMode === "night" ? "bg-primary/30" : "bg-gold-dark/20"
                }`} />

                {/* Content */}
                <div className={`font-body text-lg md:text-xl leading-relaxed whitespace-pre-line ${
                  readingMode === "night" ? "text-foreground/80" : ""
                }`}>
                  {form.content || "(Content preview)"}
                </div>

                {/* Bottom ornament */}
                <div className={`text-center mt-12 text-xl ${
                  readingMode === "night" ? "text-primary/30" : "text-gold-dark/20"
                }`}>
                  ✦
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Writings list */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-display text-lg text-primary">All Writings ({writings.length})</h2>
            <div className="text-xs text-muted-foreground font-body">
              Showing {writings.length === 0 ? 0 : startIdx + 1}–{Math.min(endIdx, writings.length)} of {writings.length}
            </div>
          </div>

          {/* Writings cards grid - optimized for mobile */}
          <div className="space-y-3 md:grid md:grid-cols-1 lg:grid-cols-1 md:gap-4">
            {paginatedWritings.length > 0 ? (
              paginatedWritings.map((w) => (
                <div
                  key={w.id}
                  className="bg-card border border-border rounded-sm p-4 md:p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:border-primary/30 transition-colors"
                >
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-display text-base md:text-lg text-foreground line-clamp-1">{w.title}</h3>
                      {!w.is_published && (
                        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-sm whitespace-nowrap">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground font-body mb-2">
                      {w.type} • {w.genre || "—"} • {new Date(w.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-foreground/60 font-body line-clamp-2 md:line-clamp-3">
                      {w.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:gap-3 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => editWriting(w)}
                      title="Edit"
                      className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-sm hover:bg-secondary"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      title="Delete"
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-sm hover:bg-secondary"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No writings yet. Create one to get started!</p>
              </div>
            )}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
              <button
                onClick={() => {
                  setCurrentPage(Math.max(0, currentPage - 1));
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }}
                disabled={currentPage === 0}
                className="w-full sm:w-auto px-6 py-2 border border-border text-muted-foreground font-body text-sm rounded-sm hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i);
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className={`w-8 h-8 rounded-sm font-body text-sm transition-colors ${
                      currentPage === i
                        ? "gold-gradient text-primary-foreground"
                        : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }}
                disabled={currentPage === totalPages - 1}
                className="w-full sm:w-auto px-6 py-2 border border-border text-muted-foreground font-body text-sm rounded-sm hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
