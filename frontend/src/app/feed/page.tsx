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

// Mock seed data for MVP demo when backend isn't running
const MOCK_FEED: FeedItem[] = [
  {
    id: "1", title: "The Feynman Technique: Learn Anything 10x Faster",
    type: "reel", domain: "Learning Science", creator_id: "demo",
    body: "Richard Feynman, Nobel Prize-winning physicist, developed a learning method that forces true understanding. The secret: if you can't explain it simply, you don't understand it yet.\n\nStep 1: Choose a concept. Step 2: Teach it to a child. Step 3: Identify gaps. Step 4: Simplify and use analogies.",
    difficulty_level: 2, estimated_learning_value: 0.92, engagement_score: 0.88,
    view_count: 47823, like_count: 3241, concepts: ["Meta-learning", "Cognition", "Memory"],
    quiz_questions: [
      { id: "q1", question: "What is the core principle of the Feynman Technique?", options: ["Memorize everything", "Explain simply to find gaps", "Read textbooks repeatedly", "Take detailed notes"], correct_index: 1, explanation: "Feynman believed true understanding requires being able to explain a concept in the simplest terms.", concept: "Meta-learning" }
    ],
    learning_objective: "Master the Feynman learning technique", created_at: new Date().toISOString(),
  },
  {
    id: "2", title: "Neural Networks: The Brain-Inspired Revolution",
    type: "reel", domain: "AI & Machine Learning", creator_id: "demo",
    body: "Deep learning mimics the brain's neural architecture. A single neuron: receives inputs, applies weights, adds bias, passes through activation function. Stack millions — you get intelligence.\n\nThe real magic? Backpropagation: credit assignment across layers via gradient descent. Every mistake teaches the network something.",
    difficulty_level: 6, estimated_learning_value: 0.89, engagement_score: 0.82,
    view_count: 31204, like_count: 2109, concepts: ["Deep Learning", "Backpropagation", "Gradient Descent"],
    quiz_questions: [
      { id: "q2", question: "What does backpropagation do in a neural network?", options: ["Initializes weights randomly", "Propagates gradients backward to update weights", "Normalizes input data", "Selects the architecture"], correct_index: 1, explanation: "Backpropagation computes gradients of the loss with respect to weights, enabling learning.", concept: "Deep Learning" }
    ],
    learning_objective: "Understand how neural networks learn", created_at: new Date().toISOString(),
  },
  {
    id: "3", title: "Spaced Repetition: The Science of Never Forgetting",
    type: "reel", domain: "Cognitive Science", creator_id: "demo",
    body: "Hermann Ebbinghaus discovered the forgetting curve in 1885. Without review, you forget 70% within 24 hours. Spaced repetition defeats this by reviewing information at precise intervals.\n\nThe FSRS algorithm (used in Anki) predicts exactly when you'll forget something and schedules review at the optimal moment — just before forgetting.",
    difficulty_level: 3, estimated_learning_value: 0.95, engagement_score: 0.91,
    view_count: 58901, like_count: 4782, concepts: ["Spaced Repetition", "Forgetting Curve", "FSRS"],
    quiz_questions: [
      { id: "q3", question: "What percentage of information is forgotten within 24 hours without review?", options: ["30%", "50%", "70%", "90%"], correct_index: 2, explanation: "Ebbinghaus's experiments showed ~70% forgetting rate within 24 hours without active review.", concept: "Memory Science" }
    ],
    learning_objective: "Apply spaced repetition for long-term memory", created_at: new Date().toISOString(),
  },
  {
    id: "4", title: "Systems Thinking: See the Whole, Change Everything",
    type: "reel", domain: "Systems & Strategy", creator_id: "demo",
    body: "Most problems aren't problems — they're symptoms. Systems thinking teaches you to find the causal loops, feedback mechanisms, and leverage points that drive complex behavior.\n\nKey insight: the solution to a problem is often counterintuitive. Pushing harder in the wrong place makes systems worse.",
    difficulty_level: 5, estimated_learning_value: 0.87, engagement_score: 0.79,
    view_count: 22341, like_count: 1876, concepts: ["Systems Thinking", "Feedback Loops", "Mental Models"],
    quiz_questions: [],
    learning_objective: "Apply systems thinking to complex problems", created_at: new Date().toISOString(),
  },
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

      setItems(data.items.length > 0 ? data.items : MOCK_FEED);
    } catch {
      // Backend not running — show mock data
      setItems(MOCK_FEED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="feed-container">
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
