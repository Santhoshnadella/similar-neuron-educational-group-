"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { aiApi } from "@/lib/api";
import { MapPin, ChevronRight, Clock, Zap, Loader2, Search, CheckCircle2 } from "lucide-react";

export default function RoadmapPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const data = await aiApi.roadmap({ topic, level, goal: goal || undefined });
      setRoadmap(data);
      setCompletedNodes(new Set());
    } catch {
      // Mock fallback
      setRoadmap({
        topic, level,
        nodes: [
          { id: "1", title: `Introduction to ${topic}`, description: "Core concepts and mental models", difficulty: 2, estimated_hours: 3, prerequisites: [], is_core: true },
          { id: "2", title: `Fundamentals of ${topic}`, description: "Essential building blocks", difficulty: 4, estimated_hours: 5, prerequisites: ["Introduction"], is_core: true },
          { id: "3", title: `${topic} in Practice`, description: "Hands-on projects and applications", difficulty: 6, estimated_hours: 8, prerequisites: ["Fundamentals"], is_core: true },
          { id: "4", title: `Advanced ${topic}`, description: "Deep dives and edge cases", difficulty: 8, estimated_hours: 10, prerequisites: ["Practice"], is_core: false },
          { id: "5", title: `${topic} Mastery`, description: "Expert-level understanding and teaching others", difficulty: 9, estimated_hours: 12, prerequisites: ["Advanced"], is_core: false },
        ],
        estimated_total_hours: 38,
        pareto_path: [`Introduction to ${topic}`, `Fundamentals of ${topic}`, `${topic} in Practice`],
      });
    } finally { setLoading(false); }
  };

  const toggleNode = (id: string) => {
    setCompletedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = roadmap ? (completedNodes.size / roadmap.nodes.length) * 100 : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
              Learning <span className="gradient-text">Roadmap</span>
            </h1>
            <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>
              AI-generated personalized learning paths powered by Gemma 4
            </p>
          </div>

          {/* Generator */}
          <div className="kv-card" style={{ padding: 24, marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 12 }}>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--kv-text-muted)" }} />
                <input
                  type="text" className="form-input"
                  placeholder="What do you want to master? (e.g. 'Rust programming', 'Stoic philosophy')"
                  value={topic} onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generate()}
                  style={{ paddingLeft: 42 }} id="roadmap-topic"
                />
              </div>
              <motion.button
                className="btn btn-primary"
                onClick={generate}
                disabled={loading || !topic.trim()}
                whileTap={{ scale: 0.97 }}
                id="generate-roadmap-btn"
                style={{ flexShrink: 0 }}
              >
                {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <><MapPin size={16} /> Generate</>}
              </motion.button>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {["beginner","intermediate","advanced","expert"].map(l => (
                <button
                  key={l}
                  className={`mode-chip ${level === l ? "active" : ""}`}
                  onClick={() => setLevel(l)}
                  id={`level-chip-${l}`}
                  style={{ fontSize: 12, padding: "5px 12px" }}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
              <input
                type="text" placeholder="Goal (optional)…"
                value={goal} onChange={(e) => setGoal(e.target.value)}
                style={{ flex: 1, padding: "6px 12px", background: "var(--kv-bg-secondary)", border: "1px solid var(--kv-border)", borderRadius: "var(--kv-radius-md)", color: "var(--kv-text-primary)", fontSize: 12, outline: "none" }}
                id="roadmap-goal"
              />
            </div>
          </div>

          {/* Roadmap display */}
          <AnimatePresence>
            {roadmap && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Progress */}
                <div className="kv-card" style={{ padding: 20, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {completedNodes.size}/{roadmap.nodes.length} modules completed
                    </span>
                    <span style={{ fontSize: 13, color: "var(--kv-accent-violet)", fontWeight: 700 }}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="xp-bar">
                    <motion.div className="xp-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                  </div>

                  <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(16,185,129,0.08)", borderRadius: "var(--kv-radius-md)", border: "1px solid rgba(16,185,129,0.2)", fontSize: 13, color: "var(--kv-accent-emerald)" }}>
                    ⚡ <strong>Pareto Path (80/20):</strong> {roadmap.pareto_path.join(" → ")}
                  </div>
                </div>

                {/* Nodes */}
                <div style={{ position: "relative" }}>
                  {/* Vertical line */}
                  <div style={{
                    position: "absolute", left: 19, top: 20, bottom: 20, width: 2,
                    background: "linear-gradient(to bottom, var(--kv-accent-purple), transparent)",
                    zIndex: 0,
                  }} />

                  {roadmap.nodes.map((node: any, i: number) => {
                    const done = completedNodes.has(node.id);
                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        style={{ display: "flex", gap: 16, marginBottom: 16, position: "relative", zIndex: 1 }}
                      >
                        {/* Node circle */}
                        <button
                          onClick={() => toggleNode(node.id)}
                          style={{
                            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                            background: done ? "var(--kv-accent-emerald)" : node.is_core ? "rgba(124,58,237,0.2)" : "var(--kv-bg-elevated)",
                            border: `2px solid ${done ? "var(--kv-accent-emerald)" : node.is_core ? "var(--kv-accent-violet)" : "var(--kv-border)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.2s",
                          }}
                          id={`node-toggle-${node.id}`}
                        >
                          {done
                            ? <CheckCircle2 size={18} color="white" />
                            : <span style={{ fontSize: 13, fontWeight: 800, color: node.is_core ? "var(--kv-accent-violet)" : "var(--kv-text-muted)" }}>{i + 1}</span>
                          }
                        </button>

                        {/* Card */}
                        <div
                          className="kv-card"
                          style={{
                            flex: 1, padding: 18,
                            opacity: done ? 0.7 : 1,
                            background: done ? "rgba(16,185,129,0.04)" : undefined,
                            borderColor: done ? "rgba(16,185,129,0.2)" : undefined,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 15, fontWeight: 700, textDecoration: done ? "line-through" : "none", color: done ? "var(--kv-text-muted)" : "var(--kv-text-primary)" }}>
                                  {node.title}
                                </span>
                                {node.is_core && !done && (
                                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 9999, background: "rgba(124,58,237,0.12)", color: "var(--kv-accent-violet)", fontWeight: 700, textTransform: "uppercase" }}>Core</span>
                                )}
                              </div>
                              <p style={{ fontSize: 13, color: "var(--kv-text-muted)", marginBottom: 10 }}>{node.description}</p>
                              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--kv-text-muted)" }}>
                                <span><Clock size={11} style={{ display: "inline", marginRight: 3 }} />{node.estimated_hours}h</span>
                                <span><Zap size={11} style={{ display: "inline", marginRight: 3 }} />Difficulty {node.difficulty}/10</span>
                              </div>
                            </div>
                            <ChevronRight size={16} color="var(--kv-text-muted)" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <BottomNav />
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
