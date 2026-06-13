'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, Check, ShoppingBag, Star } from 'lucide-react'
import { useNavigationStore } from '@/stores/useNavigationStore'
import { useCompareStore } from '@/stores/useCompareStore'
import { useCartStore } from '@/stores/useCartStore'
import { toast } from 'sonner'
import type { Product } from '@/types'

function ComparisonRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid border-b border-[#1a1a1a]">
      <div className="p-3 sm:p-4 text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-bold bg-[#050505] border-r border-[#1a1a1a]">
        {label}
      </div>
      {children}
    </div>
  )
}

function ComparisonCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3 sm:p-4 text-xs sm:text-sm text-white border-r border-[#1a1a1a] last:border-r-0 flex items-center justify-center text-center min-h-[56px]">
      {children}
    </div>
  )
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)
}

function StockBadge({ variants }: { variants: Product['variants'] }) {
  const totalStock = variants.reduce((acc, v) => acc + v.stockQuantity, 0)
  if (totalStock === 0) return <span className="text-red-500 font-semibold text-xs">Agotado</span>
  if (totalStock <= 5) return <span className="text-yellow-500 font-semibold text-xs">Últimas unidades</span>
  return <span className="text-green-500 font-semibold text-xs">En stock</span>
}

function StarRating() {
  return (
    <div className="flex items-center gap-0.5 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="size-3.5"
          fill={i < 4 ? '#dc2626' : 'none'}
          stroke={i < 4 ? '#dc2626' : '#404040'}
        />
      ))}
    </div>
  )
}

export default function ProductComparisonView() {
  const navigate = useNavigationStore((s) => s.navigate)
  const productIds = useCompareStore((s) => s.productIds)
  const removeProduct = useCompareStore((s) => s.removeProduct)
  const clearComparison = useCompareStore((s) => s.clearComparison)
  const addToCart = useCartStore((s) => s.addItem)

  const [products, setProducts] = useState<(Product & { loading?: boolean })[]>([])
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    if (productIds.length === 0) {
      navigate('home')
      return
    }

    const initial = productIds.map((id) => ({ id } as unknown as Product & { loading?: boolean }))
    const fetches = productIds.map(async (id) => {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (res.ok) {
          const data: Product = await res.json()
          return { id, data }
        }
      } catch {
        // silently fail
      }
      return { id, data: null }
    })

    Promise.all(fetches).then((results) => {
      setProducts(
        initial.map((p) => {
          const result = results.find((r) => r.id === p.id)
          return result?.data ? { ...result.data, loading: false } : p
        })
      )
    })
  }, [productIds, navigate])

  const colCount = products.length

  const handleAddToCart = (product: Product) => {
    const firstVariant = product.variants[0]
    if (!firstVariant) return
    addToCart(product, firstVariant, 1)
    setAddedId(product.id)
    toast.success(`${product.title} agregado al carrito`)
    setTimeout(() => setAddedId(null), 2000)
  }

  const handleRemove = (id: string) => {
    removeProduct(id)
    if (productIds.length <= 2) {
      navigate('home')
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('home')}
              className="w-10 h-10 border border-[#1a1a1a] hover:border-white flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <h1 className="text-white text-xl sm:text-2xl font-bold tracking-wider uppercase">
                COMPARAR PRODUCTOS
              </h1>
              <p className="text-neutral-500 text-xs mt-1">
                {products.length} producto{products.length !== 1 ? 's' : ''} seleccionado{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => { clearComparison(); navigate('home') }}
            className="text-xs text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-wider font-medium"
          >
            LIMPIAR TODO
          </button>
        </div>

        <div className="w-16 h-0.5 bg-red-600 mb-8" />

        {/* Comparison Table */}
        <div className="border border-[#1a1a1a] rounded-lg overflow-x-auto">
          <div
            className="min-w-[400px]"
            style={{
              display: 'grid',
              gridTemplateColumns: `160px repeat(${colCount}, minmax(200px, 1fr))`,
            }}
          >
            {/* Header Row - Product Image + Name + Remove */}
            <div className="p-3 sm:p-4 bg-[#050505] border-b border-[#1a1a1a] border-r border-[#1a1a1a] flex items-start" />

            {products.map((product) => (
              <div
                key={product.id}
                className="p-3 sm:p-4 bg-[#050505] border-b border-[#1a1a1a] border-r border-[#1a1a1a] last:border-r-0 relative"
              >
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-[#1a1a1a] hover:bg-red-600 flex items-center justify-center transition-colors rounded-sm"
                  aria-label="Quitar de comparación"
                >
                  <X className="size-3" />
                </button>

                {product.title ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-full aspect-square bg-[#111] rounded-md overflow-hidden border border-[#1a1a1a]">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].altText}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="size-6 text-[#333]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-white text-center leading-tight">
                      {product.title}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-full aspect-square bg-[#111] rounded-md animate-pulse" />
                    <div className="h-4 w-24 bg-[#1a1a1a] rounded animate-pulse" />
                  </div>
                )}
              </div>
            ))}

            {/* Price Row */}
            <ComparisonRow label="Precio">
              {products.map((product) => (
                <ComparisonCell key={product.id}>
                  {product.price ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-white font-bold text-sm sm:text-base">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-neutral-500 line-through text-[10px] sm:text-xs">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-5 w-20 bg-[#1a1a1a] rounded animate-pulse" />
                  )}
                </ComparisonCell>
              ))}
            </ComparisonRow>

            {/* Category Row */}
            <ComparisonRow label="Categoría">
              {products.map((product) => (
                <ComparisonCell key={product.id}>
                  {product.category ? (
                    <span className="text-neutral-300 text-xs uppercase tracking-wider">
                      {product.category.name}
                    </span>
                  ) : (
                    <div className="h-4 w-16 bg-[#1a1a1a] rounded animate-pulse" />
                  )}
                </ComparisonCell>
              ))}
            </ComparisonRow>

            {/* Sizes Row */}
            <ComparisonRow label="Tallas">
              {products.map((product) => (
                <ComparisonCell key={product.id}>
                  {product.variants && product.variants.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {product.variants.map((v) => (
                        <span
                          key={v.id}
                          className={`text-[10px] px-1.5 py-0.5 border rounded-sm ${
                            v.stockQuantity > 0
                              ? 'border-[#333] text-neutral-300'
                              : 'border-[#222] text-neutral-600 line-through'
                          }`}
                        >
                          {v.size}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="h-4 w-20 bg-[#1a1a1a] rounded animate-pulse" />
                  )}
                </ComparisonCell>
              ))}
            </ComparisonRow>

            {/* Stock Row */}
            <ComparisonRow label="Stock">
              {products.map((product) => (
                <ComparisonCell key={product.id}>
                  {product.variants ? (
                    <StockBadge variants={product.variants} />
                  ) : (
                    <div className="h-4 w-16 bg-[#1a1a1a] rounded animate-pulse" />
                  )}
                </ComparisonCell>
              ))}
            </ComparisonRow>

            {/* Rating Row */}
            <ComparisonRow label="Valoración">
              {products.map((product) => (
                <ComparisonCell key={product.id}>
                  {product.title ? (
                    <div className="flex flex-col items-center gap-1">
                      <StarRating />
                      <span className="text-[10px] text-neutral-500">4.0 / 5</span>
                    </div>
                  ) : (
                    <div className="h-5 w-16 bg-[#1a1a1a] rounded animate-pulse" />
                  )}
                </ComparisonCell>
              ))}
            </ComparisonRow>

            {/* Description Row */}
            <ComparisonRow label="Descripción">
              {products.map((product) => (
                <ComparisonCell key={product.id}>
                  {product.description ? (
                    <p className="text-neutral-400 text-[11px] sm:text-xs leading-relaxed text-left">
                      {product.description.length > 120
                        ? product.description.slice(0, 120) + '...'
                        : product.description}
                    </p>
                  ) : (
                    <div className="space-y-1.5 w-full">
                      <div className="h-3 w-full bg-[#1a1a1a] rounded animate-pulse" />
                      <div className="h-3 w-3/4 bg-[#1a1a1a] rounded animate-pulse" />
                    </div>
                  )}
                </ComparisonCell>
              ))}
            </ComparisonRow>

            {/* Action Row */}
            <ComparisonRow label="">
              {products.map((product) => (
                <ComparisonCell key={product.id}>
                  {product.title && product.variants && product.variants.length > 0 ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.variants.every((v) => v.stockQuantity === 0)}
                      className={`w-full py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-sm transition-colors duration-200 ${
                        addedId === product.id
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {addedId === product.id ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Check className="size-3.5" />
                          AÑADIDO
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <ShoppingBag className="size-3.5" />
                          AGREGAR AL CARRITO
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="h-10 w-full bg-[#1a1a1a] rounded animate-pulse" />
                  )}
                </ComparisonCell>
              ))}
            </ComparisonRow>
          </div>
        </div>

        {/* Back to Store */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('home')}
            className="text-xs text-neutral-400 hover:text-white transition-colors uppercase tracking-wider font-medium underline underline-offset-4 decoration-neutral-600 hover:decoration-white"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  )
}