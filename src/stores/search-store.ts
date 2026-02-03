import { create } from 'zustand';

interface SearchState {
  keyword: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  infants: number;
  setKeyword: (keyword: string) => void;
  setDates: (checkin: string, checkout: string) => void;
  setGuests: (adults: number, children: number, infants: number) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  keyword: '',
  checkin: '',
  checkout: '',
  adults: 1,
  children: 0,
  infants: 0,
  setKeyword: (keyword) => set({ keyword }),
  setDates: (checkin, checkout) => set({ checkin, checkout }),
  setGuests: (adults, children, infants) => set({ adults, children, infants }),
  reset: () => set({ keyword: '', checkin: '', checkout: '', adults: 1, children: 0, infants: 0 }),
}));
