"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * AuthProvider - Initializes authentication state on app load
 * This ensures the user stays logged in across page refreshes
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth state when the app loads
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

