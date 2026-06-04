"use client";

import { motion } from "framer-motion";
import { useTutorStore } from "@/store/tutorStore";

const MODES = [
  { key: "feynman",      label: "⚡ Feynman",    desc: "Explain like I'm 12" },
  { key: "beginner",     label: "🌱 Beginner",   desc: "Simple & clear" },
  { key: "story",        label: "📖 Story",      desc: "Narrative learning" },
  { key: "analogy",      label: "🔗 Analogy",    desc: "Compare to known" },
  { key: "socratic",     label: "❓ Socratic",   desc: "Guide by questions" },
  { key: "creativity",   label: "🎨 Creativity",  desc: "Cross-domain synthesis" },
  { key: "intermediate", label: "⚙️ Detailed",   desc: "Technical depth" },
  { key: "expert",       label: "🔬 Expert",     desc: "Deep & rigorous" },
];

export function ModeSelector() {
  const { mode, setMode, setTopic, topic } = useTutorStore();

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Topic input */}
      <div style={{ marginBottom: 14 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Topic (optional) — e.g. 'Neural Networks', 'Calculus'…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          id="tutor-topic-input"
          style={{ fontSize: 14 }}
        />
      </div>

      {/* Mode chips */}
      <div className="mode-selector">
        {MODES.map((m) => (
          <motion.button
            key={m.key}
            className={`mode-chip ${mode === m.key ? "active" : ""}`}
            onClick={() => setMode(m.key)}
            whileTap={{ scale: 0.95 }}
            title={m.desc}
            id={`mode-${m.key}`}
          >
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Active mode description */}
      <div style={{
        fontSize: 12,
        color: "var(--kv-text-muted)",
        paddingLeft: 4,
      }}>
        Mode: <strong style={{ color: "var(--kv-accent-violet)" }}>
          {MODES.find(m => m.key === mode)?.label}
        </strong> — {MODES.find(m => m.key === mode)?.desc}
      </div>
    </div>
  );
}
