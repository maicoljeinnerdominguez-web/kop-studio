import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareState {
  productIds: string[]
  addProduct: (id: string) => void
  removeProduct: (id: string) => void
  clearComparison: () => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      productIds: [],

      addProduct: (id) =>
        set((s) => {
          if (s.productIds.includes(id) || s.productIds.length >= 3) return s
          return { productIds: [...s.productIds, id] }
        }),

      removeProduct: (id) =>
        set((s) => ({ productIds: s.productIds.filter((pid) => pid !== id) })),

      clearComparison: () => set({ productIds: [] }),
    }),
    {
      name: 'kop-compare',
      partialize: (state) => ({ productIds: state.productIds }),
    }
  )
)