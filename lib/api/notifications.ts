import apiClient from './client';
import { AxiosResponse } from 'axios';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  cta: string | null;
  ctaUrl: string | null;
  urgency: 'low' | 'medium' | 'high';
  read: boolean;
  readAt: string | null;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationsApi = {
  /**
   * Get all notifications for a student
   */
  getNotifications: async (studentId: string): Promise<AxiosResponse<NotificationsResponse>> => {
    return apiClient.get<NotificationsResponse>(`/notifications/student/${studentId}`);
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<AxiosResponse<{ id: string; read: boolean; message: string }>> => {
    return apiClient.post<{ id: string; read: boolean; message: string }>(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (studentId: string): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(`/notifications/student/${studentId}/read-all`);
  },
};

