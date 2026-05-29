"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { usersApi, type User } from "@/lib/api";
import { BookOpen, Zap, Flame, Brain, Star, BarChart2, Calendar, Award } from "lucide-react";

const RADAR_KEYS = [
  { key: "working_memory",      label: "Memory",     angle: -90 },
  { key: "processing_speed",    label: "Speed",      angle: -30 },
  { key: "spatial_reasoning",   label: "Spatial",    angle:  30 },
  { key: "creativity",          label: "Creativity", angle:  90 },
  { key: "emotional_regulation",label: "Focus",      angle: 150 },
  { key: "attention_control",   label: "Attention",  angle: -150 },
];

function RadarChart({ profile }: { profile: any }) {
  const cx = 120, cy = 120, r = 90;
  const toXY = (angle: number, val: number) => {
    const rad = (angle * Math.PI) / 180;
    const dist = (val / 100) * r;
    return { x: cx + dist * Math.cos(rad), y: cy + dist * Math.sin(rad) };
  };

  const points = RADAR_KEYS.map(({ key, angle }) => toXY(angle, profile?.[key] ?? 50));
  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const gridPoints = (scale: number) =>
    RADAR_KEYS.map(({ angle }) => toXY(angle, scale)).map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={240} height={240} viewBox="0 0 240 240">
      {/* Grid */}
      {[25, 50, 75, 100].map((s) => (
        <polygon key={s} points={gridPoints(s)} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={1} />
      ))}
      {/* Axes */}
      {RADAR_KEYS.map(({ angle, label }) => {
        const end = toXY(angle, 100);
        const lbl = toXY(angle, 115);
        return (
          <g key={label}>
            <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(148,163,184,0.15)" strokeWidth={1} />
            <text x={lbl.x} y={lbl.y} textAnchor="middle" dominantBaseline="middle" fill="var(--kv-text-muted)" fontSize={9} fontWeight={600}>{label}</text>
          </g>
        );
      })}
      {/* Data polygon */}
      <polygon points={polyPoints} fill="rgba(124,58,237,0.2)" stroke="var(--kv-accent-violet)" strokeWidth={2} />
      {/* Data points */}
      {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--kv-accent-violet)" />)}
    </svg>
  );
}

export default function ProfilePage() {
  const { isAuthenticated, user: storeUser } = useAuthStore();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(storeUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    usersApi.me().then(setUser).catch(() => {});
  }, [isAuthenticated]);

  const cp = user?.cognitive_profile;
  const xpToNext = user ? 1000 - (user.xp % 1000) : 0;
  const xpPct = user ? ((user.xp % 1000) / 10) : 0;

  const ACHIEVEMENTS = [
    { icon: "🔥", name: "Streak Master", desc: `${user?.streak ?? 0} day streak`, unlocked: (user?.streak ?? 0) > 0 },
    { icon: "⚡", name: "Quick Learner", desc: "Completed first lesson", unlocked: (user?.xp ?? 0) > 0 },
    { icon: "🧠", name: "Deep Thinker",  desc: "Studied for 1 hour",   unlocked: (user?.xp ?? 0) > 100 },
    { icon: "🏆", name: "Level 5",       desc: "Reach level 5",        unlocked: (user?.level ?? 0) >= 5 },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 840, margin: "0 auto" }}>

          {/* Hero */}
          <motion.div
            className="kv-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 32, marginBottom: 24,
              background: "linear-gradient(135deg,rgba(124,58,237,0.08),rgba(6,182,212,0.05))",
              border: "1px solid rgba(124,58,237,0.15)",
            }}
          >
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
              {/* Avatar */}
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "var(--kv-gradient-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 800, color: "white", flexShrink: 0,
                boxShadow: "var(--kv-shadow-glow)",
              }}>
                {user?.username?.[0]?.toUpperCase() ?? "?"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: 24, fontWeight: 800 }}>@{user?.username ?? "..."}</h1>
                  <span className="difficulty-badge difficulty-2" style={{ fontSize: 11 }}>
                    {user?.learning_level ?? "beginner"}
                  </span>
                  {user?.is_creator && (
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 9999, background: "rgba(245,158,11,0.15)", color: "var(--kv-accent-amber)", fontWeight: 700 }}>
                      ✦ Creator
                    </span>
                  )}
                </div>

                <p style={{ color: "var(--kv-text-muted)", fontSize: 14, marginBottom: 16 }}>
                  {user?.bio ?? "Learning everything, one concept at a time."}
                </p>

                {/* XP Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--kv-text-muted)", marginBottom: 6 }}>
                    <span>Level {user?.level ?? 1} · {user?.xp ?? 0} XP</span>
                    <span>{xpToNext} XP to next level</span>
                  </div>
                  <div className="xp-bar">
                    <motion.div
                      className="xp-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Streak */}
              <div className="streak-badge" style={{ flexShrink: 0 }}>
                <Flame size={16} />
                {user?.streak ?? 0} day streak
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { icon: Zap,      label: "Total XP",    value: user?.xp ?? 0 },
              { icon: Star,     label: "Level",       value: user?.level ?? 1 },
              { icon: Brain,    label: "Focus Score", value: `${(user?.focus_score ?? 50).toFixed(0)}%` },
              { icon: BarChart2, label: "Curiosity",  value: `${(user?.curiosity_score ?? 50).toFixed(0)}%` },
            ].map(({ icon: Icon, label, value }, i) => (
              <motion.div
                key={label}
                className="stat-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Icon size={18} color="var(--kv-accent-violet)" style={{ margin: "0 auto 8px" }} />
                <div className="stat-value">{value.toLocaleString()}</div>
                <div className="stat-label">{label}</div>
              </motion.div>
            ))}
          </div>

          {/* Bottom grid: Cognitive Profile + Achievements */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flexWrap: "wrap" }}>
            {/* Cognitive Profile */}
            <motion.div
              className="kv-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ padding: 24 }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Brain size={16} color="var(--kv-accent-cyan)" />
                Cognitive Profile
              </h2>

              {cp ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <RadarChart profile={cp} />
                  {/* Cognitive index */}
                  <div style={{ width: "100%", padding: "12px 16px", background: "rgba(124,58,237,0.08)", borderRadius: "var(--kv-radius-md)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--kv-text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Cognitive Index</div>
                    <div style={{ fontSize: 28, fontWeight: 800, background: "var(--kv-gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {cp.cognitive_index?.toFixed(1) ?? "50.0"}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
                  <p style={{ fontSize: 13, color: "var(--kv-text-muted)" }}>Take the cognitive assessment to unlock your profile</p>
                  <button className="btn btn-primary" style={{ marginTop: 16, fontSize: 13 }}>Start Assessment</button>
                </div>
              )}
            </motion.div>

            {/* Achievements */}
            <motion.div
              className="kv-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{ padding: 24 }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={16} color="var(--kv-accent-amber)" />
                Achievements
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ACHIEVEMENTS.map((a, i) => (
                  <motion.div
                    key={a.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      background: a.unlocked ? "rgba(16,185,129,0.06)" : "var(--kv-bg-secondary)",
                      border: `1px solid ${a.unlocked ? "rgba(16,185,129,0.2)" : "var(--kv-border)"}`,
                      borderRadius: "var(--kv-radius-md)",
                      opacity: a.unlocked ? 1 : 0.5,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: a.unlocked ? "var(--kv-text-primary)" : "var(--kv-text-muted)" }}>
                        {a.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--kv-text-muted)" }}>{a.desc}</div>
                    </div>
                    {a.unlocked && (
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--kv-accent-emerald)", fontWeight: 700 }}>✓ Unlocked</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
