import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { DeepWorkButton } from "@/components/DeepWorkButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KnowledgeVerse — Learn Smarter, Not Harder",
  description:
    "AI-native educational social network. Transform scrolling into mastery with adaptive learning, AI tutoring, and knowledge graphs.",
  keywords: ["learning", "AI tutor", "education", "knowledge graph", "adaptive LMS"],
  openGraph: {
    title: "KnowledgeVerse",
    description: "AI-native educational social network + adaptive LMS",
    type: "website",
  },
};

import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ClerkProvider>
          <header style={{ padding: "16px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", borderBottom: "1px solid var(--kv-border)", height: "64px" }}>
            <Show when="signed-out">
              <SignInButton mode="modal" />
              <SignUpButton mode="modal">
                <button style={{ 
                  background: "var(--kv-accent-violet)", 
                  color: "white", 
                  borderRadius: "9999px", 
                  fontWeight: 500, 
                  fontSize: "14px", 
                  height: "40px", 
                  padding: "0 20px", 
                  cursor: "pointer",
                  border: "none"
                }}>
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          <Providers>
            {children}
            <DeepWorkButton />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
