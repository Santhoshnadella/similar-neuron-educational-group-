"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles, BookOpen, Compass, MessageSquare,
  BarChart2, PlusCircle, User, Zap, LogOut, Info
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const NAV = [
  { href: "/feed",    icon: BookOpen,      label: "Feed" },
  { href: "/tutor",   icon: MessageSquare, label: "AI Tutor" },
  { href: "/explore", icon: Compass,       label: "Explore" },
  { href: "/roadmap", icon: BarChart2,     label: "Roadmap" },
  { href: "/create",  icon: PlusCircle,    label: "Create" },
  { href: "/profile", icon: User,          label: "Profile" },
  { href: "/about",   icon: Info,          label: "About" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link href="/feed" className="sidebar-logo" style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--kv-gradient-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Sparkles size={18} color="white" />
        </div>
        <span className="gradient-text">KnowledgeVerse</span>
      </Link>

      {/* User XP bar */}
      {user && (
        <div style={{
          background: "var(--kv-bg-elevated)",
          borderRadius: "var(--kv-radius-md)",
          padding: "12px 14px",
          marginBottom: 20,
          border: "1px solid var(--kv-border)",
        }}>
          <div className="flex items-center gap-2 mb-4" style={{ marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--kv-gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0,
            }}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--kv-text-primary)", truncate: "ellipsis" }}>
                {user.username}
              </div>
              <div style={{ fontSize: 11, color: "var(--kv-text-muted)" }}>
                Lv.{user.level} · {user.xp} XP
              </div>
            </div>
            <div className="streak-badge" style={{ marginLeft: "auto", padding: "3px 8px", fontSize: 12 }}>
              🔥 {user.streak}
            </div>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${(user.xp % 1000) / 10}%` }} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <motion.div
                className={`nav-item ${active ? "active" : ""}`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="nav-icon" size={18} />
                {label}
                {active && (
                  <motion.div
                    layoutId="active-indicator"
                    style={{
                      marginLeft: "auto",
                      width: 6, height: 6, borderRadius: "50%",
                      background: "var(--kv-accent-violet)",
                    }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Upgrade + Logout */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{
          background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.1))",
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: "var(--kv-radius-md)",
          padding: "12px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Zap size={14} color="var(--kv-accent-amber)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--kv-text-primary)" }}>Premium</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--kv-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
            Unlock unlimited AI tutoring & deep analytics
          </p>
          <button className="btn btn-primary w-full" style={{ padding: "8px", fontSize: 12 }}>
            Upgrade Free
          </button>
        </div>

        {user && (
          <button
            className="nav-item btn-ghost"
            onClick={logout}
            style={{ border: "none", width: "100%", cursor: "pointer" }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
