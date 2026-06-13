import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppView } from "@/types";

interface NavigationStore {
  currentView: AppView;
  viewParams: Record<string, string>;
  previousView: AppView | null;
  navigate: (view: AppView, params?: Record<string, string>) => void;
  goBack: () => void;
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      currentView: "home",
      viewParams: {},
      previousView: null,
      navigate: (view, params = {}) => {
        const { currentView } = get();
        set({
          previousView: currentView,
          currentView: view,
          viewParams: params,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      goBack: () => {
        const { previousView, currentView } = get();
        if (previousView) {
          set({
            currentView: previousView,
            previousView: currentView,
            viewParams: {},
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          set({ currentView: "home", viewParams: {} });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
    }),
    {
      name: "kop-navigation",
      partialize: () => ({}),
    }
  )
);