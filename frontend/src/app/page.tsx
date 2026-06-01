"use client";

import { motion } from "framer-motion";
import { SignUpButton, SignInButton, Show } from "@clerk/nextjs";
import { Sparkles, Brain, ArrowRight, TrendingUp, Compass, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();

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
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="btn btn-primary" style={{ 
                    fontSize: 18, padding: "16px 32px", borderRadius: 999,
                    boxShadow: "0 0 30px rgba(124, 58, 237, 0.4)",
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                    Start Learning Free <ArrowRight size={20} />
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/feed" style={{ textDecoration: "none" }}>
                  <button className="btn btn-primary" style={{ 
                    fontSize: 18, padding: "16px 32px", borderRadius: 999,
                    boxShadow: "0 0 30px rgba(124, 58, 237, 0.4)",
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                    Enter Your Feed <ArrowRight size={20} />
                  </button>
                </Link>
              </Show>
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
