import { create } from "zustand";
import type { Habit } from "./types";

interface UIState {
  habitModalOpen: boolean;
  editingHabit: Habit | null;
  commandPaletteOpen: boolean;
  activeDetailHabitId: string | null;
  openCreateHabit: () => void;
  openEditHabit: (habit: Habit) => void;
  closeHabitModal: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openHabitDetail: (id: string) => void;
  closeHabitDetail: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  habitModalOpen: false,
  editingHabit: null,
  commandPaletteOpen: false,
  activeDetailHabitId: null,
  openCreateHabit: () => set({ habitModalOpen: true, editingHabit: null }),
  openEditHabit: (habit) => set({ habitModalOpen: true, editingHabit: habit }),
  closeHabitModal: () => set({ habitModalOpen: false, editingHabit: null }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  openHabitDetail: (id) => set({ activeDetailHabitId: id }),
  closeHabitDetail: () => set({ activeDetailHabitId: null }),
}));
