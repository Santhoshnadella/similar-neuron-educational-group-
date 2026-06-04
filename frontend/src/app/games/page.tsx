"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { learningApi } from "@/lib/api";
import { BrainCircuit, Play, Loader2 } from "lucide-react";

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // N-Back State
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const nBackLevel = 2; // 2-Back
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mental Rotation State
  const [rotationScore, setRotationScore] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [targetAngle, setTargetAngle] = useState(0);
  const [rotationPlaying, setRotationPlaying] = useState(false);
  const [rotationRounds, setRotationRounds] = useState(0);

  const startNBack = () => {
    const newSeq = Array.from({ length: 15 }, () => Math.floor(Math.random() * 9));
    setSequence(newSeq);
    setCurrentIndex(0);
    setScore(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (playing && activeGame === "N-Back" && currentIndex < sequence.length) {
      timerRef.current = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 2000); // 2 seconds per flash
    } else if (playing && currentIndex >= sequence.length) {
      setPlaying(false);
      finishGame("n-back", score * 10); // scale score
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, playing, activeGame]);

  const handleNBackMatch = () => {
    if (!playing || currentIndex < nBackLevel) return;
    if (sequence[currentIndex] === sequence[currentIndex - nBackLevel]) {
      setScore(prev => prev + 1);
    } else {
      setScore(prev => Math.max(0, prev - 1)); // penalty
    }
  };

  const startMentalRotation = () => {
    setRotationScore(0);
    setRotationRounds(0);
    setRotationPlaying(true);
    generateNextRotation();
  };

  const generateNextRotation = () => {
    if (rotationRounds >= 10) {
      setRotationPlaying(false);
      finishGame("spatial_reasoning", rotationScore * 10);
      return;
    }
    const angles = [0, 90, 180, 270];
    setCurrentAngle(angles[Math.floor(Math.random() * 4)]);
    setTargetAngle(angles[Math.floor(Math.random() * 4)]);
    setRotationRounds(prev => prev + 1);
  };

  const handleRotationMatch = (isMatch: boolean) => {
    const actuallyMatches = currentAngle === targetAngle;
    if (isMatch === actuallyMatches) {
      setRotationScore(prev => prev + 1);
    }
    generateNextRotation();
  };

  const finishGame = async (game: string, finalScore: number) => {
    setLoading(true);
    try {
      const res = await learningApi.submitGameScore(game, finalScore);
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

          {activeGame === "N-Back" ? (
            <div className="kv-card" style={{ padding: 48, textAlign: "center" }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Dual N-Back ({nBackLevel}-Back)</h2>
              
              {!playing && currentIndex === -1 ? (
                <div>
                  <p style={{ marginBottom: 24, color: "var(--kv-text-muted)" }}>Press "Match" when the current square lights up in the same position as 2 steps ago.</p>
                  <button className="btn btn-primary" onClick={startNBack}>Start Game</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: 10, background: "var(--kv-bg-elevated)", padding: 20, borderRadius: 12 }}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          width: 80, height: 80, 
                          background: (playing && sequence[currentIndex] === i) ? "var(--kv-accent-violet)" : "rgba(255,255,255,0.05)",
                          borderRadius: 8,
                          transition: "background 0.2s"
                        }} 
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <button className="btn btn-primary" onClick={handleNBackMatch} style={{ padding: "16px 48px", fontSize: 18 }} disabled={!playing}>
                      Position Match!
                    </button>
                  </div>
                  <p>Score: {score}</p>
                </div>
              )}
              
              <div style={{ marginTop: 32 }}>
                <button className="btn btn-ghost" onClick={() => { setPlaying(false); setActiveGame(null); }}>Cancel Game</button>
              </div>
            </div>
          ) : activeGame === "Pattern" ? (
             <div className="kv-card" style={{ padding: 48, textAlign: "center" }}>
               <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Mental Rotation</h2>
               
               {!rotationPlaying ? (
                 <div>
                   <p style={{ marginBottom: 24, color: "var(--kv-text-muted)" }}>Determine if the two shapes are identical despite rotation.</p>
                   <button className="btn btn-primary" onClick={startMentalRotation}>Start Game</button>
                 </div>
               ) : (
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
                    <div style={{ display: "flex", gap: 48, justifyContent: "center" }}>
                      {/* Shape 1 */}
                      <div style={{ width: 100, height: 100, background: "var(--kv-accent-cyan)", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", transform: `rotate(${currentAngle}deg)`, transition: "transform 0.3s" }} />
                      {/* Shape 2 */}
                      <div style={{ width: 100, height: 100, background: "var(--kv-accent-cyan)", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", transform: `rotate(${targetAngle}deg)`, transition: "transform 0.3s" }} />
                    </div>

                    <div style={{ display: "flex", gap: 16 }}>
                      <button className="btn btn-primary" onClick={() => handleRotationMatch(true)} style={{ background: "var(--kv-accent-emerald)", padding: "16px 32px" }}>Same Shape</button>
                      <button className="btn btn-primary" onClick={() => handleRotationMatch(false)} style={{ background: "var(--kv-accent-rose)", padding: "16px 32px" }}>Different Shape</button>
                    </div>

                    <p style={{ color: "var(--kv-text-muted)" }}>Round {rotationRounds} / 10 | Score: {rotationScore}</p>
                 </div>
               )}
               
               <div style={{ marginTop: 32 }}>
                <button className="btn btn-ghost" onClick={() => { setRotationPlaying(false); setActiveGame(null); }}>Cancel Game</button>
               </div>
             </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div className="kv-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>Dual N-Back</h3>
                <p style={{ color: "var(--kv-text-muted)", flex: 1 }}>Train your working memory and fluid intelligence by keeping track of visual patterns.</p>
                <button className="btn btn-primary" onClick={() => { setActiveGame("N-Back"); setCurrentIndex(-1); }} style={{ width: "100%" }}>
                  <Play size={16} style={{ marginRight: 8 }} /> Play Now
                </button>
              </div>

              <div className="kv-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>Mental Rotation</h3>
                <p style={{ color: "var(--kv-text-muted)", flex: 1 }}>Enhance your spatial reasoning and processing speed by identifying rotated geometry.</p>
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
