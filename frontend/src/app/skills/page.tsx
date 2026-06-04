"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { learningApi } from "@/lib/api";
import { Network, Loader2, Star, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function SkillsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const res = await learningApi.getSkillsTree();
      setData(res);
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
        <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
              <Network size={26} color="var(--kv-accent-emerald)" />
              Gamified <span className="gradient-text">Skill Tree</span>
            </h1>
            <p style={{ color: "var(--kv-text-muted)" }}>Master knowledge nodes to unlock achievements.</p>
          </div>

          {loading ? (
             <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
               <Loader2 size={32} className="animate-spin" color="var(--kv-accent-emerald)" />
             </div>
          ) : data ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
              {/* Skill Tree Canvas */}
              <div className="kv-card" style={{ padding: 24, minHeight: 600, position: "relative", overflow: "hidden" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Knowledge Graph Nodes</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  {data.nodes.map((node: any, idx: number) => {
                    const mastered = true; // since these are returned from DB, we treat them as part of the graph
                    return (
                      <motion.div 
                        key={node.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{
                          background: mastered ? "rgba(16,185,129,0.1)" : "var(--kv-bg-elevated)",
                          border: `2px solid ${mastered ? "var(--kv-accent-emerald)" : "var(--kv-border)"}`,
                          borderRadius: "50%",
                          width: 100,
                          height: 100,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          padding: 12,
                          boxShadow: mastered ? "0 0 15px rgba(16,185,129,0.3)" : "none"
                        }}
                      >
                        <Target size={20} color={mastered ? "var(--kv-accent-emerald)" : "var(--kv-text-muted)"} style={{ marginBottom: 8 }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: mastered ? "var(--kv-text-primary)" : "var(--kv-text-muted)" }}>
                          {node.name}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Achievements Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="kv-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <Star size={20} color="var(--kv-accent-yellow)" /> Badges Unlocked
                  </h3>
                  {data.achievements.length === 0 ? (
                    <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>No badges yet. Keep learning!</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {data.achievements.map((ach: any) => (
                        <div key={ach.id} style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", padding: 12, borderRadius: 12 }}>
                          <span style={{ fontSize: 24 }}>🏆</span>
                          <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700 }}>{ach.name}</h4>
                            <p style={{ fontSize: 12, color: "var(--kv-text-muted)" }}>{ach.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p>Failed to load skill tree.</p>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
