"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { usersApi } from "@/lib/api";
import { Activity, Clock, Flame, Loader2, Brain } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await usersApi.dashboardStats();
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 80 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
              <Activity size={26} color="var(--kv-accent-rose)" />
              Human <span className="gradient-text">Optimization</span>
            </h1>
            <p style={{ color: "var(--kv-text-muted)" }}>Track your deep work and discover your cognitive peaks.</p>
          </div>

          {loading ? (
             <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
               <Loader2 size={32} className="animate-spin" color="var(--kv-accent-rose)" />
             </div>
          ) : stats ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
                <div className="kv-card" style={{ padding: 24, textAlign: "center" }}>
                  <Clock size={32} color="var(--kv-accent-violet)" style={{ margin: "0 auto 12px" }} />
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.total_deep_work_hours}h</div>
                  <div style={{ color: "var(--kv-text-muted)", fontSize: 13 }}>Deep Work Logged</div>
                </div>
                <div className="kv-card" style={{ padding: 24, textAlign: "center" }}>
                  <Brain size={32} color="var(--kv-accent-emerald)" style={{ margin: "0 auto 12px" }} />
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.optimal_time}</div>
                  <div style={{ color: "var(--kv-text-muted)", fontSize: 13 }}>Peak Cognitive Hour</div>
                </div>
                <div className="kv-card" style={{ padding: 24, textAlign: "center" }}>
                  <Flame size={32} color="var(--kv-accent-rose)" style={{ margin: "0 auto 12px" }} />
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.average_focus}%</div>
                  <div style={{ color: "var(--kv-text-muted)", fontSize: 13 }}>Average Focus Quality</div>
                </div>
              </div>

              <div className="kv-card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Focus Energy across Time of Day</h3>
                <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 8, paddingBottom: 24, borderBottom: "1px solid var(--kv-border)", position: "relative" }}>
                  {stats.time_series.map((ts: any, i: number) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${ts.focus}%` }}
                        transition={{ delay: i * 0.1, duration: 0.8, type: "spring" }}
                        style={{ 
                          width: "100%", 
                          maxWidth: 40, 
                          background: ts.focus > 80 ? "var(--kv-accent-emerald)" : ts.focus > 60 ? "var(--kv-accent-violet)" : "var(--kv-border)", 
                          borderRadius: "4px 4px 0 0" 
                        }}
                      />
                      <span style={{ position: "absolute", bottom: -24, fontSize: 11, color: "var(--kv-text-muted)", width: 40, textAlign: "center" }}>{ts.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>Failed to load dashboard data.</p>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
