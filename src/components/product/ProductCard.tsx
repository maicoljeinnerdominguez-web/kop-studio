'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { useCartStore } from '@/stores/useCartStore'
import { useNavigationStore } from '@/stores/useNavigationStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import ProductQuickView from '@/components/product/ProductQuickView'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const navigate = useNavigationStore((s) => s.navigate)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)
  const wishlisted = isInWishlist(product.id)
  const [imageError, setImageError] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  // Auto-reset "added" state after 1.5 seconds
  useEffect(() => {
    if (addedToCart) {
      const timer = setTimeout(() => setAddedToCart(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [addedToCart])

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0]
  const secondaryImage = product.images.find((img) => !img.isPrimary) || product.images[1]

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0

  const savingsAmount = hasDiscount
    ? product.compareAtPrice! - product.price
    : 0

  const formatPrice = (price: number) =>
    `$${price.toLocaleString('es-CO')}`

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    const availableVariant = product.variants.find((v) => v.stockQuantity > 0)
    if (availableVariant) {
      addItem(product, availableVariant)
      toast.success('Producto añadido al carrito')
      setAddedToCart(true)
      openCart()
    }
  }

  const handleClick = () => {
    navigate('product', { slug: product.slug })
  }

  return (
    <motion.div
      className="product-card group cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
    >
      <div className={`relative overflow-hidden rounded-md bg-[#0a0a0a] border transition-all duration-300 hover:shadow-lg hover:shadow-red-600/5 ${wishlisted ? 'border-red-600/40' : 'border-[#1a1a1a] hover:border-red-600/30'}`}>
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#111] shine-effect">
          {!imageError && primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText}
              className="product-card-image product-card-image-primary absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-0 transition-opacity duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
              <ShoppingBag className="size-8 text-[#333]" />
            </div>
          )}

          {!imageError && secondaryImage && (
            <img
              src={secondaryImage.url}
              alt={secondaryImage.altText}
              className="product-card-image product-card-image-secondary absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              onError={() => setImageError(true)}
            />
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
              {discountPercent}% OFF
            </div>
          )}

          {/* New badge — below discount badge if both exist */}
          {product.isNew && (
            <div
              className={`absolute z-10 bg-white text-black text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest ${
                hasDiscount ? 'top-10 right-2' : 'top-2 right-2'
              }`}
            >
              NUEVO
            </div>
          )}

          {/* Action icons — heart + quick view */}
          <div className={`absolute z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            product.isNew && !hasDiscount ? 'top-10 right-2' : 'top-2 right-2'
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setQuickViewOpen(true)
              }}
              className="w-8 h-8 flex items-center justify-center bg-black/40 rounded-sm hover:bg-black/60 transition-colors"
              aria-label="Vista rápida"
            >
              <Eye size={14} className="text-white/70" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleWishlist(product.id)
              }}
              className="w-8 h-8 flex items-center justify-center bg-black/40 rounded-sm hover:bg-black/60 transition-colors"
              aria-label="Agregar a favoritos"
            >
              <Heart
                size={14}
                className={wishlisted ? 'text-red-500' : 'text-white/70'}
                fill={wishlisted ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Quick add button with slide-up effect */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleQuickAdd}
              className={`w-full text-xs font-bold uppercase tracking-wider py-2.5 rounded-sm transition-all duration-200 scale-105 hover:scale-100 ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-black hover:bg-red-600 hover:text-white'
              }`}
            >
              {addedToCart ? '✓ AÑADIDO' : 'AÑADIR'}
            </button>
          </div>
        </div>

        {/* Product info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-white truncate leading-tight">
            {product.title}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {product.category?.name || ''}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-base font-bold text-white">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-500 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          {hasDiscount && savingsAmount > 0 && (
            <p className="text-red-500/80 text-[10px] font-bold mt-0.5">
              AHORRAS {formatPrice(savingsAmount)}
            </p>
          )}
        </div>
      </div>
      <ProductQuickView product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </motion.div>
  )
}