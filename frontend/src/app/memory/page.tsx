"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { learningApi, FlashCard } from "@/lib/api";
import { Brain, Loader2, Check, X, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MemoryAgentPage() {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const res = await learningApi.getDueFlashcards();
      setCards(res.cards || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality: number) => {
    if (cards.length === 0) return;
    const currentCard = cards[currentIndex];
    
    setActionLoading(true);
    try {
      await learningApi.reviewFlashcard(currentCard.id, quality);
      setShowAnswer(false);
      setCurrentIndex(prev => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const isDone = currentIndex >= cards.length && !loading;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 80, paddingTop: 40 }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Brain size={26} color="var(--kv-accent-rose)" />
              Memory <span className="gradient-text">Agent</span>
            </h1>
            <p style={{ color: "var(--kv-text-muted)" }}>Flatten the forgetting curve with Spaced Repetition.</p>
          </div>

          {loading ? (
             <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
               <Loader2 size={32} className="animate-spin" color="var(--kv-accent-rose)" />
             </div>
          ) : isDone ? (
            <div className="kv-card" style={{ padding: 48, textAlign: "center" }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>All caught up!</h2>
              <p style={{ color: "var(--kv-text-muted)" }}>Your memory is optimal. Check back tomorrow.</p>
            </div>
          ) : (
            <div className="kv-card" style={{ padding: 32, minHeight: 400, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, fontSize: 13, color: "var(--kv-text-muted)" }}>
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span>FSRS Stabilized</span>
              </div>
              
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 32 }}>{cards[currentIndex].question}</h3>
                
                <AnimatePresence>
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ padding: 24, background: "rgba(255,255,255,0.05)", borderRadius: 12, width: "100%" }}
                    >
                      <p style={{ fontSize: 18, color: "var(--kv-text-primary)" }}>{cards[currentIndex].answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
                {!showAnswer ? (
                  <button className="btn btn-primary" onClick={() => setShowAnswer(true)} style={{ width: "100%", padding: 16 }}>
                    <Eye size={18} style={{ marginRight: 8, display: "inline" }}/> Reveal Answer
                  </button>
                ) : (
                  <div>
                    <p style={{ textAlign: "center", marginBottom: 12, fontSize: 14, color: "var(--kv-text-muted)" }}>How well did you remember?</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                      <button className="btn" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }} onClick={() => handleReview(1)} disabled={actionLoading}>Blackout</button>
                      <button className="btn" style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }} onClick={() => handleReview(3)} disabled={actionLoading}>Hard</button>
                      <button className="btn" style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }} onClick={() => handleReview(4)} disabled={actionLoading}>Good</button>
                      <button className="btn" style={{ background: "rgba(59,130,246,0.2)", color: "#3b82f6" }} onClick={() => handleReview(5)} disabled={actionLoading}>Perfect</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
