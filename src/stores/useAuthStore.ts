import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string; role: string } | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isAdmin: false,

      login: async (email: string, password: string) => {
        try {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) return false;
          const data = await res.json();
          set({
            isAuthenticated: true,
            user: data.user,
            isAdmin: data.user.role === "ADMIN",
          });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => {
        set({ isAuthenticated: false, user: null, isAdmin: false });
      },
    }),
    {
      name: "kop-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        isAdmin: state.isAdmin,
      }),
    }
  )
);