"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    router.replace(isAuthenticated ? "/feed" : "/login");
  }, [isAuthenticated, router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "var(--kv-gradient-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "pulse-glow 2s infinite",
          fontSize: 28,
        }}>✦</div>
        <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>Loading KnowledgeVerse…</p>
      </div>
    </div>
  );
}
