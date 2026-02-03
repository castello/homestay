import { create } from 'zustand';

interface UIState {
  language: string;
  currency: string;
  isMobileMenuOpen: boolean;
  setLanguage: (lang: string) => void;
  setCurrency: (currency: string) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  language: 'ko',
  currency: 'KRW',
  isMobileMenuOpen: false,
  setLanguage: (language) => set({ language }),
  setCurrency: (currency) => set({ currency }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
