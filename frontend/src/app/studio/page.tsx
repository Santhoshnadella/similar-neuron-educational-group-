"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { learningApi } from "@/lib/api";
import { Video, Loader2, Wand2 } from "lucide-react";

export default function StudioPage() {
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      // In a real app, upload the `file` to AWS S3/Cloudinary here and get the URL.
      // For now, we mock the upload and use the transcript.
      const mockVideoUrl = file ? URL.createObjectURL(file) : "";
      await learningApi.uploadContent(title, body, domain || "General");
      setSuccess(true);
      setTitle("");
      setBody("");
      setDomain("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to upload content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 80, paddingTop: 40 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
              <Video size={26} color="var(--kv-accent-cyan)" />
              Creator <span className="gradient-text">Studio</span>
            </h1>
            <p style={{ color: "var(--kv-text-muted)" }}>Ingest material. AI will auto-extract concepts, flashcards, and vector embeddings.</p>
          </div>

          <form onSubmit={handleSubmit} className="kv-card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Lesson Title</label>
              <input 
                type="text" 
                className="form-input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Introduction to Quantum Mechanics"
                required
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Domain</label>
              <input 
                type="text" 
                className="form-input" 
                value={domain} 
                onChange={(e) => setDomain(e.target.value)} 
                placeholder="e.g. Physics"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Media File (Optional)</label>
              <input 
                type="file" 
                className="form-input" 
                accept="video/*,audio/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
              />
              <p style={{ fontSize: 12, color: "var(--kv-text-muted)", marginTop: 4 }}>Upload .mp4 or .mp3. The backend will process the transcript.</p>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Transcript / Content Body</label>
              <textarea 
                className="form-input" 
                rows={10}
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                placeholder="Paste the educational material here. The AI agents will process it."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: 16 }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              {loading ? "Processing AI Pipeline..." : "Upload & Generate Knowledge"}
            </button>
            
            {success && (
              <p style={{ color: "var(--kv-accent-emerald)", textAlign: "center", fontWeight: 600 }}>Successfully ingested and embedded!</p>
            )}
          </form>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
