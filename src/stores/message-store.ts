import { create } from 'zustand';

interface MessageState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
}));
