"use client";

import { useState, useEffect } from "react";
import { learningApi } from "@/lib/api";
import { Focus, Play, Square, Loader2, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FocusModePage() {
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0); // in seconds
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSessionTime((prev) => {
          if (prev >= durationMinutes * 60) {
            handleComplete();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, durationMinutes]);

  const handleStart = async () => {
    setLoading(true);
    try {
      await learningApi.deepWork(durationMinutes);
      setIsActive(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsActive(false);
    setCompleted(true);
    // Submit end session logic here...
    try {
      await learningApi.recordSession("deep_work_session", sessionTime);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuit = () => {
    if (confirm("Are you sure you want to quit your Deep Work session? Progress will be lost.")) {
      setIsActive(false);
      setSessionTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress = (sessionTime / (durationMinutes * 60)) * 100;

  if (completed) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--kv-bg)" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center" }}>
          <Award size={64} color="var(--kv-accent-emerald)" style={{ margin: "0 auto 24px" }} />
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Deep Work Complete</h1>
          <p style={{ color: "var(--kv-text-muted)", fontSize: 18, marginBottom: 32 }}>
            You stayed focused for {Math.floor(sessionTime / 60)} minutes.
          </p>
          <a href="/dashboard" className="btn btn-primary" style={{ padding: "16px 32px", fontSize: 18 }}>Return to Dashboard</a>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--kv-bg)", position: "relative", overflow: "hidden" }}>
      {/* Distraction Blocker Overlay */}
      {isActive && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 0 }} />
      )}

      <div style={{ position: "relative", zIndex: 10, maxWidth: 500, width: "100%", padding: 32, textAlign: "center" }}>
        <Focus size={48} color="var(--kv-accent-rose)" style={{ margin: "0 auto 24px" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Deep Learning Mode</h1>
        <p style={{ color: "var(--kv-text-muted)", marginBottom: 48 }}>Block distractions. Achieve flow state. Multiply your XP.</p>

        {!isActive ? (
          <div className="kv-card" style={{ padding: 32 }}>
            <label style={{ display: "block", marginBottom: 16, fontSize: 18, fontWeight: 600 }}>Set Target Focus Time (Minutes)</label>
            <input 
              type="range" 
              min="10" 
              max="120" 
              step="10" 
              value={durationMinutes} 
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))} 
              style={{ width: "100%", marginBottom: 16, accentColor: "var(--kv-accent-rose)" }}
            />
            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 32, color: "var(--kv-accent-rose)" }}>{durationMinutes} min</div>
            
            <button className="btn btn-primary" onClick={handleStart} disabled={loading} style={{ width: "100%", padding: "16px", fontSize: 18, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
              {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
              Enter Flow State
            </button>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="kv-card" style={{ padding: 48, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(244, 63, 94, 0.3)", boxShadow: "0 0 40px rgba(244, 63, 94, 0.1)" }}>
            <div style={{ fontSize: 80, fontWeight: 900, fontFamily: "monospace", letterSpacing: "-0.05em", color: "white", marginBottom: 32 }}>
              {formatTime(durationMinutes * 60 - sessionTime)}
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden", marginBottom: 48 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "var(--kv-accent-rose)", transition: "width 1s linear" }} />
            </div>

            <button className="btn btn-ghost" onClick={handleQuit} style={{ color: "var(--kv-text-muted)" }}>
              <Square size={16} fill="currentColor" style={{ marginRight: 8 }} /> Surrender & Quit
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
