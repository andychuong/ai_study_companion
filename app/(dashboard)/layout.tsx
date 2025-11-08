"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUIStore } from "@/lib/stores/uiStore";
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Target,
  Lightbulb,
  Calendar,
  Menu,
  X,
  LogOut,
  User,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { DashboardFooter } from "@/components/layout/DashboardFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout, initialize } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize auth state from cache
    initialize().catch((error) => {
      console.error("Failed to initialize auth:", error);
    });
  }, [initialize]);

  useEffect(() => {
    if (!mounted) return;
    
    // Wait a bit for auth to initialize, then check
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const authState = useAuthStore.getState();
      
      if (!authState.isAuthenticated || !authState.token) {
        router.push("/login");
      }
    };
    
    checkAuth();
  }, [mounted, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  const navigation =
    user?.role === "tutor"
      ? [
          { name: "Dashboard", href: "/tutor", icon: LayoutDashboard },
          { name: "Students", href: "/tutor", icon: Users },
        ]
      : [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Calendar", href: "/sessions/book", icon: Calendar },
          { name: "Practice", href: "/practice", icon: BookOpen },
          { name: "Sessions", href: "/sessions", icon: History },
          { name: "Goals", href: "/goals", icon: Target },
          { name: "Suggestions", href: "/suggestions", icon: Lightbulb },
        ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-secondary-200">
            <Link 
              href={user?.role === "tutor" ? "/tutor" : "/dashboard"}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
              onClick={() => setSidebarOpen(false)}
            >
              <Image 
                src="/logo.svg" 
                alt="AI Study Companion Logo" 
                width={32} 
                height={32}
                className="flex-shrink-0"
              />
              <h1 className="text-xl font-bold text-primary-600 whitespace-nowrap truncate">AI Study Companion</h1>
            </Link>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-secondary-600 hover:text-secondary-900"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-secondary-700 hover:bg-secondary-100 hover:text-primary-600 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-secondary-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-secondary-600 hover:text-secondary-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <NotificationBell />
              {/* User info */}
              <div className="hidden md:flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-secondary-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-secondary-500">{user?.email}</p>
                </div>
              </div>
              {/* Sign out button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 pb-20">{children}</main>
      </div>
      
      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}

