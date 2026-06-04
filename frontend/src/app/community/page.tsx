"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { communityApi } from "@/lib/api";
import { Users, Swords, Loader2, Shield } from "lucide-react";

export default function CommunityPage() {
  const [tab, setTab] = useState<"guilds" | "debates">("guilds");
  const [guilds, setGuilds] = useState<any[]>([]);
  const [debates, setDebates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [argument, setArgument] = useState("");
  const [selectedDebate, setSelectedDebate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "guilds") {
        const res = await communityApi.guilds();
        setGuilds(res.guilds);
      } else {
        const res = await communityApi.debates();
        setDebates(res.debates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGuild = async (id: string) => {
    setActionLoading(true);
    try {
      await communityApi.joinGuild(id);
      alert("Successfully joined the guild!");
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleArgue = async (debateId: string) => {
    if (!argument.trim()) return;
    setActionLoading(true);
    try {
      const res = await communityApi.argueDebate(debateId, argument);
      alert(`AI Feedback: ${res.ai_feedback}\n\nXP Awarded: ${res.xp_awarded}`);
      setArgument("");
      setSelectedDebate(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 80 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={26} color="var(--kv-accent-cyan)" />
              Community <span className="gradient-text">Layer</span>
            </h1>
            <p style={{ color: "var(--kv-text-muted)" }}>Join factions and participate in AI-moderated debates.</p>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 24, borderBottom: "1px solid var(--kv-border)", paddingBottom: 16 }}>
            <button className={`btn ${tab === "guilds" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("guilds")}>
              <Shield size={18} style={{ marginRight: 8, display: "inline" }}/> Guilds
            </button>
            <button className={`btn ${tab === "debates" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("debates")}>
              <Swords size={18} style={{ marginRight: 8, display: "inline" }}/> Debates
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <Loader2 size={32} className="animate-spin" color="var(--kv-accent-cyan)" />
            </div>
          ) : tab === "guilds" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {guilds.length === 0 && <p>No guilds available.</p>}
              {guilds.map(g => (
                <div key={g.id} className="kv-card" style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{g.name}</h3>
                    <p style={{ color: "var(--kv-text-muted)" }}>{g.description}</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => handleJoinGuild(g.id)} disabled={actionLoading}>
                    Join Faction
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {debates.length === 0 && <p>No active debates.</p>}
              {debates.map(d => (
                <div key={d.id} className="kv-card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, flex: 1, paddingRight: 16 }}>{d.topic}</h3>
                    <span style={{ fontSize: 12, padding: "4px 8px", background: "rgba(16,185,129,0.1)", color: "var(--kv-accent-emerald)", borderRadius: 12, height: "fit-content" }}>{d.status}</span>
                  </div>
                  
                  {selectedDebate === d.id ? (
                    <div>
                      <textarea 
                        className="form-input" 
                        rows={4} 
                        placeholder="State your argument... The Groq AI moderator will evaluate your logic."
                        value={argument}
                        onChange={(e) => setArgument(e.target.value)}
                        style={{ marginBottom: 12 }}
                      />
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost" onClick={() => setSelectedDebate(null)}>Cancel</button>
                        <button className="btn btn-primary" onClick={() => handleArgue(d.id)} disabled={actionLoading || !argument.trim()}>
                          Submit Argument
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-primary" onClick={() => setSelectedDebate(d.id)} style={{ width: "100%", background: "var(--kv-bg-elevated)", color: "var(--kv-text-primary)", border: "1px solid var(--kv-border)" }}>
                      <Swords size={16} style={{ marginRight: 8, display: "inline" }}/> Enter Debate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
