import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { DeepWorkButton } from "@/components/DeepWorkButton";
import { FocusCoach } from "@/components/FocusCoach";

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

import { ClerkProvider, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ClerkProvider>
          <header style={{ padding: "16px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", borderBottom: "1px solid var(--kv-border)", height: "64px" }}>
            {!isSignedIn ? (
              <>
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
              </>
            ) : (
              <UserButton />
            )}
          </header>
          <Providers>
            {children}
            <DeepWorkButton />
            <FocusCoach />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
