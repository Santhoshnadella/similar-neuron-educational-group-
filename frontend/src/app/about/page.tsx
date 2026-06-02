"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { aiApi, contentApi } from "@/lib/api";
import {
  Sparkles,
  Cpu,
  Brain,
  Sliders,
  Database,
  Terminal,
  Activity,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Zap,
  Flame,
  ArrowRight,
  BookOpen,
  Network
} from "lucide-react";

export default function AboutPage() {
  const [status, setStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"architecture" | "routing" | "matchmaking" | "schema">("architecture");

  const checkStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await aiApi.status();
      setStatus(data);
    } catch {
      setStatus({
        lm_studio: { available: false, url: "http://localhost:1234", current_model: "None", loaded_models: [] },
        message: "⚠️ LM Studio not detected. Run LM Studio and start local server."
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const runSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("http://localhost:8000/content/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok) {
        setSeedResult(`🎉 Seeding Successful: ${data.message}`);
      } else {
        setSeedResult(`❌ Seeding Failed: ${data.detail ?? "Unknown error"}`);
      }
    } catch (err: any) {
      setSeedResult(`❌ Connection Failed: Ensure backend is running at http://localhost:8000`);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ paddingBottom: 100 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          
          {/* Hero Section */}
          <div style={{
            position: "relative",
            borderRadius: "var(--kv-radius-2xl)",
            background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.1))",
            border: "1px solid var(--kv-border)",
            padding: "48px 40px",
            marginBottom: 32,
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: 0, right: 0, width: 250, height: 250,
              background: "var(--kv-gradient-primary)",
              filter: "blur(90px)",
              opacity: 0.15,
              pointerEvents: "none"
            }} />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 640 }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                background: "rgba(124, 58, 237, 0.12)",
                border: "1px solid rgba(124, 58, 237, 0.2)",
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 700,
                color: "var(--kv-accent-violet)",
                marginBottom: 16
              }}>
                <Sparkles size={14} /> The Cognitive Social Network
              </div>
              <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16, lineHeight: 1.15 }}>
                Revolutionizing How <br />
                <span className="gradient-text">Humanity Consumes Knowledge</span>
              </h1>
              <p style={{ color: "var(--kv-text-secondary)", fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
                KnowledgeVerse transforms passive scrolling into active cognitive growth. By combining TikTok-style engagement with adaptive LMS pedagogy, we optimize your brain's memory, attention control, and comprehension in real time.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={runSeed} disabled={seeding}>
                  {seeding ? (
                    <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Database size={16} />
                  )}
                  Seed Demo Database
                </button>
                <button className="btn btn-ghost" onClick={checkStatus} disabled={loadingStatus}>
                  <Activity size={16} />
                  Test Local Gemma (LM Studio)
                </button>
              </div>
              {seedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 16,
                    padding: "12px 16px",
                    borderRadius: "var(--kv-radius-md)",
                    background: "var(--kv-bg-elevated)",
                    border: "1px solid var(--kv-border)",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--kv-text-primary)"
                  }}
                >
                  {seedResult}
                </motion.div>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 36
          }}>
            {/* LM Studio Live Status */}
            <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--kv-text-secondary)", textTransform: "uppercase" }}>Local AI Status</span>
                <span style={{
                  display: "inline-flex",
                  width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: status?.lm_studio?.available ? "var(--kv-accent-emerald)" : "var(--kv-accent-rose)",
                  boxShadow: status?.lm_studio?.available ? "0 0 10px var(--kv-accent-emerald)" : "0 0 10px var(--kv-accent-rose)"
                }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Cpu size={24} style={{ color: "var(--kv-accent-violet)" }} />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>LM Studio Server</h3>
                  <p style={{ fontSize: 12, color: "var(--kv-text-secondary)" }}>
                    {status?.lm_studio?.available ? `Connected: ${status.lm_studio.current_model}` : "Disconnected"}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--kv-text-secondary)", lineHeight: 1.4, margin: 0 }}>
                Pointed to: <code style={{ background: "rgba(255,255,255,0.05)", padding: "2px 4px", borderRadius: 4 }}>{status?.lm_studio?.url ?? "http://localhost:1234"}</code>
              </p>
            </div>

            {/* Cognitive Profile Tech */}
            <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--kv-text-secondary)", textTransform: "uppercase" }}>Brain Profiling</span>
                <Brain size={16} style={{ color: "var(--kv-accent-cyan)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Activity size={24} style={{ color: "var(--kv-accent-cyan)" }} />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>Cognitive Engine</h3>
                  <p style={{ fontSize: 12, color: "var(--kv-text-secondary)" }}>Calculates Index dynamically</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--kv-text-secondary)", lineHeight: 1.4, margin: 0 }}>
                Maps quiz feedback, session watch time, and recall intervals directly onto users.
              </p>
            </div>

            {/* Local Database */}
            <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--kv-text-secondary)", textTransform: "uppercase" }}>Database Architecture</span>
                <Database size={16} style={{ color: "var(--kv-accent-amber)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Database size={24} style={{ color: "var(--kv-accent-amber)" }} />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>SQLite File DB</h3>
                  <p style={{ fontSize: 12, color: "var(--kv-text-secondary)" }}>Zero-install file storage</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--kv-text-secondary)", lineHeight: 1.4, margin: 0 }}>
                Fully self-contained `knowledgeverse.db` runs locally without requiring Postgres or Docker setup.
              </p>
            </div>
          </div>

          {/* Detailed Features Tabbed System */}
          <div className="feed-tabs" style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            <button className={`feed-tab ${activeTab === "architecture" ? "active" : ""}`} onClick={() => setActiveTab("architecture")}>
              Core Modules
            </button>
            <button className={`feed-tab ${activeTab === "routing" ? "active" : ""}`} onClick={() => setActiveTab("routing")}>
              Agent Routing
            </button>
            <button className={`feed-tab ${activeTab === "matchmaking" ? "active" : ""}`} onClick={() => setActiveTab("matchmaking")}>
              Matchmaking Engine
            </button>
            <button className={`feed-tab ${activeTab === "schema" ? "active" : ""}`} onClick={() => setActiveTab("schema")}>
              Creator Templates
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* Tab 1: Architecture Core Vision */}
              {activeTab === "architecture" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div className="glass-card" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>The 6 Core Engine Modules</h2>
                    <p style={{ color: "var(--kv-text-secondary)", marginBottom: 28 }}>
                      KnowledgeVerse brings together microlearning loops, cognitive science, and local large language models to construct a comprehensive human performance dashboard.
                    </p>
                    
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: 20
                    }}>
                      <div style={{ display: "flex", gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <BookOpen size={18} color="var(--kv-accent-violet)" />
                        </div>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>1. Educational Social Feed</h4>
                          <p style={{ fontSize: 13, color: "var(--kv-text-secondary)", lineHeight: 1.5 }}>
                            Short-form content packed with key insights, visualizations, and active recall triggers to turn scrolling into compounding knowledge.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Sliders size={18} color="var(--kv-accent-cyan)" />
                        </div>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>2. Adaptive LMS Pathways</h4>
                          <p style={{ fontSize: 13, color: "var(--kv-text-secondary)", lineHeight: 1.5 }}>
                            Roadmaps customized around your baseline cognitive index and learning goals, breaking down subjects using the Pareto principle.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Network size={18} color="var(--kv-accent-amber)" />
                        </div>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>3. Knowledge Graph Engine</h4>
                          <p style={{ fontSize: 13, color: "var(--kv-text-secondary)", lineHeight: 1.5 }}>
                            Visual mapping of concept dependencies. Shows you the structural relationships and prerequisites of topics before you dive in.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Cpu size={18} color="var(--kv-accent-emerald)" />
                        </div>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>4. Local AI Tutor Agents</h4>
                          <p style={{ fontSize: 13, color: "var(--kv-text-secondary)", lineHeight: 1.5 }}>
                            Context-aware chatbots that translate technical concepts on-demand using Feynman explanations, storytelling, or Socratic guidance.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Brain size={18} color="var(--kv-accent-rose)" />
                        </div>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>5. Cognitive Assessment Engine</h4>
                          <p style={{ fontSize: 13, color: "var(--kv-text-secondary)", lineHeight: 1.5 }}>
                            Learner profiling that measures working memory, attention control, and processing speed, continually reshaping recommendations.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Sliders size={18} color="var(--kv-accent-violet)" />
                        </div>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>6. Spaced Repetition (FSRS)</h4>
                          <p style={{ fontSize: 13, color: "var(--kv-text-secondary)", lineHeight: 1.5 }}>
                            An active-recall scheduler that predicts forgetting rates and queues cards at the exact moment necessary to build long-term memory.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Intent Detection & Agent Routing */}
              {activeTab === "routing" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div className="glass-card" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Local LLM Agent Router Flow</h2>
                    <p style={{ color: "var(--kv-text-secondary)", marginBottom: 28 }}>
                      KnowledgeVerse routes queries through a lightweight intent detector powered by local LLMs (like Gemma 2B via LM Studio). This delivers low-latency, free, and completely private AI orchestration.
                    </p>

                    {/* Flowchart Diagram */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 20,
                      background: "rgba(0,0,0,0.2)",
                      padding: 32,
                      borderRadius: "var(--kv-radius-lg)",
                      border: "1px solid var(--kv-border)",
                      marginBottom: 28
                    }}>
                      <div style={{ background: "var(--kv-bg-elevated)", border: "1px solid var(--kv-border)", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                        👤 User Query (e.g. "Create a quiz on Quantum physics")
                      </div>
                      <ArrowRight size={20} style={{ transform: "rotate(90deg)", color: "var(--kv-accent-violet)" }} />
                      <div style={{ background: "rgba(124,58,237,0.15)", border: "1px solid var(--kv-accent-violet)", padding: "12px 24px", borderRadius: 12, textAlign: "center" }}>
                        <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--kv-accent-violet)" }}>Gemma 2B Intent Classifier</h4>
                        <p style={{ fontSize: 11, color: "var(--kv-text-secondary)", marginTop: 4 }}>Analyzes intent using local token-by-token processing</p>
                      </div>
                      <ArrowRight size={20} style={{ transform: "rotate(90deg)", color: "var(--kv-accent-violet)" }} />
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 12,
                        width: "100%"
                      }}>
                        <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", padding: 12, borderRadius: 8, textAlign: "center", fontSize: 11 }}>
                          <strong>tutor</strong> <br /> <span style={{ color: "var(--kv-text-secondary)" }}>Tutor Agent</span>
                        </div>
                        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", padding: 12, borderRadius: 8, textAlign: "center", fontSize: 11 }}>
                          <strong>roadmap</strong> <br /> <span style={{ color: "var(--kv-text-secondary)" }}>Curriculum Agent</span>
                        </div>
                        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", padding: 12, borderRadius: 8, textAlign: "center", fontSize: 11 }}>
                          <strong>quiz</strong> <br /> <span style={{ color: "var(--kv-text-secondary)" }}>Quiz Agent</span>
                        </div>
                        <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", padding: 12, borderRadius: 8, textAlign: "center", fontSize: 11 }}>
                          <strong>explain</strong> <br /> <span style={{ color: "var(--kv-text-secondary)" }}>Concept explainer</span>
                        </div>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>How to Configure Your Connection</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                      <p><strong>Step 1:</strong> Start LM Studio. Go to the <strong>Local Server</strong> page (port 1234).</p>
                      <p><strong>Step 2:</strong> Under the search tab, search and download <code>google/gemma-2-4b-it</code> or <code>gemma-2-2b-it</code>.</p>
                      <p><strong>Step 3:</strong> Load the model and start the server.</p>
                      <p><strong>Step 4:</strong> Check that your `.env` matches your server configurations:</p>
                      <pre style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 8, fontSize: 12, border: "1px solid var(--kv-border)", overflowX: "auto" }}>
{`LM_STUDIO_URL=http://localhost:1234
LM_STUDIO_MODEL=gemma-2-4b-it
LM_STUDIO_ENABLED=true`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Matchmaking Algorithm & Moat */}
              {activeTab === "matchmaking" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div className="glass-card" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>The Matchmaking Algorithm</h2>
                    <p style={{ color: "var(--kv-text-secondary)", marginBottom: 24 }}>
                      Our matchmaking engine balances dopamine loop entertainment with scientific learning principles. Instead of serving viral bait, it surfaces what increases your cognitive index.
                    </p>

                    <div style={{
                      padding: 24,
                      background: "rgba(0,0,0,0.2)",
                      borderRadius: "var(--kv-radius-lg)",
                      border: "1px solid var(--kv-border)",
                      marginBottom: 28
                    }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--kv-text-primary)", marginBottom: 12 }}>Score Evaluation Formula</h4>
                      <code style={{ fontSize: 14, color: "var(--kv-accent-violet)", display: "block", background: "rgba(0,0,0,0.3)", padding: 14, borderRadius: 8, border: "1px solid var(--kv-border)", lineHeight: 1.5, marginBottom: 16 }}>
                        MatchScore = 0.30 * CognitiveFit + 0.25 * LearningValue + 0.20 * EngagementPotential + 0.15 * SocialProof + 0.10 * SpacedRepetitionUrgency
                      </code>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 8 }}>
                          <span style={{ fontWeight: 600 }}>CognitiveFit (30%)</span>
                          <span style={{ color: "var(--kv-text-secondary)" }}>Distance between Content Difficulty and User Cognitive Level (1-10)</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 8 }}>
                          <span style={{ fontWeight: 600 }}>LearningValue (25%)</span>
                          <span style={{ color: "var(--kv-text-secondary)" }}>Base educational value + prerequisite bonuses + concept novelty bonus</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 8 }}>
                          <span style={{ fontWeight: 600 }}>EngagementPotential (20%)</span>
                          <span style={{ color: "var(--kv-text-secondary)" }}>Domain alignment & content type preferences derived from user history</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 8 }}>
                          <span style={{ fontWeight: 600 }}>SocialProof (15%)</span>
                          <span style={{ color: "var(--kv-text-secondary)" }}>Community likes / views ratio, decayed by creation age</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>SpacedRepetitionUrgency (10%)</span>
                          <span style={{ color: "var(--kv-text-secondary)" }}>FSRS status check — higher priority if concepts are due for review</span>
                        </div>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Cognitive Indicator Data Points</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                      <div style={{ background: "var(--kv-bg-elevated)", padding: 16, borderRadius: 8, border: "1px solid var(--kv-border)" }}>
                        <span style={{ color: "var(--kv-accent-violet)", fontSize: 12, fontWeight: 700 }}>WORKING MEMORY</span>
                        <p style={{ fontSize: 12, color: "var(--kv-text-secondary)", marginTop: 6, margin: 0 }}>
                          Evaluated through quiz comprehension scores. Dictates how quickly the system scales difficulty.
                        </p>
                      </div>
                      <div style={{ background: "var(--kv-bg-elevated)", padding: 16, borderRadius: 8, border: "1px solid var(--kv-border)" }}>
                        <span style={{ color: "var(--kv-accent-cyan)", fontSize: 12, fontWeight: 700 }}>PROCESSING SPEED</span>
                        <p style={{ fontSize: 12, color: "var(--kv-text-secondary)", marginTop: 6, margin: 0 }}>
                          Measured from timed response rates. Adapts card intervals in spaced repetition lists.
                        </p>
                      </div>
                      <div style={{ background: "var(--kv-bg-elevated)", padding: 16, borderRadius: 8, border: "1px solid var(--kv-border)" }}>
                        <span style={{ color: "var(--kv-accent-emerald)", fontSize: 12, fontWeight: 700 }}>ATTENTION CONTROL</span>
                        <p style={{ fontSize: 12, color: "var(--kv-text-secondary)", marginTop: 6, margin: 0 }}>
                          Updated from watch time and focus score during deep-work learning sessions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Creator Templates & Schema */}
              {activeTab === "schema" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div className="glass-card" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Creator Content Templates</h2>
                    <p style={{ color: "var(--kv-text-secondary)", marginBottom: 28 }}>
                      Creators upload structured lessons to KnowledgeVerse. When publishing, the local AI extracts concepts, generates Feynman explanations, and constructs quiz questions automatically.
                    </p>

                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>JSON Upload Schema</h3>
                    <pre style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: 20,
                      borderRadius: "var(--kv-radius-lg)",
                      border: "1px solid var(--kv-border)",
                      fontSize: 13,
                      overflowX: "auto",
                      fontFamily: "monospace",
                      lineHeight: 1.5
                    }}>
{`{
  "title": "Quantum Entanglement",
  "domain": "Physics",
  "difficulty_level": 8,
  "body": "Detailed explanation of quantum entanglement...",
  "concepts": ["Entanglement", "Bell Inequality", "Qubits"],
  "prerequisites": ["Superposition"],
  "learning_objective": "Explain the concept of non-local correlation",
  "feynman_explanation": "Imagine two magic dice...",
  "quiz_questions": [
    {
      "question": "What happens if you check one entangled particle?",
      "options": ["Nothing", "You instantly know the status of the other", "It explodes", "It turns classical"],
      "correct_index": 1,
      "explanation": "Checking one particle immediately collapses the wave function of both."
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>
      <BottomNav />
    </div>
  );
}
