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
import ReactFlow, { MiniMap, Controls, Background, Node, Edge, MarkerType } from "reactflow";
import "reactflow/dist/style.css";

function ReactFlowGraph({ conceptMap }: { conceptMap: ConceptMap }) {
  const nodes: Node[] = conceptMap.nodes.map(n => ({
    id: n.id,
    position: { x: n.x * 200, y: n.y * 200 },
    data: { label: n.label },
    style: {
      background: n.type === 'root' ? "var(--kv-accent-violet)" : "var(--kv-bg-secondary)",
      color: n.type === 'root' ? "#fff" : "var(--kv-text-primary)",
      border: `2px solid ${n.type === 'root' ? "var(--kv-accent-violet)" : "var(--kv-border)"}`,
      borderRadius: 8,
      padding: "10px 20px",
      fontWeight: n.type === 'root' ? "bold" : "normal",
      boxShadow: n.type === 'root' ? "0 0 20px rgba(124,58,237,0.4)" : "none",
      transition: "all 0.2s ease-in-out",
      cursor: "pointer"
    },
    className: "concept-node"
  }));

  const edges: Edge[] = conceptMap.edges.map((e, i) => ({
    id: `e${i}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: 'var(--kv-accent-cyan)', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'var(--kv-accent-cyan)',
    },
  }));

  return (
    <ReactFlow nodes={nodes} edges={edges} fitView attributionPosition="bottom-left" minZoom={0.1} maxZoom={2}>
      <Controls style={{ background: "var(--kv-bg-secondary)", border: "1px solid var(--kv-border)" }} />
      <MiniMap 
        nodeStrokeColor={(n) => n.style?.background === 'var(--kv-accent-violet)' ? '#7c3aed' : '#334155'}
        nodeColor={(n) => n.style?.background === 'var(--kv-accent-violet)' ? '#7c3aed' : '#1e293b'}
        maskColor="rgba(0, 0, 0, 0.7)"
        style={{ background: "var(--kv-bg-secondary)", border: "1px solid var(--kv-border)" }}
      />
      <Background color="#334155" gap={20} size={1} />
    </ReactFlow>
  );
}

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
        const data = await conceptsApi.map(topic);
        setConceptMap(data);
      } else {
        const data = await aiApi.roadmap({ topic, level: "intermediate" });
        setRoadmap(data);
      }
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 900, margin: "0 auto", height: "100%", display: "flex", flexDirection: "column" }}>
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
            <div className="graph-container" style={{ position: "relative", overflow: "hidden", flex: 1, minHeight: 400 }}>
              {!conceptMap ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
                  <div style={{ fontSize: 48 }}>🗺️</div>
                  <p style={{ color: "var(--kv-text-muted)" }}>Enter a topic above to visualize its knowledge graph</p>
                </div>
              ) : (
                <div style={{ width: "100%", height: "100%", background: "var(--kv-bg-primary)" }}>
                  <ReactFlowGraph conceptMap={conceptMap} />
                </div>
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
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .concept-node:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3) !important;
          border-color: var(--kv-accent-violet) !important;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
}
