import { create } from 'zustand';
import {
  subscribeToNotifications,
  subscribeToAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationService';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: true,
  showPanel: false,

  setNotifications: (notifications) => set({ notifications, loading: false }),
  togglePanel: () => set((s) => ({ showPanel: !s.showPanel })),
  closePanel: () => set({ showPanel: false }),

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  getUnread: () => {
    return get().notifications.filter((n) => !n.read);
  },

  markRead: async (id) => {
    await markNotificationRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllRead: async (userId) => {
    await markAllNotificationsRead(userId);
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  initSubscription: (userId, role) => {
    if (role === 'admin') {
      return subscribeToAdminNotifications((notifications) => {
        set({ notifications, loading: false });
      });
    }
    return subscribeToNotifications(userId, (notifications) => {
      const prev = get().notifications;
      set({ notifications, loading: false });
      
      // Check for new notifications and trigger browser alert
      if (prev.length > 0 && notifications.length > prev.length) {
        const newNotifs = notifications.filter(
          (n) => !prev.find((p) => p.id === n.id)
        );
        newNotifs.forEach((n) => {
          if (!n.read) {
            // Trigger the toast callback if set
            const onNew = get()._onNewNotification;
            if (onNew) onNew(n);
          }
        });
      }
    });
  },

  // Callback for new notification toasts
  _onNewNotification: null,
  setOnNewNotification: (fn) => set({ _onNewNotification: fn }),
}));

export default useNotificationStore;
