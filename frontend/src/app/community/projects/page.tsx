"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FolderKanban, Plus, CheckCircle2, Circle } from "lucide-react";

export default function ProjectsPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Draft Quantum Physics Syllabus", faction: "Scholars", status: "todo" },
    { id: 2, title: "Review Cognitive Model PR", faction: "Engineers", status: "in-progress" },
    { id: 3, title: "Compile Spaced Repetition Dataset", faction: "Scholars", status: "done" }
  ]);

  const handleToggle = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t));
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80 }}>
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                <FolderKanban size={26} color="var(--kv-accent-orange)" />
                Faction <span className="gradient-text">Projects</span>
              </h1>
              <p style={{ color: "var(--kv-text-muted)" }}>Collaborative task tracking for your Guild.</p>
            </div>
            <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Plus size={16} /> New Project Task
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {/* To Do Column */}
            <div className="kv-card" style={{ padding: 24, background: "rgba(255,255,255,0.02)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--kv-text-muted)" }}>To Do</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tasks.filter(t => t.status === "todo").map(t => (
                  <div key={t.id} className="kv-card" style={{ padding: 16, cursor: "pointer", transition: "transform 0.2s" }} onClick={() => handleToggle(t.id)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <Circle size={18} color="var(--kv-text-muted)" style={{ marginTop: 2 }} />
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t.title}</h4>
                        <span style={{ fontSize: 11, background: "rgba(249,115,22,0.2)", color: "var(--kv-accent-orange)", padding: "2px 8px", borderRadius: 4 }}>{t.faction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="kv-card" style={{ padding: 24, background: "rgba(255,255,255,0.02)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--kv-accent-yellow)" }}>In Progress</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tasks.filter(t => t.status === "in-progress").map(t => (
                  <div key={t.id} className="kv-card" style={{ padding: 16, border: "1px solid rgba(234,179,8,0.3)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <Circle size={18} color="var(--kv-accent-yellow)" style={{ marginTop: 2 }} />
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t.title}</h4>
                        <span style={{ fontSize: 11, background: "rgba(249,115,22,0.2)", color: "var(--kv-accent-orange)", padding: "2px 8px", borderRadius: 4 }}>{t.faction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Done Column */}
            <div className="kv-card" style={{ padding: 24, background: "rgba(255,255,255,0.02)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--kv-accent-emerald)" }}>Done</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tasks.filter(t => t.status === "done").map(t => (
                  <div key={t.id} className="kv-card" style={{ padding: 16, opacity: 0.6 }} onClick={() => handleToggle(t.id)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <CheckCircle2 size={18} color="var(--kv-accent-emerald)" style={{ marginTop: 2 }} />
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, textDecoration: "line-through" }}>{t.title}</h4>
                        <span style={{ fontSize: 11, background: "rgba(249,115,22,0.2)", color: "var(--kv-accent-orange)", padding: "2px 8px", borderRadius: 4 }}>{t.faction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
