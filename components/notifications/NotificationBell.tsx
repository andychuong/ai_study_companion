"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { notificationsApi } from "@/lib/api/notifications";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function NotificationBell() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showDropdown, setShowDropdown] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return { notifications: [], unreadCount: 0 };
      const response = await notificationsApi.getNotifications(user.id);
      return response.data;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error("User not found");
      return notificationsApi.markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const unreadCount = data?.unreadCount || 0;
  const notifications = data?.notifications || [];
  const unreadNotifications = notifications.filter((n) => !n.read).slice(0, 5);

  const handleNotificationClick = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="error"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
              <h3 className="font-semibold text-secondary-900">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    markAllAsReadMutation.mutate();
                  }}
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all read
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-secondary-600">Loading...</div>
            ) : unreadNotifications.length === 0 ? (
              <div className="p-8 text-center text-secondary-600">
                <Bell className="h-8 w-8 text-secondary-300 mx-auto mb-2" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-200">
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-secondary-50 cursor-pointer ${
                      !notification.read ? "bg-primary-50" : ""
                    }`}
                    onClick={() => {
                      handleNotificationClick(notification.id);
                      if (notification.ctaUrl) {
                        window.location.href = notification.ctaUrl;
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-secondary-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-secondary-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.cta && (
                          <Link
                            href={notification.ctaUrl || "#"}
                            className="text-xs text-primary-600 hover:text-primary-700 mt-2 inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {notification.cta} →
                          </Link>
                        )}
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-secondary-200">
              <Link href="/notifications">
                <Button variant="outline" className="w-full" onClick={() => setShowDropdown(false)}>
                  View All Notifications
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

