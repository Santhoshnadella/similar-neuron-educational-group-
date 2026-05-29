"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import type { QuizQuestion } from "@/lib/api";

interface Props {
  questions: QuizQuestion[];
  topic: string;
  onClose: () => void;
}

export function QuizPopup({ questions, topic, onClose }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[current];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct_index) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560,
          background: "var(--kv-bg-card)",
          borderRadius: "var(--kv-radius-xl)",
          border: "1px solid var(--kv-border)",
          padding: 32,
          boxShadow: "var(--kv-shadow-lg)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--kv-accent-violet)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Quick Quiz
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{topic}</h3>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X size={18} />
          </button>
        </div>

        {!done ? (
          <>
            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8, fontSize: 12, color: "var(--kv-text-muted)" }}>
                <span>Question {current + 1} of {questions.length}</span>
                <span>{score} correct</span>
              </div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${((current) / questions.length) * 100}%` }} />
              </div>
            </div>

            {/* Question */}
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>
              {q.question}
            </p>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((opt, idx) => {
                let variant = "";
                if (selected !== null) {
                  if (idx === q.correct_index) variant = "correct";
                  else if (idx === selected) variant = "wrong";
                }
                return (
                  <motion.button
                    key={idx}
                    className={`quiz-option ${variant}`}
                    onClick={() => handleAnswer(idx)}
                    whileTap={{ scale: 0.98 }}
                    id={`quiz-opt-${idx}`}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {selected !== null && idx === q.correct_index && <CheckCircle2 size={16} />}
                      {selected !== null && idx === selected && idx !== q.correct_index && <XCircle size={16} />}
                      {opt}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 16,
                  padding: 14,
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: "var(--kv-radius-md)",
                  fontSize: 14,
                  color: "var(--kv-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                💡 {q.explanation}
              </motion.div>
            )}

            {selected !== null && (
              <motion.button
                className="btn btn-primary w-full"
                onClick={handleNext}
                whileTap={{ scale: 0.97 }}
                style={{ marginTop: 20 }}
                id="quiz-next-btn"
              >
                {current + 1 >= questions.length ? "See Results" : "Next"} <ChevronRight size={16} />
              </motion.button>
            )}
          </>
        ) : (
          /* Results screen */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>
              {score === questions.length ? "🏆" : score >= questions.length / 2 ? "⚡" : "📚"}
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              {score}/{questions.length}
            </h2>
            <p style={{ color: "var(--kv-text-secondary)", marginBottom: 24 }}>
              {score === questions.length
                ? "Perfect! You've mastered this topic."
                : score >= questions.length / 2
                ? "Good work! Keep practicing to master it."
                : "Keep learning — you'll get there!"}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn btn-ghost" onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false); }}>
                Retry
              </button>
              <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
