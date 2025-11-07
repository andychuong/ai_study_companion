"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { notificationsApi, Notification } from "@/lib/api/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { handleApiError } from "@/lib/api/errorHandler";
import { useUIStore } from "@/lib/stores/uiStore";
import { Bell, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return { notifications: [], unreadCount: 0 };
      const response = await notificationsApi.getNotifications(user.id);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error("User not found");
      return notificationsApi.markAllAsRead(user.id);
    },
    onSuccess: () => {
      addNotification({
        type: "success",
        message: "All notifications marked as read",
      });
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-64 bg-secondary-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-secondary-200 rounded animate-pulse" />
        </div>
        <CardSkeleton count={5} />
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Notifications</h1>
          <p className="text-secondary-600 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={markAllAsReadMutation.isPending}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Unread ({unreadNotifications.length})
          </h2>
          <div className="space-y-3">
            {unreadNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Read ({readNotifications.length})
          </h2>
          <div className="space-y-3">
            {readNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                isRead
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {notifications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-secondary-600">
              You'll see engagement nudges and updates here when they're available.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isRead?: boolean;
}

function NotificationCard({ notification, onMarkAsRead, isRead = false }: NotificationCardProps) {
  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <AlertCircle className="h-5 w-5 text-error-600" />;
      case "medium":
        return <Info className="h-5 w-5 text-warning-600" />;
      default:
        return <Bell className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <Card className={isRead ? "opacity-75" : "border-primary-200 bg-primary-50"}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getUrgencyIcon(notification.urgency)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-secondary-900">{notification.title}</h3>
                <Badge variant={getUrgencyBadge(notification.urgency)} className="text-xs">
                  {notification.urgency}
                </Badge>
              </div>
              {!isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-secondary-600 mb-2">{notification.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-500">
                {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
              {notification.cta && notification.ctaUrl && (
                <Link href={notification.ctaUrl}>
                  <Button variant="primary" size="sm">
                    {notification.cta}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

