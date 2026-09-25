import { useCallback } from 'react';

import { fetchNotifications } from '../api/notifications';
import type { Notification } from '../types/models';
import { useAsyncData } from './useAsyncData';

const NO_NOTIFICATIONS: Notification[] = [];

/** Notifications for the signed-in user; empty while signed out. */
export function useNotifications(userId: string | undefined) {
  const load = useCallback(() => fetchNotifications(userId ?? ''), [userId]);
  const { data, isLoading, error } = useAsyncData(userId ? load : null);

  const notifications = data ?? NO_NOTIFICATIONS;
  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    isLoading,
    error,
  };
}
