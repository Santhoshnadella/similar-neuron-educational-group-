"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { learningApi } from "@/lib/api";
import { Heart, MessageCircle, Share2, Bookmark, Lightbulb, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const res = await learningApi.feed(10);
      setFeed(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
      setQuizMode(false); // Reset quiz when scrolling
    }
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      alert("Correct! Concept Mastered (+15 XP)");
    } else {
      alert("Incorrect. The Tutor Agent will review this with you later.");
    }
    setQuizMode(false);
  };

  if (loading) {
    return <div className="app-layout"><Sidebar /><main className="main-content flex-center">Loading Feed...</main><BottomNav /></div>;
  }

  return (
    <div className="app-layout" style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main className="main-content" style={{ padding: 0, height: "100%", background: "#000" }}>
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          style={{ 
            height: "100%", 
            width: "100%", 
            maxWidth: "480px", 
            margin: "0 auto", 
            overflowY: "scroll", 
            scrollSnapType: "y mandatory",
            scrollBehavior: "smooth",
            position: "relative"
          }}
          className="no-scrollbar"
        >
          {feed.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div 
                key={item.id} 
                style={{ 
                  height: "100%", 
                  width: "100%", 
                  scrollSnapAlign: "start", 
                  position: "relative",
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80') center/cover`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end"
                }}
              >
                {/* Simulated Video Player */}
                {isActive && !quizMode && (
                  <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(0,0,0,0.5)", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>
                    Auto-playing...
                  </div>
                )}

                {/* Right Action Bar */}
                <div style={{ position: "absolute", right: 16, bottom: 120, display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
                  <button className="flex-center" style={{ flexDirection: "column", gap: 4, background: "none", border: "none", color: "white" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Heart size={24} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{item.like_count || "12.4k"}</span>
                  </button>
                  <button className="flex-center" style={{ flexDirection: "column", gap: 4, background: "none", border: "none", color: "white" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MessageCircle size={24} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>128</span>
                  </button>
                  <button className="flex-center" style={{ flexDirection: "column", gap: 4, background: "none", border: "none", color: "white" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bookmark size={24} />
                    </div>
                  </button>
                  <button className="flex-center" style={{ flexDirection: "column", gap: 4, background: "none", border: "none", color: "white" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Share2 size={24} />
                    </div>
                  </button>
                </div>

                {/* Content Overlay */}
                <div style={{ padding: 24, paddingBottom: 80, width: "calc(100% - 70px)" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {item.concepts?.slice(0,2).map((c: string) => (
                      <span key={c} style={{ background: "var(--kv-accent-cyan)", color: "#000", padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {c.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 8 }}>{item.title}</h2>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.body || "Loading content..."}
                  </p>
                  
                  {!quizMode && (
                    <button 
                      onClick={() => setQuizMode(true)}
                      style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", padding: "12px 20px", borderRadius: 12, color: "white", display: "flex", alignItems: "center", gap: 8, width: "100%", backdropFilter: "blur(10px)" }}
                    >
                      <Lightbulb size={18} color="var(--kv-accent-yellow)" /> Test Your Knowledge
                    </button>
                  )}
                </div>

                {/* Quick Quiz Overlay */}
                <AnimatePresence>
                  {isActive && quizMode && (
                    <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--kv-bg)", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, paddingBottom: 100, zIndex: 50, borderTop: "1px solid var(--kv-border)" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                          <CheckCircle2 color="var(--kv-accent-emerald)" /> Quick Recall
                        </h3>
                        <button onClick={() => setQuizMode(false)} style={{ background: "none", border: "none", color: "var(--kv-text-muted)" }}>Close</button>
                      </div>
                      
                      <p style={{ fontSize: 16, marginBottom: 24 }}>What is the primary concept discussed in this lesson?</p>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <button className="btn" style={{ background: "var(--kv-bg-elevated)", border: "1px solid var(--kv-border)", justifyContent: "flex-start", textAlign: "left" }} onClick={() => handleQuizAnswer(false)}>
                          A) Irrelevant distracter concept
                        </button>
                        <button className="btn" style={{ background: "var(--kv-bg-elevated)", border: "1px solid var(--kv-border)", justifyContent: "flex-start", textAlign: "left" }} onClick={() => handleQuizAnswer(true)}>
                          B) {item.concepts?.[0] || "The Core Insight"}
                        </button>
                        <button className="btn" style={{ background: "var(--kv-bg-elevated)", border: "1px solid var(--kv-border)", justifyContent: "flex-start", textAlign: "left" }} onClick={() => handleQuizAnswer(false)}>
                          C) Completely wrong theory
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>
      <BottomNav />
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
