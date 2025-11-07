"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { LoadingSpinner } from "@/components/ui/loading";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const checkAuth = async () => {
      try {
        // Initialize auth from cache/localStorage
        await initialize();
        
        // Wait a bit for state to update, then check
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const { isAuthenticated: authStatus, token } = useAuthStore.getState();
        
        if (authStatus && token) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        router.push("/login");
      }
    };
    
    checkAuth();
  }, [router, mounted, initialize]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}
