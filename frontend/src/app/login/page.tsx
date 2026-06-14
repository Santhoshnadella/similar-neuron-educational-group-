"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { SignInButton } from "@clerk/nextjs";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/feed");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuth(res.user, res.access_token);
      router.push("/feed");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Background orbs */}
      <div className="auth-bg-orb" style={{ width: 500, height: 500, background: "var(--kv-accent-purple)", top: -200, left: -200 }} />
      <div className="auth-bg-orb" style={{ width: 400, height: 400, background: "var(--kv-accent-cyan)", bottom: -150, right: -150 }} />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "var(--kv-gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "var(--kv-shadow-glow)",
          }}>
            <Sparkles size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>Continue your learning journey</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--kv-text-muted)" }} />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                style={{ paddingLeft: 42 }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--kv-text-muted)" }} />
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingLeft: 42, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--kv-text-muted)" }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: "10px 14px", borderRadius: "var(--kv-radius-md)",
                background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)",
                color: "var(--kv-accent-rose)", fontSize: 14, marginBottom: 16,
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{ fontSize: 15, padding: "14px", marginTop: 8 }}
            id="login-submit-btn"
          >
            {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : (
              <><span>Sign In</span><ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "var(--kv-text-muted)", fontSize: 13 }}>
          <div style={{ flex: 1, height: 1, background: "var(--kv-border)", opacity: 0.5 }} />
          <span style={{ padding: "0 10px" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--kv-border)", opacity: 0.5 }} />
        </div>

        <SignInButton mode="modal">
          <button className="btn btn-ghost w-full" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", fontSize: 14, border: "1px solid var(--kv-border)", borderRadius: "var(--kv-radius-md)", cursor: "pointer", background: "rgba(255,255,255,0.03)" }}>
            <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign In with Google
          </button>
        </SignInButton>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--kv-text-muted)" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "var(--kv-accent-violet)", fontWeight: 600, textDecoration: "none" }}>
            Sign Up Free
          </Link>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, padding: "10px 14px",
          background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)",
          borderRadius: "var(--kv-radius-md)", fontSize: 12, color: "var(--kv-text-muted)", textAlign: "center",
        }}>
          🧪 MVP mode — register first, then sign in
        </div>
      </motion.div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
