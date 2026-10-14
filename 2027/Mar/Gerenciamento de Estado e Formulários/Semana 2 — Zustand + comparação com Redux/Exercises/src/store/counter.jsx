import { create } from "zustand";

export const useCounterStore = create((set) => ({
  count: 0,
  
  increment: () => set((state) => ({count : state.count + 1})),
  
  incrementAmount: (value) => set((state) => ({ count: state.count + value })),
  
  deleteIncrement: () => set((state) => ({ count: state.count - 1 })),
  
  resetAllIncrement: () => set({ count: 0 })
}));
