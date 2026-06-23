import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string; role: string } | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
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
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return { success: false, error: data.error || "Credenciales inválidas" };
          }
          const data = await res.json();
          set({
            isAuthenticated: true,
            user: data.user,
            isAdmin: data.user.role === "ADMIN",
          });
          return { success: true };
        } catch {
          return { success: false, error: "Error de conexión" };
        }
      },

      register: async (name: string, email: string, password: string, phone?: string) => {
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, phone }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return { success: false, error: data.error || "Error al registrarse" };
          }
          const data = await res.json();
          set({
            isAuthenticated: true,
            user: data.user,
            isAdmin: data.user.role === "ADMIN",
          });
          return { success: true };
        } catch {
          return { success: false, error: "Error de conexión" };
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