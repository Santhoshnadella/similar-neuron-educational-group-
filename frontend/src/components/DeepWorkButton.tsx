import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, X } from "lucide-react";
import { learningApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function DeepWorkButton() {
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<{ id: string; msg: string } | null>(null);

  if (!isAuthenticated) return null;

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await learningApi.startDeepWork(60);
      setActiveSession({ id: res.session_id, msg: res.message });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 80,
          right: 24,
          background: activeSession ? "var(--kv-accent-emerald)" : "var(--kv-accent-violet)",
          color: "white",
          border: "none",
          borderRadius: 9999,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 10px 25px -5px rgba(124,58,237,0.5)",
          cursor: "pointer",
          zIndex: 100
        }}
      >
        <Brain size={24} />
        {activeSession && <span style={{ fontWeight: 700 }}>Focus Mode Active</span>}
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                background: "var(--kv-bg-elevated)", border: "1px solid var(--kv-border)",
                borderRadius: "var(--kv-radius-lg)", padding: 32, width: 400, maxWidth: "90%",
                position: "relative"
              }}
            >
              <button onClick={() => setIsOpen(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--kv-text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
              
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Brain size={32} color="var(--kv-accent-violet)" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Deep Work Session</h2>
                <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>
                  Commit to a focused learning session. All distractions are minimized, and XP rewards are doubled.
                </p>
              </div>

              {activeSession ? (
                <div style={{ padding: "16px", background: "rgba(16,185,129,0.1)", border: "1px solid var(--kv-accent-emerald)", borderRadius: 12, textAlign: "center", color: "var(--kv-accent-emerald)" }}>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>Session Active</p>
                  <p style={{ fontSize: 13 }}>{activeSession.msg}</p>
                </div>
              ) : (
                <button
                  className="btn btn-primary w-full"
                  onClick={startSession}
                  disabled={loading}
                  style={{ padding: "16px", fontSize: 16 }}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Start 60-Min Focus"}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
