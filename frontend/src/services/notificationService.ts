import { api } from './api';
import type { ApiResponse } from '../types';
import type {
  Notification,
  NotificationPreference,
  NotificationFilterParams,
  PaginatedNotificationsResponse,
} from '../types/notification';

export const notificationService = {
  async getNotifications(params?: NotificationFilterParams) {
    const res = await api.get<ApiResponse<PaginatedNotificationsResponse>>('/notifications', { params });
    return res.data;
  },

  async getUnreadCount() {
    const res = await api.get<ApiResponse<{ unread_count: number }>>('/notifications/unread-count');
    return res.data;
  },

  async getNotification(id: string) {
    const res = await api.get<ApiResponse<Notification>>(`/notifications/${id}`);
    return res.data;
  },

  async markAsRead(id: string) {
    const res = await api.post<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAsUnread(id: string) {
    const res = await api.post<ApiResponse<Notification>>(`/notifications/${id}/unread`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.post<ApiResponse<{ updated_count: number }>>('/notifications/read-all');
    return res.data;
  },

  async deleteNotification(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/notifications/${id}`);
    return res.data;
  },

  async deleteAllRead() {
    const res = await api.delete<ApiResponse<{ deleted_count: number }>>('/notifications/read');
    return res.data;
  },

  async getPreferences() {
    const res = await api.get<ApiResponse<NotificationPreference[]>>('/notification-preferences');
    return res.data;
  },

  async updatePreference(key: string, enabled: boolean) {
    const res = await api.patch<ApiResponse<NotificationPreference>>(`/notification-preferences/${key}`, { enabled });
    return res.data;
  },

  async resetPreferences() {
    const res = await api.post<ApiResponse<null>>('/notification-preferences/reset');
    return res.data;
  },
};
