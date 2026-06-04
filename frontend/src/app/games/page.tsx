"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { learningApi } from "@/lib/api";
import { BrainCircuit, Play, Loader2 } from "lucide-react";

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finishGame = async (game: string, score: number) => {
    setLoading(true);
    try {
      const res = await learningApi.submitGameScore(game, score);
      alert(`Score Submitted! New Cognitive Index: ${res.new_cognitive_index.toFixed(2)} | XP Earned: ${res.xp_earned}`);
      setActiveGame(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 80 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
              <BrainCircuit size={26} color="var(--kv-accent-violet)" />
              Cognitive <span className="gradient-text">Games</span>
            </h1>
            <p style={{ color: "var(--kv-text-muted)" }}>Boost your working memory and spatial reasoning to upgrade your profile.</p>
          </div>

          {activeGame ? (
            <div className="kv-card" style={{ padding: 48, textAlign: "center" }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Playing: {activeGame}</h2>
              <p style={{ color: "var(--kv-text-muted)", marginBottom: 32 }}>
                (Interactive game canvas would render here. Complete the test to submit score.)
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                <button className="btn btn-ghost" onClick={() => setActiveGame(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => finishGame(activeGame === "N-Back" ? "n-back" : "pattern", Math.random() * 100)} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Finish & Submit Score"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div className="kv-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>Dual N-Back</h3>
                <p style={{ color: "var(--kv-text-muted)", flex: 1 }}>Train your working memory and fluid intelligence by keeping track of audio and visual patterns.</p>
                <button className="btn btn-primary" onClick={() => setActiveGame("N-Back")} style={{ width: "100%" }}>
                  <Play size={16} style={{ marginRight: 8 }} /> Play Now
                </button>
              </div>

              <div className="kv-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>Pattern Recognition</h3>
                <p style={{ color: "var(--kv-text-muted)", flex: 1 }}>Enhance your spatial reasoning and processing speed by identifying sequences under pressure.</p>
                <button className="btn btn-primary" onClick={() => setActiveGame("Pattern")} style={{ width: "100%" }}>
                  <Play size={16} style={{ marginRight: 8 }} /> Play Now
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
