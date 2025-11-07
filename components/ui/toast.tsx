"use client";

import * as React from "react";
import { useUIStore } from "@/lib/stores/uiStore";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-sm w-full">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function Toast({
  notification,
  onClose,
}: {
  notification: { type: string; message: string };
  onClose: () => void;
}) {
  const variantClasses = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4 shadow-lg",
        variantClasses[notification.type as keyof typeof variantClasses]
      )}
    >
      <p className="flex-1 text-sm font-medium">{notification.message}</p>
      <button
        onClick={onClose}
        className="text-secondary-400 hover:text-secondary-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

