'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { useCartStore } from '@/stores/useCartStore'
import { useNavigationStore } from '@/stores/useNavigationStore'
import type { Product, ProductVariant } from '@/types'

interface ProductQuickViewProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const navigate = useNavigationStore((s) => s.navigate)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  // Reset state when product changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setSelectedSize(null)
    onOpenChange(newOpen)
  }

  if (!product) return null

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0]
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0

  // Get unique sizes
  const seen = new Set<string>()
  const sizes = product.variants.filter((v) => {
    if (seen.has(v.size)) return false
    seen.add(v.size)
    return true
  })

  const handleAddToCart = () => {
    if (!selectedSize) return
    const variant = product.variants.find(
      (v) => v.size === selectedSize && v.stockQuantity > 0
    )
    if (!variant) return
    addItem(product, variant)
    toast.success('Producto añadido al carrito')
    openCart()
    handleOpenChange(false)
  }

  const formatPrice = (price: number) =>
    `$${price.toLocaleString('es-CO')}`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-3xl rounded-none p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          {/* Image */}
          <div className="aspect-square bg-[#111] relative">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.altText}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="size-10 text-[#333]" />
              </div>
            )}
            {product.isNew && (
              <div className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                NUEVO
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                {discountPercent}% OFF
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col">
            <h2 className="text-lg font-bold text-white leading-tight">
              {product.title}
            </h2>
            {product.category && (
              <p className="text-xs text-neutral-500 mt-1">
                {product.category.name}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-xl font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-neutral-500 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {/* Size selector */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3">
                Talla
              </h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((variant) => {
                  const inStock = variant.stockQuantity > 0
                  const isSelected = selectedSize === variant.size
                  return (
                    <button
                      key={variant.size}
                      onClick={() => inStock && setSelectedSize(variant.size)}
                      disabled={!inStock}
                      className={`min-w-[3rem] h-10 px-3 text-xs font-medium uppercase tracking-wider border-2 transition-all ${
                        isSelected
                          ? 'bg-white text-black border-white'
                          : inStock
                            ? 'bg-transparent text-white border-[#404040] hover:border-white'
                            : 'bg-transparent text-[#333] border-[#1a1a1a] cursor-not-allowed'
                      }`}
                    >
                      {variant.size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Add to cart */}
            <div className="mt-6 flex-1 flex flex-col justify-end">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest h-12 rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="size-4 mr-2" />
                Añadir al Carrito
              </Button>
              {!selectedSize && (
                <p className="text-[11px] text-neutral-500 mt-2 text-center">
                  Selecciona una talla
                </p>
              )}

              {/* View full product link */}
              <button
                onClick={() => {
                  handleOpenChange(false)
                  navigate('product', { slug: product.slug })
                }}
                className="mt-3 text-center text-xs text-neutral-400 hover:text-white transition-colors underline underline-offset-4"
              >
                Ver producto completo
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}