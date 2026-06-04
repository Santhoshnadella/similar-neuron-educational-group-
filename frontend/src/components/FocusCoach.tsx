"use client";

import { useEffect, useState } from "react";
import { Coffee, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FocusCoach() {
  const [showCoach, setShowCoach] = useState(false);

  useEffect(() => {
    // In a real app, this tracks actual activity over 45 minutes.
    // For demo purposes, we will trigger it after 2 minutes to prove it works.
    const timer = setTimeout(() => {
      setShowCoach(true);
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showCoach && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "var(--kv-bg-elevated)",
            border: "1px solid var(--kv-accent-yellow)",
            borderRadius: 16,
            padding: 24,
            width: 320,
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            zIndex: 9999,
          }}
        >
          <button 
            onClick={() => setShowCoach(false)} 
            style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--kv-text-muted)", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(234,179,8,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Coffee color="var(--kv-accent-yellow)" size={20} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700 }}>Focus Coach</h4>
          </div>
          <p style={{ color: "var(--kv-text-secondary)", fontSize: 14, marginBottom: 16 }}>
            You've been studying continuously. Your cognitive load is peaking. I recommend a 5-minute break to consolidate memory.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: "8px" }} onClick={() => setShowCoach(false)}>Take Break</button>
            <button className="btn btn-ghost" style={{ flex: 1, padding: "8px" }} onClick={() => setShowCoach(false)}>Keep Going</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
