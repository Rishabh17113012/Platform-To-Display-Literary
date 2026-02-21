import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Writing } from "@/hooks/useWritings";
import { Plus, Edit2, Trash2, LogOut, Eye, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPage = () => {
  const { session, isAdmin, loading, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "poem" as "poem" | "story" | "quote",
    genre: "General",
    is_published: true,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) fetchWritings();
  }, [isAdmin]);

  async function fetchWritings() {
    const { data } = await supabase
      .from("writings")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setWritings(data);
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
    setForm({ title: "", content: "", type: "poem", genre: "General", is_published: true });
    setEditingId(null);
  }

  if (loading) {
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

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Form */}
        <div className="bg-card border border-border rounded-sm p-6 space-y-4">
          <h2 className="font-display text-lg text-primary">
            {editingId ? "Edit Writing" : "Add New Writing"}
          </h2>

          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-secondary border border-border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />

          <div className="flex gap-4">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              className="bg-secondary border border-border rounded-sm px-4 py-3 font-body text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="poem">Poem (कविता)</option>
              <option value="story">Story (कहानी)</option>
              <option value="quote">Quote (विचार)</option>
            </select>

            <input
              placeholder="Genre"
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className="flex-1 bg-secondary border border-border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          <textarea
            placeholder="Content (supports line breaks)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={10}
            className="w-full bg-secondary border border-border rounded-sm px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-y"
          />

          <label className="flex items-center gap-2 font-body text-sm text-foreground/70">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="accent-primary"
            />
            Published
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="gold-gradient text-primary-foreground font-cinzel tracking-wider px-6 py-2 rounded-sm hover:opacity-90 transition-opacity text-sm"
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

        {/* Writings list */}
        <div className="space-y-3">
          <h2 className="font-display text-lg text-primary">All Writings ({writings.length})</h2>
          {writings.map((w) => (
            <div
              key={w.id}
              className="bg-card border border-border rounded-sm p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-base text-foreground truncate">{w.title}</h3>
                  {!w.is_published && (
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-sm">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-body">
                  {w.type} • {w.genre} • {new Date(w.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-foreground/50 font-body mt-1 line-clamp-2">
                  {w.content}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => editWriting(w)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
