"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageSquare, Compass, BarChart2, User } from "lucide-react";

const NAV = [
  { href: "/feed",    icon: BookOpen,      label: "Feed" },
  { href: "/tutor",   icon: MessageSquare, label: "Tutor" },
  { href: "/explore", icon: Compass,       label: "Explore" },
  { href: "/roadmap", icon: BarChart2,     label: "Roadmap" },
  { href: "/profile", icon: User,          label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      background: "var(--kv-bg-secondary)",
      borderTop: "1px solid var(--kv-border)",
      display: "flex",
      zIndex: 200,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 0",
              textDecoration: "none",
              color: active ? "var(--kv-accent-violet)" : "var(--kv-text-muted)",
              fontSize: 10,
              fontWeight: 600,
              gap: 4,
              transition: "color 0.15s",
            }}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
