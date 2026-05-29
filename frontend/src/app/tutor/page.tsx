"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TutorChat } from "@/components/tutor/TutorChat";
import { useAuthStore } from "@/store/authStore";
import { useTutorStore } from "@/store/tutorStore";
import { Trash2, MessageSquare } from "lucide-react";

export default function TutorPage() {
  const { isAuthenticated } = useAuthStore();
  const { clearChat, messages } = useTutorStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <MessageSquare size={26} color="var(--kv-accent-violet)" />
                AI <span className="gradient-text">Tutor</span>
              </h1>
              <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>
                Powered by Gemma 4 E2B — running locally via LM Studio
              </p>
            </div>

            {messages.length > 0 && (
              <button
                className="btn btn-ghost"
                onClick={clearChat}
                style={{ fontSize: 13, padding: "8px 14px", color: "var(--kv-accent-rose)" }}
                id="clear-chat-btn"
              >
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>

          <TutorChat />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
