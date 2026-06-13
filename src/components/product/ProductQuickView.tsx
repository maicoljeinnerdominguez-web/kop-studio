'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { ShoppingBag, Heart, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { useCartStore } from '@/stores/useCartStore'
import { useNavigationStore } from '@/stores/useNavigationStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import type { Product, ProductVariant } from '@/types'

function getProductRating(productId: string): { rating: number; count: number } {
  let hash = 0
  for (let i = 0; i < productId.length; i++) {
    hash = ((hash << 5) - hash) + productId.charCodeAt(i)
    hash |= 0
  }
  const absHash = Math.abs(hash)
  const rating = 4 + (absHash % 10) / 10
  const count = 5 + (absHash % 25)
  return { rating: Math.round(rating * 10) / 10, count }
}

interface ProductQuickViewProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const navigate = useNavigationStore((s) => s.navigate)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [flashSize, setFlashSize] = useState<string | null>(null)
  const [imageHovered, setImageHovered] = useState(false)
  const sizeFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset state when product changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedSize(null)
      setFlashSize(null)
      setImageHovered(false)
    }
    onOpenChange(newOpen)
  }

  // Cleanup flash timer
  useEffect(() => {
    return () => {
      if (sizeFlashTimer.current) clearTimeout(sizeFlashTimer.current)
    }
  }, [])

  if (!product) return null

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0]
  const secondaryImage = product.images.find((img) => !img.isPrimary) || product.images[1]
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

  // Stock info
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0)
  const stockLabel = totalStock === 0
    ? 'Agotado'
    : totalStock < 5
      ? 'Últimas unidades'
      : 'En stock'
  const stockColor = totalStock === 0
    ? 'text-red-500'
    : totalStock < 5
      ? 'text-yellow-500'
      : 'text-green-500'
  const stockDot = totalStock === 0
    ? 'bg-red-500'
    : totalStock < 5
      ? 'bg-yellow-500'
      : 'bg-green-500'

  // Wishlist state
  const wishlisted = isInWishlist(product.id)

  // Rating
  const { rating: productRating, count: reviewCount } = getProductRating(product.id)

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    // Green flash effect
    setFlashSize(size)
    if (sizeFlashTimer.current) clearTimeout(sizeFlashTimer.current)
    sizeFlashTimer.current = setTimeout(() => setFlashSize(null), 400)
  }

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

  const handleToggleWishlist = () => {
    toggleWishlist(product.id)
    toast.success(wishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos')
  }

  const formatPrice = (price: number) =>
    `$${price.toLocaleString('es-CO')}`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-3xl rounded-none p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          {/* Image */}
          <div
            className="aspect-square bg-[#111] relative"
            onMouseEnter={() => setImageHovered(true)}
            onMouseLeave={() => setImageHovered(false)}
          >
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.altText}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imageHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="size-10 text-[#333]" />
              </div>
            )}
            {secondaryImage && (
              <img
                src={secondaryImage.url}
                alt={secondaryImage.altText}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  imageHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />
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

            {/* Star Rating */}
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <= Math.round(productRating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-neutral-700 fill-neutral-700'
                  }
                />
              ))}
              <span className="text-[11px] text-neutral-500 ml-1">
                {productRating} ({reviewCount})
              </span>
            </div>

            {/* Stock Indicator */}
            <div className="flex items-center gap-1.5 mt-3">
              <span className={`w-2 h-2 rounded-full ${stockDot} ${totalStock > 0 && totalStock < 5 ? 'animate-pulse' : ''}`} />
              <span className={`text-xs font-medium ${stockColor}`}>{stockLabel}</span>
            </div>

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
                  const isFlashing = flashSize === variant.size
                  return (
                    <button
                      key={variant.size}
                      onClick={() => inStock && handleSizeSelect(variant.size)}
                      disabled={!inStock}
                      className={`min-w-[3rem] h-10 px-3 text-xs font-medium uppercase tracking-wider border-2 transition-all duration-300 ${
                        isFlashing
                          ? 'bg-green-500/30 text-green-300 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                          : isSelected
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

            {/* Action buttons */}
            <div className="mt-6 flex-1 flex flex-col justify-end">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize || totalStock === 0}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest h-12 rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="size-4 mr-2" />
                Añadir al Carrito
              </Button>
              {!selectedSize && totalStock > 0 && (
                <p className="text-[11px] text-neutral-500 mt-2 text-center">
                  Selecciona una talla
                </p>
              )}

              {/* Wishlist button */}
              <button
                onClick={handleToggleWishlist}
                className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider py-2.5 border border-[#1a1a1a] hover:border-red-600/50 transition-all duration-200 rounded-none"
              >
                <Heart
                  size={14}
                  className={wishlisted ? 'text-red-500 fill-red-500' : 'text-neutral-400'}
                />
                <span className={wishlisted ? 'text-red-500' : 'text-neutral-400'}>
                  {wishlisted ? 'En tus favoritos' : 'Agregar a favoritos'}
                </span>
              </button>

              {/* View full product link */}
              <button
                onClick={() => {
                  handleOpenChange(false)
                  navigate('product', { slug: product.slug })
                }}
                className="mt-3 text-center text-xs font-medium text-neutral-400 hover:text-white transition-colors group/link flex items-center justify-center gap-1"
              >
                <span className="underline underline-offset-4 decoration-neutral-600 group-hover/link:decoration-white transition-colors">
                  Ver producto completo
                </span>
                <ArrowRight size={12} className="transition-transform group-hover/link:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}