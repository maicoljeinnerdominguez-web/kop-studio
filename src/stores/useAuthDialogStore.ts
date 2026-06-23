import { create } from "zustand";

interface AuthDialogStore {
  isOpen: boolean;
  initialTab: "login" | "register";
  open: (tab?: "login" | "register") => void;
  close: () => void;
}

export const useAuthDialogStore = create<AuthDialogStore>()((set) => ({
  isOpen: false,
  initialTab: "login",
  open: (tab = "login") => set({ isOpen: true, initialTab: tab }),
  close: () => set({ isOpen: false }),
}));