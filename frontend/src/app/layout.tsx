import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
