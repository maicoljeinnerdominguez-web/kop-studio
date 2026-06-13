import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductVariant } from "@/types";

const FREE_SHIPPING_THRESHOLD = 250000;
const UPSELL_PRODUCT_ID = "upsell-puffer-bag";
const UPSELL_PRICE = 40000;

interface CartStore {
  items: CartItem[];
  isUpsellActive: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleUpsell: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getShippingProgress: () => number;
  getRemainingForFreeShipping: () => number;
  hasFreeShipping: () => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isUpsellActive: false,
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),

      addItem: (product, variant, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.variant.id === variant.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.variant.id === variant.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, variant, quantity }] });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variant.id !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variant.id === variantId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], isUpsellActive: false }),

      toggleUpsell: () => set((s) => ({ isUpsellActive: !s.isUpsellActive })),

      getSubtotal: () => {
        const { items, isUpsellActive } = get();
        const subtotal = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        return isUpsellActive ? subtotal + UPSELL_PRICE : subtotal;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const hasFree = get().hasFreeShipping();
        return hasFree ? subtotal : subtotal + 15000;
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getShippingProgress: () => {
        const subtotal = get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        return Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
      },

      getRemainingForFreeShipping: () => {
        const subtotal = get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        return Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
      },

      hasFreeShipping: () => {
        const subtotal = get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        return subtotal >= FREE_SHIPPING_THRESHOLD;
      },
    }),
    {
      name: "kop-cart",
      partialize: (state) => ({
        items: state.items,
        isUpsellActive: state.isUpsellActive,
      }),
    }
  )
);

export { FREE_SHIPPING_THRESHOLD, UPSELL_PRICE, UPSELL_PRODUCT_ID };