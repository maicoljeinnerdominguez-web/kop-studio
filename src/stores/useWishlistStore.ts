import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlist: [] as string[],

      toggleWishlist: (productId: string) => {
        set((state) => {
          const exists = state.wishlist.includes(productId);
          return {
            wishlist: exists
              ? state.wishlist.filter((id) => id !== productId)
              : [...state.wishlist, productId],
          };
        });
      },

      isInWishlist: (productId: string) => {
        return get().wishlist.includes(productId);
      },

      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: "kop-wishlist",
      partialize: (state) => ({ wishlist: state.wishlist }),
    }
  )
);