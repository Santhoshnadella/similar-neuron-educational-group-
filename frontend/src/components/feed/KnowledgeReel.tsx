"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, BookOpen, Share2, Brain, ChevronRight, Eye,
  Clock, Star, Zap,
} from "lucide-react";
import type { FeedItem } from "@/lib/api";
import { contentApi } from "@/lib/api";
import { QuizPopup } from "./QuizPopup";

interface Props {
  item: FeedItem;
  index?: number;
}

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Beginner", 2: "Beginner", 3: "Easy",
  4: "Easy", 5: "Medium", 6: "Medium",
  7: "Hard", 8: "Hard", 9: "Expert", 10: "Expert",
};

export function KnowledgeReel({ item, index = 0 }: Props) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.like_count);
  const [showQuiz, setShowQuiz] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikeCount((c) => c + 1);
    try { await contentApi.like(item.id); } catch {}
  };

  const diffClass = `difficulty-${item.difficulty_level}`;
  const bodyText = item.body ?? item.feynman_explanation ?? item.learning_objective ?? "";
  const preview = bodyText.length > 200 && !expanded ? bodyText.slice(0, 200) + "…" : bodyText;

  return (
    <>
      <motion.div
        className="reel-card fade-in-up"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4" style={{ marginBottom: 16 }}>
          {item.domain && (
            <span className="reel-domain-badge">
              <Brain size={11} />
              {item.domain}
            </span>
          )}
          <span className={`difficulty-badge ${diffClass}`} style={{ marginLeft: "auto" }}>
            {DIFFICULTY_LABEL[item.difficulty_level] ?? "Medium"}
          </span>
        </div>

        {/* Title */}
        <h2 className="reel-title">{item.title}</h2>

        {/* Body */}
        {bodyText && (
          <div className="reel-body">
            {preview}
            {bodyText.length > 200 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                style={{ color: "var(--kv-accent-violet)", background: "none", border: "none", cursor: "pointer", marginLeft: 4, fontSize: 14, fontWeight: 600 }}
              >
                {expanded ? " Show less" : " Read more"}
              </button>
            )}
          </div>
        )}

        {/* Concepts */}
        {item.concepts && item.concepts.length > 0 && (
          <div className="flex gap-2" style={{ flexWrap: "wrap", marginBottom: 16, gap: 6 }}>
            {(item.concepts as string[]).slice(0, 4).map((c) => (
              <span key={c} style={{
                padding: "3px 10px",
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.15)",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 600,
                color: "var(--kv-accent-cyan)",
              }}>
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="reel-meta">
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Eye size={13} /> {item.view_count.toLocaleString()}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Star size={13} /> {(item.estimated_learning_value * 100).toFixed(0)}% value
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={13} /> {Math.ceil(item.difficulty_level * 1.5)} min
          </span>
        </div>

        {/* Actions */}
        <div className="reel-actions">
          <motion.button
            className={`action-btn ${liked ? "liked" : ""}`}
            onClick={handleLike}
            whileTap={{ scale: 0.9 }}
            id={`like-btn-${item.id}`}
          >
            <Heart size={15} fill={liked ? "currentColor" : "none"} />
            {likeCount}
          </motion.button>

          {item.quiz_questions && item.quiz_questions.length > 0 && (
            <motion.button
              className="action-btn"
              onClick={() => setShowQuiz(true)}
              whileTap={{ scale: 0.9 }}
              id={`quiz-btn-${item.id}`}
              style={{ background: "rgba(124,58,237,0.08)", borderColor: "rgba(124,58,237,0.2)", color: "var(--kv-accent-violet)" }}
            >
              <Zap size={15} />
              Quiz
            </motion.button>
          )}

          <motion.button
            className="action-btn"
            whileTap={{ scale: 0.9 }}
            id={`study-btn-${item.id}`}
          >
            <BookOpen size={15} />
            Study
          </motion.button>

          <motion.button
            className="action-btn"
            whileTap={{ scale: 0.9 }}
            style={{ marginLeft: "auto" }}
            id={`share-btn-${item.id}`}
          >
            <Share2 size={15} />
          </motion.button>

          <motion.button
            className="btn btn-primary"
            whileTap={{ scale: 0.97 }}
            style={{ padding: "8px 16px", fontSize: 13 }}
            id={`learn-btn-${item.id}`}
          >
            Learn <ChevronRight size={14} />
          </motion.button>
        </div>
      </motion.div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && (
          <QuizPopup
            questions={item.quiz_questions}
            topic={item.title}
            onClose={() => setShowQuiz(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
