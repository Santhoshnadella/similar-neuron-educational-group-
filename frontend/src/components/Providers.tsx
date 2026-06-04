"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function ClerkSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { isAuthenticated, setAuth } = useAuthStore();

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !isAuthenticated) {
      // Sync clerk user to custom backend
      const sync = async () => {
        try {
          const res = await authApi.clerkSync({
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            username: user.username || user.firstName || "user",
            avatar_url: user.imageUrl,
          });
          setAuth(res.user, res.access_token);
        } catch (error) {
          console.error("Failed to sync Clerk user:", error);
        }
      };
      sync();
    }
  }, [isLoaded, isSignedIn, user, isAuthenticated, setAuth]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkSync />
      {children}
    </QueryClientProvider>
  );
}
