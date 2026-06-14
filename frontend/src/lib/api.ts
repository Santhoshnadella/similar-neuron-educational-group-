// ─── API Service Layer ─────────────────────────────────────────
// Uses native fetch (no axios). All requests go through this module.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kv_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  clerkSync: (data: { clerk_id: string; email: string; username: string; avatar_url?: string }) =>
    request<AuthResponse>("/auth/clerk", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Feed ──────────────────────────────────────────────────────
export const feedApi = {
  personalized: (page = 1) =>
    request<FeedResponse>(`/feed/personalized?page=${page}&limit=10`),

  trending: (page = 1, domain?: string) =>
    request<FeedResponse>(
      `/feed/trending?page=${page}&limit=10${domain ? `&domain=${domain}` : ""}`
    ),

  following: (page = 1) =>
    request<FeedResponse>(`/feed/following?page=${page}&limit=10`),
};

// ─── Content ───────────────────────────────────────────────────
export const contentApi = {
  get: (id: string) => request<FeedItem>(`/content/${id}`),

  create: (data: ContentCreate) =>
    request<FeedItem>("/content/", { method: "POST", body: JSON.stringify(data) }),

  like: (id: string) =>
    request<{ liked: boolean; like_count: number }>(`/content/${id}/like`, {
      method: "POST",
    }),
};

// ─── AI / Agents ───────────────────────────────────────────────
export const aiApi = {
  chat: (data: ChatRequest) =>
    request<ChatResponse>("/ai/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  tutor: (data: TutorRequest) =>
    request<TutorResponse>("/ai/tutor", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  roadmap: (data: { topic: string; level?: string; goal?: string }) =>
    request<RoadmapResponse>("/ai/generate-roadmap", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  quiz: (data: { topic: string; difficulty?: string; count?: number }) =>
    request<QuizResponse>("/ai/quiz", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  explain: (data: { concept: string; mode?: string; context?: string }) =>
    request<ExplainResponse>("/ai/explain", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  status: () => request<AIStatusResponse>("/ai/status"),

  streamChat: (
    data: ChatRequest,
    onChunk: (chunk: string) => void,
    onDone: () => void
  ) => {
    const token = getToken();
    return fetch(`${BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...data, stream: true }),
    }).then(async (res) => {
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) { onDone(); break; }
        const text = decoder.decode(value);
        for (const line of text.split("\n")) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") { onDone(); return; }
            try {
              const parsed = JSON.parse(payload);
              if (parsed.delta) onChunk(parsed.delta);
            } catch {}
          }
        }
      }
    });
  },
};

// ─── Users ─────────────────────────────────────────────────────
export const usersApi = {
  me: () => request<User>("/users/me"),
  profile: (username: string) => request<User>(`/users/${username}`),
  achievements: () => request<{ achievements: Achievement[] }>("/users/me/achievements"),
  dashboardStats: () => request<DashboardStatsResponse>("/users/me/dashboard_stats"),
};

// ─── Community ─────────────────────────────────────────────────
export const communityApi = {
  guilds: () => request<{ guilds: Guild[] }>("/community/guilds"),
  joinGuild: (guildId: string) => request<{ message: string }>(`/community/guilds/${guildId}/join`, { method: "POST" }),
  debates: () => request<{ debates: Debate[] }>("/community/debates"),
  argueDebate: (debateId: string, argument: string) => request<{ message: string; xp_awarded: number; ai_feedback: string }>(`/community/debates/${debateId}/argue`, {
    method: "POST",
    body: JSON.stringify({ argument }),
  }),
};

// ─── Learning ──────────────────────────────────────────────────
export const learningApi = {
  feed: (limit = 10) => request<{ items: FeedItem[] }>(`/feed/personalized?limit=${limit}`),
  recordSession: (contentId: string, time: number) =>
    request<{ session_id: string; message: string }>("/learning/session", {
      method: "POST",
      body: JSON.stringify({ content_id: contentId, watch_time: time, interactions: 1 }),
    }),
  deepWork: (time: number) =>
    request<{ session_id: string; message: string }>("/learning/session/deep-work", {
      method: "POST",
      body: JSON.stringify({ duration_minutes: time }),
    }),
  getDueFlashcards: () => request<{ cards: FlashCard[]; total: number }>("/learning/flashcards/due"),
  reviewFlashcard: (cardId: string, quality: number) =>
    request<{ card_id: string; new_stability: number; new_difficulty: number; next_review: string; xp_earned: number }>(`/learning/flashcards/${cardId}/review`, {
      method: "POST",
      body: JSON.stringify(quality)
    }),
  submitGameScore: (gameType: string, score: number) =>
    request<{ message: string; new_cognitive_index: number; xp_earned: number }>("/learning/games/score", {
      method: "POST",
      body: JSON.stringify({ game_type: gameType, score }),
    }),
  getSkillsTree: () =>
    request<{ nodes: any[]; achievements: any[] }>("/learning/skills/tree"),
  uploadContent: (title: string, body: string, domain: string) =>
    request<{ message: string; content_id: string }>("/learning/content", {
      method: "POST",
      body: JSON.stringify({ title, body, domain }),
    }),
  search: (query: string) =>
    request<{ results: any[] }>(`/learning/search?q=${query}`),
};

// ─── Concepts / Knowledge Graph ────────────────────────────────
export const conceptsApi = {
  map: (topic: string) =>
    request<ConceptMap>(`/concepts/map/${encodeURIComponent(topic)}`),
  list: (domain?: string) =>
    request<{ concepts: Concept[] }>(`/concepts/${domain ? `?domain=${domain}` : ""}`),
};

// ─── Types ─────────────────────────────────────────────────────
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  learning_level: string;
  streak: number;
  xp: number;
  level: number;
  focus_score: number;
  curiosity_score: number;
  is_creator: boolean;
  cognitive_profile?: CognitiveProfile;
  created_at: string;
}

export interface CognitiveProfile {
  working_memory: number;
  processing_speed: number;
  attention_control: number;
  spatial_reasoning: number;
  creativity: number;
  emotional_regulation: number;
  cognitive_index: number;
}

export interface FeedItem {
  id: string;
  title: string;
  type: string;
  domain?: string;
  body?: string;
  media_url?: string;
  thumbnail_url?: string;
  difficulty_level: number;
  estimated_learning_value: number;
  engagement_score: number;
  view_count: number;
  like_count: number;
  concepts: string[];
  quiz_questions: QuizQuestion[];
  learning_objective?: string;
  feynman_explanation?: string;
  creator_id: string;
  created_at: string;
}

export interface FeedResponse {
  items: FeedItem[];
  page: number;
  limit: number;
  total: number;
}

export interface ContentCreate {
  title: string;
  type?: string;
  domain?: string;
  body?: string;
  difficulty_level?: number;
  concepts?: string[];
  quiz_questions?: QuizQuestion[];
  learning_objective?: string;
  feynman_explanation?: string;
}

export interface ChatMessage { role: "user" | "assistant"; content: string; }
export interface ChatRequest {
  message: string;
  mode?: string;
  topic?: string;
  history?: ChatMessage[];
  stream?: boolean;
}
export interface ChatResponse {
  intent: string;
  query: string;
  response: string;
  model: string;
  source: string;
}

export interface TutorRequest {
  message: string;
  mode?: string;
  topic?: string;
  history?: ChatMessage[];
}
export interface TutorResponse { reply: string; mode: string; }

export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  concept_id: string | null;
  stability: number;
  difficulty: number;
  review_count: number;
}

export interface DashboardStatsResponse {
  total_deep_work_hours: number;
  optimal_time: string;
  average_focus: number;
  time_series: { time: string; focus: number }[];
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  estimated_hours: number;
  prerequisites: string[];
  is_core: boolean;
}
export interface RoadmapResponse {
  topic: string;
  level: string;
  nodes: RoadmapNode[];
  estimated_total_hours: number;
  pareto_path: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  concept: string;
}
export interface QuizResponse { topic: string; questions: QuizQuestion[]; }

export interface ExplainResponse {
  concept: string;
  mode: string;
  explanation: string;
  analogy?: string;
  key_insights: string[];
  common_misconceptions: string[];
}

export interface AIStatusResponse {
  lm_studio: {
    available: boolean;
    url: string;
    current_model: string;
    loaded_models: string[];
  };
  message: string;
}

export interface ConceptMap {
  topic: string;
  nodes: { id: string; label: string; type: string; x: number; y: number }[];
  edges: { source: string; target: string }[];
}

export interface Concept { id: string; name: string; domain?: string; difficulty: number; }

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
}

export interface Debate {
  id: string;
  topic: string;
  status: string;
}
