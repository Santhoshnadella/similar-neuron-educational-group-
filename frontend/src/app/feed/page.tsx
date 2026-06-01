"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { KnowledgeReel } from "@/components/feed/KnowledgeReel";
import { feedApi, type FeedItem } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, TrendingUp, Users, Sparkles } from "lucide-react";

const TABS = [
  { key: "personalized", label: "✦ For You",  icon: Sparkles },
  { key: "trending",     label: "🔥 Trending", icon: TrendingUp },
  { key: "following",    label: "👥 Following", icon: Users },
];



export default function FeedPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState("personalized");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    loadFeed(tab);
  }, [tab, isAuthenticated]);

  const loadFeed = async (activeTab: string) => {
    setLoading(true);
    setError("");
    try {
      let data;
      if (activeTab === "personalized") data = await feedApi.personalized();
      else if (activeTab === "trending") data = await feedApi.trending();
      else data = await feedApi.following();

      setItems(data.items);
    } catch {
      setError("Failed to load feed. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content" style={{ overflow: "hidden" }}>
        <div className="feed-container" style={{ 
          height: "calc(100vh - 120px)", 
          overflowY: "scroll", 
          scrollSnapType: "y mandatory",
          paddingRight: 10,
          paddingBottom: 60
        }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
              Knowledge <span className="gradient-text">Feed</span>
            </h1>
            <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>
              Curated educational content ranked by learning value
            </p>
          </div>

          {/* Tabs */}
          <div className="feed-tabs">
            {TABS.map(({ key, label }) => (
              <motion.button
                key={key}
                className={`feed-tab ${tab === key ? "active" : ""}`}
                onClick={() => setTab(key)}
                whileTap={{ scale: 0.97 }}
                id={`tab-${key}`}
              >
                {label}
              </motion.button>
            ))}
          </div>

          {/* Refresh */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button
              className="btn btn-ghost"
              onClick={() => loadFeed(tab)}
              style={{ fontSize: 13, padding: "8px 14px" }}
              id="feed-refresh-btn"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {error && (
            <div style={{ padding: 16, backgroundColor: "rgba(255, 50, 50, 0.1)", color: "#ff4d4d", borderRadius: 8, marginBottom: 16, textAlign: "center" }}>
              {error}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="reel-card" style={{ padding: 28 }}>
                  <div className="skeleton" style={{ height: 16, width: "30%", marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 24, width: "80%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 16, width: "100%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 16, width: "90%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 16, width: "75%" }} />
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {items.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>
                      {tab === "following" ? "👥" : "🌱"}
                    </div>
                    <h3 style={{ marginBottom: 8 }}>
                      {tab === "following" ? "Follow some creators first" : "No content yet"}
                    </h3>
                    <p style={{ color: "var(--kv-text-muted)", fontSize: 14 }}>
                      {tab === "following"
                        ? "Explore and follow creators to see their content here"
                        : "Be the first to create educational content!"}
                    </p>
                  </div>
                ) : (
                  items.map((item, i) => (
                    <KnowledgeReel key={item.id} item={item} index={i} />
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
