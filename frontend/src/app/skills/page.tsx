"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { learningApi } from "@/lib/api";
import { Network, Loader2, Star, Target } from "lucide-react";
import ReactFlow, { Background, Controls, Node, Edge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

export default function SkillsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const res = await learningApi.getSkillsTree();
      setData(res);
      
      // Transform backend concepts to React Flow nodes
      const initialNodes: Node[] = res.nodes.map((node: any, idx: number) => ({
        id: node.id,
        position: { x: (idx % 3) * 200 + 50, y: Math.floor(idx / 3) * 150 + 50 },
        data: { label: node.name },
        style: {
          background: "var(--kv-bg-elevated)",
          color: "var(--kv-text-primary)",
          border: `2px solid var(--kv-accent-emerald)`,
          borderRadius: 8,
          padding: 12,
          fontWeight: 700,
          boxShadow: "0 0 15px rgba(16,185,129,0.3)"
        }
      }));
      
      // Mock some edges to show hierarchy
      const initialEdges: Edge[] = [];
      for (let i = 1; i < initialNodes.length; i++) {
        initialEdges.push({
          id: `e-${initialNodes[i-1].id}-${initialNodes[i].id}`,
          source: initialNodes[i-1].id,
          target: initialNodes[i].id,
          animated: true,
          style: { stroke: 'var(--kv-accent-emerald)', strokeWidth: 2 }
        });
      }

      setNodes(initialNodes);
      setEdges(initialEdges);

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
        <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 80 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
              <Network size={26} color="var(--kv-accent-emerald)" />
              Knowledge <span className="gradient-text">Graph</span>
            </h1>
            <p style={{ color: "var(--kv-text-muted)" }}>Interactive representation of your mapped neural network.</p>
          </div>

          {loading ? (
             <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
               <Loader2 size={32} className="animate-spin" color="var(--kv-accent-emerald)" />
             </div>
          ) : data ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
              {/* React Flow Canvas */}
              <div className="kv-card" style={{ height: "65vh", width: "100%", overflow: "hidden", borderRadius: 16 }}>
                <ReactFlow 
                  nodes={nodes} 
                  edges={edges} 
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                >
                  <Background color="#ccc" gap={16} />
                  <Controls style={{ background: "var(--kv-bg-elevated)", fill: "var(--kv-text-primary)" }} />
                </ReactFlow>
              </div>

              {/* Achievements Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="kv-card" style={{ padding: 24, height: "100%", overflowY: "auto" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <Star size={20} color="var(--kv-accent-yellow)" /> Badges
                  </h3>
                  {data.achievements.length === 0 ? (
                    <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>No badges yet. Master concepts to unlock!</p>
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
