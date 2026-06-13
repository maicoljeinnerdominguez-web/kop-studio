'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag, Truck, ArrowRight, Package, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useCartStore,
  FREE_SHIPPING_THRESHOLD,
  UPSELL_PRICE,
} from '@/stores/useCartStore';
import { useNavigationStore } from '@/stores/useNavigationStore';

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isUpsellActive = useCartStore((s) => s.isUpsellActive);
  const toggleUpsell = useCartStore((s) => s.toggleUpsell);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getShippingProgress = useCartStore((s) => s.getShippingProgress);
  const getRemainingForFreeShipping = useCartStore((s) => s.getRemainingForFreeShipping);
  const hasFreeShipping = useCartStore((s) => s.hasFreeShipping);
  const navigate = useNavigationStore((s) => s.navigate);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const total = getTotal();
  const shippingProgress = getShippingProgress();
  const remaining = getRemainingForFreeShipping();
  const freeShipping = hasFreeShipping();
  const shippingCost = freeShipping ? 0 : 15000;

  const handleCheckout = () => {
    closeCart();
    navigate('checkout');
  };

  const handleExploreStore = () => {
    closeCart();
    navigate('home');
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="bg-[#0a0a0a] border-[#262626] w-full sm:max-w-md flex flex-col p-0"
      >
        {/* Red gradient line at top */}
        <div className="h-1 bg-gradient-to-r from-red-600 to-red-800 flex-shrink-0" />

        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#262626] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-white text-base uppercase tracking-wider font-bold">
                TU CARRITO{' '}
                {itemCount > 0 && (
                  <span className="text-neutral-400 font-normal text-sm">
                    ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                )}
              </SheetTitle>
              <div className="h-0.5 w-8 bg-red-600 mt-1" />
            </div>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative"
            >
              <Heart className="size-20 text-neutral-700" />
              <motion.div
                className="absolute -inset-2 rounded-full bg-red-600/5"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              />
            </motion.div>
            <div className="text-center">
              <p className="text-white text-lg uppercase tracking-wider font-bold mb-2">
                TU CARRITO ESTÁ VACÍO
              </p>
              <p className="text-neutral-500 text-sm">
                Explora nuestra colección y encuentra tu próximo estilo
              </p>
            </div>
            <Button
              onClick={handleExploreStore}
              className="bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-wider font-bold px-8 h-11 rounded-none btn-press"
            >
              EXPLORAR TIENDA
            </Button>
          </div>
        ) : (
          <>
            {/* Shipping Progress */}
            <div className="px-5 py-3 border-b border-[#262626] flex-shrink-0">
              <Progress
                value={shippingProgress}
                className={`h-1.5 bg-[#1a1a1a] ${
                  freeShipping
                    ? '[&>[data-slot=progress-indicator]]:bg-green-500'
                    : '[&>[data-slot=progress-indicator]]:bg-red-600'
                }`}
              />
              <div className="mt-2">
                {freeShipping ? (
                  <p className="text-green-400 text-xs font-medium flex items-center gap-1.5">
                    🎉 ¡ENVÍO GRATIS ACTIVADO!
                  </p>
                ) : (
                  <>
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1.5">
                      <Truck className="size-3.5" />
                      <motion.span
                        animate={{ opacity: [1, 0.6, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        Faltan {formatPrice(remaining)} para envío gratis
                      </motion.span>
                    </p>
                    <p className="text-neutral-500 text-[11px] mt-0.5">
                      Agrega {formatPrice(remaining)} más y recibe envío gratis
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1">
              <div className="px-5 py-3 flex flex-col">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => {
                    const primaryImage = item.product.images?.find(
                      (img) => img.isPrimary
                    );
                    const imageUrl = primaryImage?.url || item.product.images?.[0]?.url;
                    const lineTotal = item.product.price * item.quantity;
                    const isLast = index === items.length - 1;

                    return (
                      <motion.div
                        key={item.variant.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className={`flex gap-3 bg-[#111] rounded-lg p-3 card-shine ${
                          isLast ? '' : 'border-b border-[#1a1a1a] pb-4 mb-4'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-24 sm:w-22 sm:h-26 rounded bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">
                              IMG
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="text-white text-sm font-medium truncate leading-tight">
                              {item.product.title}
                            </p>
                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-neutral-500 bg-[#1a1a1a] px-1.5 py-0.5">
                              {item.variant.size} / {item.variant.color}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.variant.id, item.quantity - 1)
                                }
                                className="w-6 h-6 rounded bg-[#1a1a1a] hover:bg-[#262626] flex items-center justify-center text-neutral-400 hover:text-white transition-colors btn-press"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="w-7 text-center text-sm text-white font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.variant.id, item.quantity + 1)
                                }
                                className="w-6 h-6 rounded bg-[#1a1a1a] hover:bg-[#262626] flex items-center justify-center text-neutral-400 hover:text-white transition-colors btn-press"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm font-semibold">
                                {formatPrice(lineTotal)}
                              </span>
                              <button
                                onClick={() => removeItem(item.variant.id)}
                                className="text-neutral-500 hover:text-red-500 transition-colors p-0.5 btn-press"
                                aria-label="Eliminar producto"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Upsell Banner */}
              <AnimatePresence>
                {!isUpsellActive && subtotal >= FREE_SHIPPING_THRESHOLD && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-5 mb-3 overflow-hidden"
                  >
                    <div className="border-2 border-dashed border-red-600/50 bg-red-600/5 rounded-lg p-3 flex items-center gap-3 skeleton-shine">
                      <Package className="size-5 text-red-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-xs font-semibold leading-tight">
                          Lleva un Puffer Bag Urban por solo{' '}
                          <span className="text-red-500">{formatPrice(UPSELL_PRICE)}</span>{' '}
                          adicionales
                        </p>
                        <p className="text-neutral-500 text-[11px] mt-0.5">
                          Oferta exclusiva con tu compra
                        </p>
                      </div>
                      <Button
                        onClick={toggleUpsell}
                        className="bg-red-600 hover:bg-red-700 text-white uppercase text-[10px] tracking-wider font-bold px-3 h-7 rounded-none flex-shrink-0 btn-press"
                      >
                        AGREGAR
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>

            {/* Summary */}
            <div className="border-t border-[#262626] px-5 py-4 flex-shrink-0 bg-[#0a0a0a] shadow-[0_-4px_12px_rgba(0,0,0,0.4)]">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white font-medium">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Envío</span>
                  <span className={`font-medium ${freeShipping ? 'text-green-500' : 'text-white'}`}>
                    {freeShipping ? 'GRATIS' : formatPrice(shippingCost)}
                  </span>
                </div>
                {isUpsellActive && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Puffer Bag Urban</span>
                    <span className="text-red-400 font-medium">
                      +{formatPrice(UPSELL_PRICE)}
                    </span>
                  </div>
                )}
                <div className="border-t border-[#262626] pt-2 flex items-center justify-between">
                  <span className="text-white text-base font-bold uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-white text-lg font-bold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full bg-red-600 hover:bg-red-700 text-white uppercase text-sm font-black tracking-widest h-12 rounded-none gap-2 btn-press"
              >
                IR A PAGAR
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}