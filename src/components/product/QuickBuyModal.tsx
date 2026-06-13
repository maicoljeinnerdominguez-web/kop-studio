'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCartStore } from '@/stores/useCartStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import type { Product, ProductVariant } from '@/types';

interface QuickBuyModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickBuyModal({ product, open, onOpenChange }: QuickBuyModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigationStore((s) => s.navigate);

  const availableVariants = useMemo(
    () => product?.variants.filter((v) => v.stockQuantity > 0) || [],
    [product]
  );

  const uniqueSizes = useMemo(() => {
    const sizes = [...new Set(availableVariants.map((v) => v.size))];
    return sizes;
  }, [availableVariants]);

  const uniqueColors = useMemo(() => {
    const colors = [...new Set(availableVariants.map((v) => v.color))];
    return colors;
  }, [availableVariants]);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    // If only one variant, auto-select it
    if (product.variants.length === 1) return product.variants[0];
    // If only one available variant, auto-select it
    if (availableVariants.length === 1) return availableVariants[0];
    // Otherwise, find by selected size and color
    return availableVariants.find(
      (v) =>
        (selectedSize ? v.size === selectedSize : true) &&
        (selectedColor ? v.color === selectedColor : true)
    ) || null;
  }, [product, availableVariants, selectedSize, selectedColor]);

  const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')}`;

  const hasOnlyOneVariant = product ? product.variants.length === 1 : false;

  const handleBuyNow = async () => {
    if (!product || !selectedVariant) return;
    setIsProcessing(true);

    // Simulate brief delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    addItem(product, selectedVariant);
    toast.success('Producto añadido — redirigiendo al checkout...');
    setIsProcessing(false);
    onOpenChange(false);

    // Reset selections
    setSelectedSize('');
    setSelectedColor('');

    navigate('checkout');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedSize('');
      setSelectedColor('');
      setIsProcessing(false);
    }
    onOpenChange(open);
  };

  // Auto-buy for single variant products
  const effectiveOpen = open;

  if (!product) return null;

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Dialog open={effectiveOpen} onOpenChange={handleClose}>
      <DialogContent
        className="bg-[#0a0a0a] border border-[#262626] rounded-md max-w-md w-[95vw] p-0 overflow-hidden"
      >
        <DialogDescription className="sr-only">
          Compra rápida de {product.title}
        </DialogDescription>

        {/* Header with product image */}
        <div className="relative">
          <DialogHeader className="sr-only">
            <DialogTitle>Comprar ahora</DialogTitle>
          </DialogHeader>

          {/* Close button */}
          <button
            onClick={() => handleClose(false)}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 border border-[#333] hover:border-white/30 text-white/70 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>

          {/* Product image */}
          <div className="relative h-48 bg-[#111] overflow-hidden">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.altText}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="size-8 text-[#333]" />
              </div>
            )}

            {/* Price overlay */}
            <div className="absolute bottom-3 left-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-xl">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-neutral-400 text-sm line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Product name */}
          <div>
            <h3 className="text-white font-bold text-base uppercase tracking-wider">
              {product.title}
            </h3>
            <p className="text-neutral-500 text-xs mt-1">
              {product.category?.name || ''}
            </p>
          </div>

          {/* Size selector (skip if only one variant) */}
          {!hasOnlyOneVariant && uniqueSizes.length > 0 && (
            <div className="space-y-2">
              <p className="text-white text-xs font-bold uppercase tracking-wider">
                Talla
              </p>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map((size) => {
                  const hasStock = availableVariants.some(
                    (v) =>
                      v.size === size &&
                      (!selectedColor || v.color === selectedColor)
                  );
                  const isSelected = selectedSize === size;
                  return (
                    <motion.button
                      key={size}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedSize(size)}
                      disabled={!hasStock}
                      className={`min-w-[44px] h-10 px-3 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                        isSelected
                          ? 'bg-red-600 border-red-600 text-white'
                          : hasStock
                          ? 'bg-[#111] border-[#333] text-neutral-300 hover:border-white/40 hover:text-white'
                          : 'bg-[#0a0a0a] border-[#1a1a1a] text-neutral-600 cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color selector (skip if only one variant) */}
          {!hasOnlyOneVariant && uniqueColors.length > 1 && (
            <div className="space-y-2">
              <p className="text-white text-xs font-bold uppercase tracking-wider">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => {
                  const hasStock = availableVariants.some(
                    (v) =>
                      v.color === color &&
                      (!selectedSize || v.size === selectedSize)
                  );
                  const isSelected = selectedColor === color;
                  return (
                    <motion.button
                      key={color}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(color)}
                      disabled={!hasStock}
                      className={`min-w-[44px] h-10 px-3 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                        isSelected
                          ? 'bg-red-600 border-red-600 text-white'
                          : hasStock
                          ? 'bg-[#111] border-[#333] text-neutral-300 hover:border-white/40 hover:text-white'
                          : 'bg-[#0a0a0a] border-[#1a1a1a] text-neutral-600 cursor-not-allowed'
                      }`}
                    >
                      {color}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected variant summary */}
          {hasOnlyOneVariant && selectedVariant && (
            <div className="flex items-center gap-2 py-2 px-3 bg-[#111] rounded-sm border border-[#1a1a1a]">
              <span className="text-neutral-400 text-xs uppercase tracking-wider">Talla:</span>
              <span className="text-white text-xs font-bold uppercase">{selectedVariant.size}</span>
              {selectedVariant.color && (
                <>
                  <span className="text-neutral-600">·</span>
                  <span className="text-neutral-400 text-xs uppercase tracking-wider">Color:</span>
                  <span className="text-white text-xs font-bold uppercase">{selectedVariant.color}</span>
                </>
              )}
            </div>
          )}

          {/* Buy now button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleBuyNow}
            disabled={!selectedVariant || isProcessing}
            className={`w-full py-3.5 rounded-sm text-sm font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
              selectedVariant && !isProcessing
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#333] text-neutral-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <ShoppingBag className="size-4" />
                Comprar ahora — {formatPrice(product.price)}
              </>
            )}
          </motion.button>

          {!selectedVariant && !hasOnlyOneVariant && (
            <p className="text-red-400 text-xs text-center">
              Selecciona una talla para continuar
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
