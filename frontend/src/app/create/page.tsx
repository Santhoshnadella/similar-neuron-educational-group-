"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { contentApi, aiApi } from "@/lib/api";
import { Loader2, Sparkles, PlusCircle, X, Wand2 } from "lucide-react";

const DOMAINS = ["AI & ML", "Mathematics", "Physics", "Biology", "History", "Philosophy", "Economics", "Programming", "Design", "Psychology", "Neuroscience", "Other"];

export default function CreatePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "", domain: "", body: "", difficulty_level: 5,
    learning_objective: "", feynman_explanation: "",
  });
  const [concepts, setConcepts] = useState<string[]>([]);
  const [conceptInput, setConceptInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

  const addConcept = () => {
    if (conceptInput.trim() && !concepts.includes(conceptInput.trim())) {
      setConcepts([...concepts, conceptInput.trim()]);
      setConceptInput("");
    }
  };

  const aiEnhance = async () => {
    if (!form.title.trim()) return;
    setAiLoading(true);
    try {
      const res = await aiApi.explain({ concept: form.title, mode: "feynman" });
      setForm(f => ({
        ...f,
        feynman_explanation: res.explanation,
        learning_objective: res.key_insights[0] ?? f.learning_objective,
      }));
      if (res.key_insights.length > 0) {
        setConcepts([...concepts, ...res.key_insights.slice(0, 3).filter(c => !concepts.includes(c))]);
      }
    } catch {}
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await contentApi.create({ ...form, concepts, type: "reel" });
      setSuccess(true);
      setTimeout(() => router.push("/feed"), 2000);
    } catch (err: any) {
      setError(err.message ?? "Failed to publish content");
    } finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Content Published!</h2>
        <p style={{ color: "var(--kv-text-muted)" }}>Your knowledge reel is live. Redirecting to feed…</p>
      </motion.div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
              <span className="gradient-text">Creator</span> Studio
            </h1>
            <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>
              Share your knowledge. AI will help enhance it.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text" className="form-input" required
                  placeholder="What concept are you teaching?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  id="create-title"
                  style={{ flex: 1 }}
                />
                <motion.button
                  type="button"
                  className="btn btn-ghost"
                  onClick={aiEnhance}
                  disabled={aiLoading || !form.title.trim()}
                  whileTap={{ scale: 0.95 }}
                  title="AI Enhance"
                  id="ai-enhance-btn"
                  style={{ flexShrink: 0, padding: "0 16px" }}
                >
                  {aiLoading
                    ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    : <><Wand2 size={16} /> AI Fill</>
                  }
                </motion.button>
              </div>
            </div>

            {/* Domain + Difficulty */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Domain</label>
                <select
                  className="form-input"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  id="create-domain"
                >
                  <option value="">Select domain…</option>
                  {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Difficulty (1–10)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
                  <input
                    type="range" min={1} max={10}
                    value={form.difficulty_level}
                    onChange={(e) => setForm({ ...form, difficulty_level: Number(e.target.value) })}
                    style={{ accentColor: "var(--kv-accent-purple)", flex: 1 }}
                    id="create-difficulty"
                  />
                  <span className={`difficulty-badge difficulty-${form.difficulty_level}`} style={{ minWidth: 24, textAlign: "center" }}>
                    {form.difficulty_level}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="form-group">
              <label className="form-label">Content Body *</label>
              <textarea
                className="form-input" required rows={6}
                placeholder="Write your educational content here. Make it insightful and actionable…"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                id="create-body"
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Learning Objective */}
            <div className="form-group">
              <label className="form-label">Learning Objective</label>
              <input
                type="text" className="form-input"
                placeholder="What will the reader learn or be able to do?"
                value={form.learning_objective}
                onChange={(e) => setForm({ ...form, learning_objective: e.target.value })}
                id="create-objective"
              />
            </div>

            {/* Feynman Explanation */}
            <div className="form-group">
              <label className="form-label">
                Feynman Explanation
                <span style={{ marginLeft: 8, fontSize: 11, color: "var(--kv-accent-violet)", fontWeight: 600 }}>
                  (AI will fill this if you click "AI Fill")
                </span>
              </label>
              <textarea
                className="form-input" rows={4}
                placeholder="Explain this concept as if teaching a 12-year-old…"
                value={form.feynman_explanation}
                onChange={(e) => setForm({ ...form, feynman_explanation: e.target.value })}
                id="create-feynman"
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Concepts */}
            <div className="form-group">
              <label className="form-label">Concepts / Tags</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  type="text" className="form-input"
                  placeholder="Add a concept tag…"
                  value={conceptInput}
                  onChange={(e) => setConceptInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addConcept())}
                  id="create-concept-input"
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-ghost" onClick={addConcept} id="add-concept-btn">
                  <PlusCircle size={16} />
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {concepts.map((c) => (
                  <span key={c} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                    background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
                    color: "var(--kv-accent-violet)",
                  }}>
                    {c}
                    <X size={12} style={{ cursor: "pointer" }} onClick={() => setConcepts(concepts.filter(x => x !== c))} />
                  </span>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: "10px 14px", borderRadius: "var(--kv-radius-md)", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "var(--kv-accent-rose)", fontSize: 14, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
              <motion.button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                style={{ fontSize: 15, padding: "12px 28px" }}
                id="create-submit-btn"
              >
                {loading
                  ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  : <><Sparkles size={16} /> Publish Knowledge</>
                }
              </motion.button>
            </div>
          </form>
        </div>
      </main>
      <BottomNav />
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
