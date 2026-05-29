"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { conceptsApi, aiApi, type ConceptMap, type RoadmapResponse } from "@/lib/api";
import { Search, MapPin, Network, Loader2, ChevronRight, Clock, Zap } from "lucide-react";

export default function ExplorePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [activeTab, setActiveTab] = useState<"graph" | "roadmap">("graph");
  const [conceptMap, setConceptMap] = useState<ConceptMap | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

  const explore = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      if (activeTab === "graph") {
        const data = await conceptsApi.map(topic).catch(() => ({
          topic, nodes: [
            { id: "1", label: topic, type: "root", x: 300, y: 200 },
            { id: "2", label: `Foundations of ${topic}`, type: "concept", x: 120, y: 100 },
            { id: "3", label: `Core Principles`, type: "concept", x: 300, y: 80 },
            { id: "4", label: `Advanced ${topic}`, type: "concept", x: 480, y: 100 },
            { id: "5", label: `Applications`, type: "concept", x: 150, y: 300 },
            { id: "6", label: `Best Practices`, type: "concept", x: 450, y: 300 },
          ],
          edges: [
            { source: "1", target: "2" }, { source: "1", target: "3" }, { source: "1", target: "4" },
            { source: "2", target: "5" }, { source: "3", target: "5" }, { source: "3", target: "6" }, { source: "4", target: "6" },
          ],
        }));
        setConceptMap(data);
      } else {
        const data = await aiApi.roadmap({ topic, level: "intermediate" });
        setRoadmap(data);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
              <span className="gradient-text">Explore</span> Knowledge
            </h1>
            <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>
              Visualize concept maps and generate AI learning roadmaps
            </p>
          </div>

          {/* Search */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--kv-text-muted)" }} />
              <input
                type="text"
                className="form-input"
                placeholder="Enter a topic… e.g. 'Machine Learning', 'Stoicism', 'Quantum Physics'"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && explore()}
                style={{ paddingLeft: 42 }}
                id="explore-input"
              />
            </div>
            <motion.button
              className="btn btn-primary"
              onClick={explore}
              disabled={loading || !topic.trim()}
              whileTap={{ scale: 0.97 }}
              id="explore-btn"
            >
              {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <><Search size={16} /> Explore</>}
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="feed-tabs" style={{ marginBottom: 24 }}>
            <button className={`feed-tab ${activeTab === "graph" ? "active" : ""}`} onClick={() => setActiveTab("graph")} id="tab-graph">
              <Network size={14} style={{ display: "inline", marginRight: 6 }} />Concept Map
            </button>
            <button className={`feed-tab ${activeTab === "roadmap" ? "active" : ""}`} onClick={() => setActiveTab("roadmap")} id="tab-roadmap">
              <MapPin size={14} style={{ display: "inline", marginRight: 6 }} />Learning Roadmap
            </button>
          </div>

          {/* Concept Map */}
          {activeTab === "graph" && (
            <div className="graph-container" style={{ position: "relative", overflow: "hidden" }}>
              {!conceptMap ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
                  <div style={{ fontSize: 48 }}>🗺️</div>
                  <p style={{ color: "var(--kv-text-muted)" }}>Enter a topic above to visualize its knowledge graph</p>
                </div>
              ) : (
                <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                  {/* Edges */}
                  {conceptMap.edges.map((e, i) => {
                    const src = conceptMap.nodes.find(n => n.id === e.source);
                    const tgt = conceptMap.nodes.find(n => n.id === e.target);
                    if (!src || !tgt) return null;
                    return (
                      <line key={i}
                        x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                        stroke="rgba(124,58,237,0.3)" strokeWidth={1.5} strokeDasharray="4 3"
                      />
                    );
                  })}
                  {/* Nodes */}
                  {conceptMap.nodes.map((node) => (
                    <g key={node.id}>
                      <circle
                        cx={node.x} cy={node.y}
                        r={node.type === "root" ? 36 : 28}
                        fill={node.type === "root" ? "rgba(124,58,237,0.2)" : "rgba(6,182,212,0.1)"}
                        stroke={node.type === "root" ? "var(--kv-accent-violet)" : "rgba(6,182,212,0.4)"}
                        strokeWidth={2}
                      />
                      <text x={node.x} y={node.y + 4} textAnchor="middle" fill="var(--kv-text-primary)" fontSize={node.type === "root" ? 11 : 10} fontWeight={node.type === "root" ? 700 : 500}>
                        {node.label.length > 12 ? node.label.slice(0, 12) + "…" : node.label}
                      </text>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          )}

          {/* Roadmap */}
          {activeTab === "roadmap" && (
            <div>
              {!roadmap ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
                  <p style={{ color: "var(--kv-text-muted)" }}>Enter a topic and click Explore to generate your roadmap</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Roadmap summary */}
                  <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                    <div className="stat-card" style={{ flex: 1 }}>
                      <div className="stat-value">{roadmap.nodes.length}</div>
                      <div className="stat-label">Modules</div>
                    </div>
                    <div className="stat-card" style={{ flex: 1 }}>
                      <div className="stat-value">{roadmap.estimated_total_hours}h</div>
                      <div className="stat-label">Total Time</div>
                    </div>
                    <div className="stat-card" style={{ flex: 1 }}>
                      <div className="stat-value">{roadmap.pareto_path.length}</div>
                      <div className="stat-label">Core Path</div>
                    </div>
                  </div>

                  {/* Pareto hint */}
                  <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "var(--kv-radius-md)", marginBottom: 20, fontSize: 13, color: "var(--kv-accent-emerald)" }}>
                    ⚡ <strong>Pareto Path:</strong> Master {roadmap.pareto_path.join(" → ")} for 80% of the knowledge
                  </div>

                  {/* Nodes */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {roadmap.nodes.map((node, i) => (
                      <motion.div
                        key={node.id}
                        className="kv-card"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                          background: node.is_core ? "rgba(124,58,237,0.15)" : "var(--kv-bg-elevated)",
                          border: `2px solid ${node.is_core ? "var(--kv-accent-violet)" : "var(--kv-border)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--kv-font-display)", fontWeight: 800, fontSize: 15,
                          color: node.is_core ? "var(--kv-accent-violet)" : "var(--kv-text-muted)",
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{node.title}</h3>
                            {node.is_core && (
                              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 9999, background: "rgba(124,58,237,0.12)", color: "var(--kv-accent-violet)", fontWeight: 700, textTransform: "uppercase" }}>Core</span>
                            )}
                          </div>
                          <p style={{ fontSize: 13, color: "var(--kv-text-muted)", marginBottom: 10 }}>{node.description}</p>
                          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--kv-text-muted)" }}>
                            <span><Clock size={11} style={{ display: "inline", marginRight: 4 }} />{node.estimated_hours}h</span>
                            <span><Zap size={11} style={{ display: "inline", marginRight: 4 }} />Difficulty {node.difficulty}/10</span>
                          </div>
                        </div>
                        <ChevronRight size={18} color="var(--kv-text-muted)" style={{ flexShrink: 0 }} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
