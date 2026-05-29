import { create } from "zustand";
import type { ChatMessage } from "@/lib/api";

interface TutorState {
  messages: ChatMessage[];
  mode: string;
  topic: string;
  isLoading: boolean;
  streamingContent: string;
  addMessage: (msg: ChatMessage) => void;
  setMode: (mode: string) => void;
  setTopic: (topic: string) => void;
  setLoading: (v: boolean) => void;
  appendStream: (chunk: string) => void;
  commitStream: () => void;
  clearChat: () => void;
}

export const useTutorStore = create<TutorState>((set, get) => ({
  messages: [],
  mode: "feynman",
  topic: "",
  isLoading: false,
  streamingContent: "",

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMode: (mode) => set({ mode }),
  setTopic: (topic) => set({ topic }),
  setLoading: (isLoading) => set({ isLoading }),
  appendStream: (chunk) => set((s) => ({ streamingContent: s.streamingContent + chunk })),
  commitStream: () => {
    const { streamingContent, messages } = get();
    if (!streamingContent.trim()) return;
    set({
      messages: [...messages, { role: "assistant", content: streamingContent }],
      streamingContent: "",
    });
  },
  clearChat: () => set({ messages: [], streamingContent: "" }),
}));
