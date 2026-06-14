"use client";

import { motion } from "framer-motion";
import { SignUpButton, SignInButton, useAuth } from "@clerk/nextjs";
import { Sparkles, Brain, ArrowRight, TrendingUp, Compass, Zap, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return (
    <div className="landing-wrapper" style={{ overflowX: "hidden", minHeight: "100vh" }}>
      {/* Abstract Background Orbs */}
      <div className="auth-bg-orb" style={{ width: 800, height: 800, background: "var(--kv-accent-purple)", top: -400, left: -200, opacity: 0.15, filter: "blur(100px)" }} />
      <div className="auth-bg-orb" style={{ width: 600, height: 600, background: "var(--kv-accent-cyan)", bottom: -200, right: -200, opacity: 0.15, filter: "blur(100px)" }} />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
        
        {/* HERO SECTION */}
        <section style={{ 
          minHeight: "85vh", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          textAlign: "center",
          paddingTop: 80
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 999,
              background: "rgba(124, 58, 237, 0.1)",
              border: "1px solid rgba(124, 58, 237, 0.2)",
              color: "var(--kv-accent-violet)",
              fontSize: 14, fontWeight: 600, marginBottom: 24
            }}>
              <Sparkles size={16} /> Welcome to the future of learning
            </div>

            <h1 style={{ 
              fontSize: "clamp(48px, 8vw, 84px)", 
              fontWeight: 900, 
              lineHeight: 1.05, 
              letterSpacing: "-0.03em",
              marginBottom: 24,
              color: "white"
            }}>
              Stop Doomscrolling.<br/>
              <span className="gradient-text">Start Mastering.</span>
            </h1>

            <p style={{ 
              fontSize: "clamp(18px, 2vw, 22px)", 
              color: "var(--kv-text-muted)",
              maxWidth: 680,
              margin: "0 auto 40px",
              lineHeight: 1.6
            }}>
              KnowledgeVerse is an AI-native educational social network that transforms endless scrolling into adaptive, deep learning. 
            </p>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center" }}>
              {!isSignedIn ? (
                <SignUpButton mode="modal">
                  <button className="btn btn-primary" style={{ 
                    fontSize: 18, padding: "16px 32px", borderRadius: 999,
                    boxShadow: "0 0 30px rgba(124, 58, 237, 0.4)",
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                    Start Learning Free <ArrowRight size={20} />
                  </button>
                </SignUpButton>
              ) : (
                <Link href="/feed" style={{ textDecoration: "none" }}>
                  <button className="btn btn-primary" style={{ 
                    fontSize: 18, padding: "16px 32px", borderRadius: 999,
                    boxShadow: "0 0 30px rgba(124, 58, 237, 0.4)",
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                    Enter Your Feed <ArrowRight size={20} />
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        </section>

        {/* ETHOS SECTION */}
        <section style={{ padding: "100px 0", borderTop: "1px solid var(--kv-border)" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>The Core Vision</h2>
            <p style={{ color: "var(--kv-text-muted)", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
              We believe algorithms should optimize for human brilliance, not addiction.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
            <FeatureCard 
              icon={<Brain size={32} color="var(--kv-accent-violet)" />}
              title="Cognitive Matchmaking"
              description="Our AI doesn't just show you what's popular. It analyzes your working memory and learning style to deliver concepts at the exact difficulty you need."
            />
            <FeatureCard 
              icon={<Zap size={32} color="var(--kv-accent-cyan)" />}
              title="Socratic AI Tutors"
              description="Stop memorizing answers. Engage with specialized AI agents that ask probing questions, forcing you to think deeply and construct true understanding."
            />
            <FeatureCard 
              icon={<Compass size={32} color="var(--kv-accent-rose)" />}
              title="Dynamic Knowledge Graphs"
              description="Every swipe builds your personalized mastery tree. Visualize your skills growing in real-time as you connect concepts across domains."
            />
          </div>
        </section>

        {/* MOAT & VISION SECTION */}
        <section style={{ padding: "100px 0", borderTop: "1px solid var(--kv-border)" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>Our Moat: The KnowledgeVerse Vision</h2>
            <p style={{ color: "var(--kv-text-muted)", fontSize: 18, maxWidth: 800, margin: "0 auto" }}>
              An AI-native educational social network + adaptive LMS + cognitive operating system.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            
            {/* Core Vision */}
            <div className="glass-card" style={{ padding: 40 }}>
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, color: "white", display: "flex", alignItems: "center", gap: 12 }}>
                <Sparkles color="var(--kv-accent-violet)" /> Core Vision
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
                <div>
                  <h4 style={{ color: "var(--kv-accent-cyan)", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Combine the Best of:</h4>
                  <ul style={{ color: "var(--kv-text-secondary)", fontSize: 15, lineHeight: 1.8, paddingLeft: 20 }}>
                    <li><strong>Instagram/TikTok</strong> engagement</li>
                    <li><strong>YouTube</strong> depth</li>
                    <li><strong>Duolingo</strong> gamification</li>
                    <li><strong>Notion</strong> knowledge systems</li>
                    <li><strong>Khan Academy</strong> mastery learning</li>
                    <li><strong>OpenAI-style</strong> AI tutoring</li>
                    <li><strong>Cognitive science</strong> & adaptive learning</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: "var(--kv-accent-emerald)", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Transforming:</h4>
                  <ul style={{ color: "var(--kv-text-secondary)", fontSize: 15, lineHeight: 1.8, paddingLeft: 20 }}>
                    <li>scrolling → <strong>learning</strong></li>
                    <li>entertainment → <strong>cognitive growth</strong></li>
                    <li>passive consumption → <strong>mastery</strong></li>
                    <li>fragmented knowledge → <strong>connected intelligence</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modules & Agents Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 32 }}>
              
              <div className="glass-card" style={{ padding: 40 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "white" }}>Primary Product Modules</h3>
                <ul style={{ color: "var(--kv-text-secondary)", fontSize: 15, lineHeight: 1.7, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  <li><strong>Educational Social Feed:</strong> Short-form educational content.</li>
                  <li><strong>AI Adaptive LMS:</strong> Personalized learning pathways.</li>
                  <li><strong>Knowledge Graph Engine:</strong> Concept dependency mapping.</li>
                  <li><strong>AI Agent Ecosystem:</strong> Specialized educational agents.</li>
                  <li><strong>Cognitive Assessment Engine:</strong> Learner profiling.</li>
                  <li><strong>Creator Studio:</strong> AI-assisted educational content creation.</li>
                  <li><strong>Deep Learning Mode:</strong> Focus-first long-form mastery.</li>
                  <li><strong>Gamified Skill Trees:</strong> Progression systems.</li>
                  <li><strong>Community Layer:</strong> Debates, guilds, projects.</li>
                  <li><strong>Human Optimization Dashboard:</strong> Memory, focus, cognition analytics.</li>
                </ul>
              </div>

              <div className="glass-card" style={{ padding: 40 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "white" }}>AI Agent Ecosystem</h3>
                <ul style={{ color: "var(--kv-text-secondary)", fontSize: 15, lineHeight: 1.7, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <li><strong>Tutor Agent:</strong> Teaches concepts, adapts explanations, detects confusion across multiple modes (Beginner, Intermediate, Expert, Feynman, Story, Analogy).</li>
                  <li><strong>Memory Agent:</strong> Handles spaced repetition, recall scheduling, and forgetting curve optimization (FSRS, SM2).</li>
                  <li><strong>Socratic Agent:</strong> Asks reasoning questions and develops critical thinking.</li>
                  <li><strong>Focus Coach Agent:</strong> Detects distraction, optimizes session timing, and recommends breaks.</li>
                  <li><strong>Creativity Agent:</strong> Drives cross-domain idea synthesis and innovation exercises.</li>
                </ul>
              </div>
            </div>

            {/* Engine Formulas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 32 }}>
              <div className="glass-card" style={{ padding: 40 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: "white" }}>Feed Ranking Logic & Recommendation Engine</h3>
                <p style={{ color: "var(--kv-text-secondary)", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                  <strong>Inputs:</strong> Watch time, replays, recall/quiz performance, curiosity patterns, session duration, focus quality, knowledge gaps, and goals.
                </p>
                <p style={{ color: "var(--kv-text-secondary)", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                  <strong>Outputs:</strong> Personalized feed, learning roadmap, revision recommendations, and deep-learning suggestions.
                </p>
                <pre style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 12, color: "var(--kv-accent-cyan)", fontSize: 13, overflowX: "auto" }}>
{`FeedScore = (
  EngagementWeight * EngagementScore +
  LearningValueWeight * EducationalQuality +
  RetentionWeight * RecallImprovement +
  CuriosityWeight * TopicNovelty +
  MasteryWeight * SkillProgression
) - AddictionPenalty`}
                </pre>
              </div>

              <div className="glass-card" style={{ padding: 40 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: "white" }}>Cognitive Assessment Engine</h3>
                <p style={{ color: "var(--kv-text-secondary)", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                  Evaluates Working Memory (n-back tests), Attention (continuous performance tasks), Spatial Reasoning (mental rotation), Processing Speed (timed pattern recognition), and Verbal Intelligence (semantic reasoning).
                </p>
                <pre style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 12, color: "var(--kv-accent-emerald)", fontSize: 13, overflowX: "auto", marginTop: 24 }}>
{`CognitiveIndex = (
  0.20 * WorkingMemory +
  0.15 * Attention +
  0.20 * ProcessingSpeed +
  0.20 * LogicalReasoning +
  0.15 * Creativity +
  0.10 * EmotionalRegulation
)`}
                </pre>
              </div>
            </div>

            {/* Content Schema */}
            <div className="glass-card" style={{ padding: 40 }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "white" }}>Content Template & Upload Schema</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
                <div>
                  <h4 style={{ color: "white", fontSize: 16, marginBottom: 12 }}>Knowledge Reel Template:</h4>
                  <ol style={{ color: "var(--kv-text-secondary)", fontSize: 14, paddingLeft: 20, lineHeight: 1.8 }}>
                    <li><strong>Hook</strong> (Pattern interrupt)</li>
                    <li><strong>Curiosity Gap</strong> (“What if…”)</li>
                    <li><strong>Core Insight</strong> (Pareto concept)</li>
                    <li><strong>Visualization</strong> (Diagram/animation)</li>
                    <li><strong>Retrieval Prompt</strong> (Quick quiz)</li>
                    <li><strong>CTA</strong> (Continue learning path)</li>
                  </ol>
                </div>
                <div>
                  <h4 style={{ color: "white", fontSize: 16, marginBottom: 12 }}>Creator JSON Schema:</h4>
                  <pre style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 12, color: "var(--kv-accent-rose)", fontSize: 13, overflowX: "auto" }}>
{`{
  "title": "",
  "domain": "",
  "difficulty": 1,
  "concepts": [],
  "prerequisites": [],
  "learning_objective": "",
  "feynman_explanation": "",
  "quiz_questions": [],
  "references": []
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Final Objective */}
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 20, color: "white" }}>The Final Objective</h3>
              <p style={{ color: "var(--kv-accent-violet)", fontSize: 20, lineHeight: 1.6, maxWidth: 900, margin: "0 auto", fontWeight: 500 }}>
                Build a learning operating system, an educational social network, a cognitive augmentation platform, a human potential ecosystem, and a knowledge civilization infrastructure that combines neuroscience, AI, systems thinking, classical education, cognitive science, social learning, creativity, and deep understanding into one unified platform.
              </p>
            </div>

          </div>
        </section>

        {/* FOUNDER & ECOSYSTEM SECTION */}
        <section style={{ padding: "100px 0", borderTop: "1px solid var(--kv-border)" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>The Architect Behind The Vision</h2>
            <p style={{ color: "var(--kv-text-muted)", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
              Meet the creator building the interconnected ecosystem of AI-powered cognitive tools.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 40 }}>
            {/* Header */}
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap" }}>
              <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--kv-gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "var(--kv-shadow-glow)" }}>
                <Terminal size={40} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 300 }}>
                <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Nadella Sai Raja Santhosh</h3>
                <p style={{ color: "var(--kv-accent-cyan)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
                  Independent AI Researcher, Open-Source Contributor & Knowledge Systems Architect
                </p>
                <p style={{ color: "var(--kv-text-secondary)", fontSize: 15, lineHeight: 1.6, maxWidth: 800 }}>
                  Building AI-native systems that connect intelligence, research, learning, simulation, creativity, and human potential through first-principles thinking.
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <a href="https://github.com/Santhoshnadella" target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 14 }}>GitHub Profile</a>
                  <a href="https://www.linkedin.com/in/santhosh-nadella-dev/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 14 }}>LinkedIn</a>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 48 }}>
              <h4 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: "white", borderBottom: "1px solid var(--kv-border)", paddingBottom: 10 }}>About Me</h4>
              <p style={{ color: "var(--kv-text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
                I am an Independent AI Researcher, Open-Source Contributor, and interdisciplinary engineer with a background in Electrical & Electronics Engineering. My work spans artificial intelligence, machine learning, computer vision, NLP, computational biology, simulation systems, blockchain, educational technology, scientific computing, knowledge architecture, Full Stack Development, and System Design.
              </p>
              <p style={{ color: "var(--kv-text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
                I enjoy exploring the intersection of seemingly unrelated disciplines and transforming complex ideas into practical software systems. Rather than focusing on a single domain, I build tools that help people learn, research, create, and think more effectively.
              </p>
              <p style={{ color: "var(--kv-text-secondary)", fontSize: 15, lineHeight: 1.7 }}>
                My mission is to develop AI-powered knowledge systems that accelerate learning, scientific discovery, and cognitive growth. This vision has led me to create platforms such as Protocol, Bodhi AI, PureThought, and numerous open-source projects spanning education, research, simulation, finance, legal technology, biotechnology, and generative AI.
              </p>
            </div>

            {/* The KnowledgeVerse Ecosystem */}
            <div style={{ marginBottom: 48 }}>
              <h4 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: "white", borderBottom: "1px solid var(--kv-border)", paddingBottom: 10 }}>The KnowledgeVerse Ecosystem</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                <a href="https://protocol-learning-platform.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", padding: 24, borderRadius: 16, textDecoration: "none", transition: "transform 0.2s", display: "block" }}>
                  <h5 style={{ color: "var(--kv-accent-violet)", fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Protocol</h5>
                  <p style={{ color: "var(--kv-text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                    A minimalist, interactive learning platform designed for first-principles mastery. It transforms domains into structured roadmaps with interactive knowledge trees and AI-generated paths.
                  </p>
                  <span style={{ fontSize: 13, color: "white", fontWeight: 700 }}>Visit Protocol →</span>
                </a>

                <a href="https://ai-research-navigator.vercel.app/about" target="_blank" rel="noopener noreferrer" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", padding: 24, borderRadius: 16, textDecoration: "none", transition: "transform 0.2s", display: "block" }}>
                  <h5 style={{ color: "var(--kv-accent-cyan)", fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Bodhi AI</h5>
                  <p style={{ color: "var(--kv-text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                    An AI-powered research navigator and knowledge exploration platform. Rather than functioning as a search engine, it acts as a research companion to reveal connections across disciplines.
                  </p>
                  <span style={{ fontSize: 13, color: "white", fontWeight: 700 }}>Visit Bodhi AI →</span>
                </a>

                <a href="https://purethought-content-platform.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", padding: 24, borderRadius: 16, textDecoration: "none", transition: "transform 0.2s", display: "block" }}>
                  <h5 style={{ color: "var(--kv-accent-emerald)", fontSize: 18, fontWeight: 800, marginBottom: 12 }}>PureThought</h5>
                  <p style={{ color: "var(--kv-text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                    A philosophy-driven knowledge platform focused on deep understanding rather than information consumption, built around first-principles reasoning and systems thinking.
                  </p>
                  <span style={{ fontSize: 13, color: "white", fontWeight: 700 }}>Visit PureThought →</span>
                </a>
              </div>
            </div>

            {/* Open Source Portfolio & Publications */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40 }}>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "white", borderBottom: "1px solid var(--kv-border)", paddingBottom: 10 }}>Open Source Portfolio</h4>
                <p style={{ color: "var(--kv-text-secondary)", fontSize: 14, marginBottom: 16 }}>My repositories span multiple disciplines rather than a single specialization:</p>
                <ul style={{ color: "var(--kv-text-secondary)", fontSize: 14, lineHeight: 1.7, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, margin: 0 }}>
                  <li><strong>AI & ML:</strong> MotionWeave (Neural Human Animation), OmniForge, RAG for PDFs</li>
                  <li><strong>Simulation:</strong> GenShape, Fusion Plasma Digital Twin, Protein Frequency Simulator, Wave-Based Biological Modeling</li>
                  <li><strong>Computer Vision:</strong> 4D Gaussian Splatting Studio, Neural Animation</li>
                  <li><strong>Legal & Finance:</strong> ELLIPSIS IPC, Vakeel Saab, MACROMIND</li>
                  <li><strong>Embedded / IoT:</strong> HWatch AI Smartwatch, TinyML Apps</li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "white", borderBottom: "1px solid var(--kv-border)", paddingBottom: 10 }}>Research Publications</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <a href="http://ijmtst.com/volume11/issue05/090IJMTST1105073.pdf" target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 12, textDecoration: "none", border: "1px solid var(--kv-border)" }}>
                    <h5 style={{ color: "white", fontSize: 14, marginBottom: 8, lineHeight: 1.4 }}>Improving Health Monitoring Based on Smartwatches with Advanced Sensors and TinyML</h5>
                    <span style={{ color: "var(--kv-accent-violet)", fontSize: 12, fontWeight: 700 }}>Read Publication ↗</span>
                  </a>
                  <a href="https://zenodo.org/records/19429989" target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 12, textDecoration: "none", border: "1px solid var(--kv-border)" }}>
                    <h5 style={{ color: "white", fontSize: 14, marginBottom: 8, lineHeight: 1.4 }}>Digital Twin of the Human Brain: A Clinical-Grade Computational Framework</h5>
                    <span style={{ color: "var(--kv-accent-violet)", fontSize: 12, fontWeight: 700 }}>View on Zenodo ↗</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      style={{
        background: "rgba(30, 41, 59, 0.4)",
        border: "1px solid var(--kv-border)",
        borderRadius: 24,
        padding: 32,
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ 
        width: 64, height: 64, borderRadius: 16, 
        background: "rgba(255,255,255,0.05)", 
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24 
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{title}</h3>
      <p style={{ color: "var(--kv-text-muted)", lineHeight: 1.6 }}>{description}</p>
    </motion.div>
  );
}
