"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { aiApi, RoadmapNode } from "@/lib/api";
import { Map, Loader2, PlayCircle, CheckCircle2, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function PathwayPage() {
  const [topic, setTopic] = useState("");
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true);
    try {
      const res = await aiApi.roadmap({ topic });
      setNodes(res.nodes || []);
    } catch (e) {
      console.error(e);
      alert("Failed to generate curriculum.");
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
              <Map size={26} color="var(--kv-accent-emerald)" />
              Curriculum <span className="gradient-text">Roadmap</span>
            </h1>
            <p style={{ color: "var(--kv-text-muted)" }}>Enter a topic and the AI Curriculum Agent will construct a personalized learning pathway.</p>
          </div>

          <form onSubmit={handleGenerate} style={{ display: "flex", gap: 12, marginBottom: 48 }}>
            <input 
              type="text" 
              className="form-input" 
              style={{ flex: 1 }} 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to master? (e.g. Quantum Computing, React.js)"
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 140 }}>
              {loading ? <Loader2 className="animate-spin" /> : "Generate Path"}
            </button>
          </form>

          {nodes.length > 0 && (
            <div style={{ position: "relative", paddingLeft: 24 }}>
              {/* Vertical line connecting nodes */}
              <div style={{ position: "absolute", left: 35, top: 20, bottom: 20, width: 2, background: "var(--kv-border)" }} />
              
              {nodes.map((node, i) => {
                const isUnlocked = i === 0; // for demo
                return (
                  <motion.div 
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ position: "relative", marginBottom: 32, opacity: isUnlocked ? 1 : 0.6 }}
                  >
                    {/* Node Dot */}
                    <div style={{ 
                      position: "absolute", 
                      left: 0, 
                      top: 24, 
                      width: 24, 
                      height: 24, 
                      borderRadius: "50%", 
                      background: isUnlocked ? "var(--kv-bg)" : "var(--kv-bg-elevated)", 
                      border: `2px solid ${isUnlocked ? "var(--kv-accent-emerald)" : "var(--kv-border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      zIndex: 2
                    }}>
                      {isUnlocked ? <div style={{ width: 10, height: 10, background: "var(--kv-accent-emerald)", borderRadius: "50%" }}/> : <Lock size={12} color="var(--kv-text-muted)" />}
                    </div>

                    <div className="kv-card" style={{ marginLeft: 48, padding: 24, border: isUnlocked ? "1px solid rgba(16, 185, 129, 0.3)" : undefined }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--kv-accent-emerald)", marginBottom: 4, display: "block" }}>MODULE {i + 1}</span>
                          <h3 style={{ fontSize: 20, fontWeight: 700 }}>{node.title}</h3>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--kv-text-muted)", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 4 }}>
                          {node.estimated_hours} Hours
                        </span>
                      </div>
                      <p style={{ color: "var(--kv-text-muted)", fontSize: 14, marginBottom: 24 }}>{node.description}</p>
                      
                      <div style={{ display: "flex", gap: 12 }}>
                        {isUnlocked ? (
                          <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
                            <PlayCircle size={16} /> Start Module
                          </button>
                        ) : (
                          <button className="btn" disabled style={{ background: "var(--kv-bg-elevated)", color: "var(--kv-text-muted)", display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
                            <Lock size={16} /> Complete previous module to unlock
                          </button>
                        )}
                        <button className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
                          <CheckCircle2 size={16} /> Test Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
