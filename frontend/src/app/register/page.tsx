"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { SignUpButton } from "@clerk/nextjs";

const LEVELS = [
  { key: "beginner", label: "🌱 Beginner", desc: "Just starting out" },
  { key: "intermediate", label: "⚡ Intermediate", desc: "Some knowledge" },
  { key: "advanced", label: "🔥 Advanced", desc: "Strong foundation" },
  { key: "expert", label: "🏆 Expert", desc: "Deep expertise" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/feed");
    }
  }, [isAuthenticated, router]);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register(form);
      setAuth(res.user, res.access_token);
      router.push("/feed");
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-orb" style={{ width: 600, height: 600, background: "var(--kv-accent-purple)", top: -250, right: -250 }} />
      <div className="auth-bg-orb" style={{ width: 400, height: 400, background: "var(--kv-accent-emerald)", bottom: -150, left: -150 }} />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 480 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "var(--kv-gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", boxShadow: "var(--kv-shadow-glow)",
          }}>
            <Sparkles size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            {step === 1 ? "Create your account" : "What's your level?"}
          </h1>
          <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>
            {step === 1 ? "Join the knowledge revolution" : "We'll personalize your learning path"}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, justifyContent: "center" }}>
          {[1, 2].map((s) => (
            <div key={s} style={{
              height: 4, flex: 1, borderRadius: 9999, maxWidth: 80,
              background: s <= step ? "var(--kv-accent-purple)" : "var(--kv-bg-elevated)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--kv-text-muted)" }} />
                <input id="username" type="text" className="form-input" placeholder="your_username"
                  value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required style={{ paddingLeft: 42 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--kv-text-muted)" }} />
                <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required style={{ paddingLeft: 42 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--kv-text-muted)" }} />
                <input id="reg-password" type="password" className="form-input" placeholder="Min 8 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required minLength={8} style={{ paddingLeft: 42 }} />
              </div>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: "var(--kv-radius-md)", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "var(--kv-accent-rose)", fontSize: 14, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <motion.button
              className="btn btn-primary w-full"
              onClick={() => form.username && form.email && form.password.length >= 8 && setStep(2)}
              whileTap={{ scale: 0.97 }}
              style={{ fontSize: 15, padding: 14, marginTop: 8 }}
              id="register-next-btn"
            >
              Continue <ArrowRight size={18} />
            </motion.button>

            <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "var(--kv-text-muted)", fontSize: 13 }}>
              <div style={{ flex: 1, height: 1, background: "var(--kv-border)", opacity: 0.5 }} />
              <span style={{ padding: "0 10px" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--kv-border)", opacity: 0.5 }} />
            </div>

            <SignUpButton mode="modal">
              <button className="btn btn-ghost w-full" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", fontSize: 14, border: "1px solid var(--kv-border)", borderRadius: "var(--kv-radius-md)", cursor: "pointer", background: "rgba(255,255,255,0.03)" }}>
                <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign Up with Google
              </button>
            </SignUpButton>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {LEVELS.map((l) => (
                <motion.button
                  key={l.key}
                  onClick={() => setLevel(l.key)}
                  whileTap={{ scale: 0.97 }}
                  id={`level-${l.key}`}
                  style={{
                    padding: "16px 14px",
                    borderRadius: "var(--kv-radius-lg)",
                    border: `2px solid ${level === l.key ? "var(--kv-accent-violet)" : "var(--kv-border)"}`,
                    background: level === l.key ? "rgba(124,58,237,0.1)" : "var(--kv-bg-secondary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                >
                  {level === l.key && (
                    <CheckCircle2 size={14} color="var(--kv-accent-violet)" style={{ position: "absolute", top: 10, right: 10 }} />
                  )}
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{l.label.split(" ")[0]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--kv-text-primary)", marginBottom: 2 }}>{l.label.slice(3)}</div>
                  <div style={{ fontSize: 11, color: "var(--kv-text-muted)" }}>{l.desc}</div>
                </motion.button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
              <motion.button
                className="btn btn-primary"
                onClick={handleRegister}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                style={{ flex: 2, fontSize: 15, padding: 14 }}
                id="register-submit-btn"
              >
                {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : "🚀 Start Learning"}
              </motion.button>
            </div>
          </motion.div>
        )}

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--kv-text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--kv-accent-violet)", fontWeight: 600, textDecoration: "none" }}>
            Sign In
          </Link>
        </div>
      </motion.div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
