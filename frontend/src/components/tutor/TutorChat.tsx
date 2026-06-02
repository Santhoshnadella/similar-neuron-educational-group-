"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Cpu } from "lucide-react";
import { useTutorStore } from "@/store/tutorStore";
import { useAuthStore } from "@/store/authStore";
import { aiApi } from "@/lib/api";
import { ModeSelector } from "./ModeSelector";
import ReactMarkdown from "react-markdown";

export function TutorChat() {
  const { messages, mode, topic, isLoading, streamingContent, addMessage, setLoading, appendStream, commitStream } = useTutorStore();
  const { isAuthenticated } = useAuthStore();
  const [input, setInput] = useState("");
  const [useStream, setUseStream] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    addMessage({ role: "user", content: text });
    setInput("");
    setLoading(true);

    try {
      if (useStream && isAuthenticated) {
        await aiApi.streamChat(
          { message: text, mode, topic: topic || undefined, history: messages, stream: true },
          appendStream,
          () => { commitStream(); setLoading(false); }
        );
      } else {
        const res = await aiApi.chat({ message: text, mode, topic: topic || undefined, history: messages });
        const reply = typeof res.response === "string" ? res.response : JSON.stringify(res.response);
        addMessage({ role: "assistant", content: reply });
        setLoading(false);
      }
    } catch (err: any) {
      addMessage({ role: "assistant", content: `⚠️ ${err.message ?? "Error reaching AI. Is LM Studio running?"}` });
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="chat-container">
      {/* Mode Selector */}
      <ModeSelector />

      {/* AI Status chip */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 12px",
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 9999, fontSize: 12, fontWeight: 600,
          color: "var(--kv-accent-emerald)",
        }}>
          <Cpu size={12} />
          Gemma 4 E2B via LM Studio
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--kv-text-muted)", cursor: "pointer", marginLeft: "auto" }}>
          <input type="checkbox" checked={useStream} onChange={(e) => setUseStream(e.target.checked)} style={{ accentColor: "var(--kv-accent-purple)" }} />
          Stream
        </label>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Your AI Tutor</h3>
            <p style={{ color: "var(--kv-text-muted)", maxWidth: 360, margin: "0 auto", lineHeight: 1.7 }}>
              Ask anything. I'll teach it in <strong>{mode}</strong> mode using Gemma 4 running locally on your machine.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
              {["Explain quantum entanglement", "Teach me recursion", "What is neuroplasticity?", "How does RLHF work?"].map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  style={{
                    padding: "8px 14px", borderRadius: 9999, fontSize: 13,
                    border: "1px solid var(--kv-border)", background: "var(--kv-bg-card)",
                    color: "var(--kv-text-secondary)", cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: msg.role === "user" ? "var(--kv-accent-purple)" : "var(--kv-bg-elevated)",
                border: "1px solid var(--kv-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {msg.role === "user" ? <User size={14} color="white" /> : <Bot size={14} color="var(--kv-accent-cyan)" />}
              </div>
              <div className={`message-bubble ${msg.role}`} style={{ overflowX: "auto" }}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert max-w-none text-[14px]">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming bubble */}
        {streamingContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "var(--kv-bg-elevated)", border: "1px solid var(--kv-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={14} color="var(--kv-accent-cyan)" />
            </div>
            <div className="message-bubble assistant" style={{ overflowX: "auto" }}>
              <div className="prose prose-invert max-w-none text-[14px]">
                <ReactMarkdown>
                  {streamingContent + " ▌"}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--kv-bg-elevated)", border: "1px solid var(--kv-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={14} color="var(--kv-accent-cyan)" />
            </div>
            <div className="message-bubble assistant" style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 4 }}>
                <span className="typing-dot" style={{ animationDelay: "0s" }}></span>
                <span className="typing-dot" style={{ animationDelay: "0.2s" }}></span>
                <span className="typing-dot" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder={`Ask in ${mode} mode… (Enter to send, Shift+Enter for newline)`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          id="tutor-input"
        />
        <motion.button
          className="btn btn-primary btn-icon"
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          whileTap={{ scale: 0.9 }}
          id="tutor-send-btn"
          style={{ flexShrink: 0, height: 52, width: 52, opacity: !input.trim() || isLoading ? 0.5 : 1 }}
        >
          {isLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={18} />}
        </motion.button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .typing-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background-color: var(--kv-accent-violet);
          animation: typing 1.4s infinite ease-in-out both;
        }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
