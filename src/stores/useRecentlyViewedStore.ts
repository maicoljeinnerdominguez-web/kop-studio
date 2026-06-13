import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SimplifiedProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: { url: string; altText: string }[];
}

interface RecentlyViewedStore {
  recentlyViewed: SimplifiedProduct[];
  addViewedProduct: (product: SimplifiedProduct) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      recentlyViewed: [],
      addViewedProduct: (product) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter(
            (p) => p.id !== product.id
          );
          return {
            recentlyViewed: [product, ...filtered].slice(0, 10),
          };
        });
      },
    }),
    {
      name: "kop-recently-viewed",
      partialize: (state) => ({ recentlyViewed: state.recentlyViewed }),
    }
  )
);