"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
