import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  unreadMessageCount: number;
  setUnreadCount: (count: number) => void;
  setUnreadMessageCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  unreadMessageCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setUnreadMessageCount: (unreadMessageCount) => set({ unreadMessageCount }),
}));
