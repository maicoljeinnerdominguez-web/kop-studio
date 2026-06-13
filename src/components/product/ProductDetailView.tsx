'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Check,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useNavigationStore } from '@/stores/useNavigationStore'
import { useCartStore } from '@/stores/useCartStore'
import ProductCard from '@/components/product/ProductCard'
import type { Product, ProductVariant } from '@/types'

function ProductDetailInner({ slug }: { slug: string }) {
  const navigate = useNavigationStore((s) => s.navigate)
  const goBack = useNavigationStore((s) => s.goBack)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p.slug === slug) || null
        setProduct(found)
        if (found) {
          const related = data
            .filter((p) => p.categoryId === found.categoryId && p.id !== found.id)
            .slice(0, 4)
          setRelatedProducts(related)
        } else {
          setRelatedProducts([])
        }
      })
      .catch(() => {
        setProduct(null)
        setRelatedProducts([])
      })
      .finally(() => setLoading(false))
  }, [slug])

  const formatPrice = (price: number) =>
    `$${price.toLocaleString('es-CO')}`

  const hasDiscount = product?.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product!.compareAtPrice! - product!.price) / product!.compareAtPrice!) * 100)
    : 0

  const availableSizes = useMemo(() => {
    if (!product) return []
    const seen = new Set<string>()
    return product.variants.filter((v) => {
      if (seen.has(v.size)) return false
      seen.add(v.size)
      return true
    })
  }, [product])

  const availableColors = useMemo(() => {
    if (!product) return []
    const seen = new Set<string>()
    return product.variants.filter((v) => {
      if (seen.has(v.color)) return false
      seen.add(v.color)
      return true
    })
  }, [product])

  const isOutOfStock = product
    ? product.variants.every((v) => v.stockQuantity === 0)
    : false

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return
    addItem(product, selectedVariant)
    toast.success('Producto añadido al carrito')
    openCart()
  }

  if (loading) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <Skeleton className="aspect-square w-full bg-[#111] rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 bg-[#111]" />
            <Skeleton className="h-6 w-1/4 bg-[#111]" />
            <Skeleton className="h-24 w-full bg-[#111] rounded-md" />
            <Skeleton className="h-12 w-full bg-[#111] rounded-md" />
            <Skeleton className="h-12 w-full bg-[#111] rounded-md" />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-gray-400 text-lg mb-4">Producto no encontrado</p>
        <Button
          variant="outline"
          onClick={goBack}
          className="border-[#404040] text-white hover:border-white rounded-none bg-transparent"
        >
          Volver
        </Button>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer text-gray-500 hover:text-white"
                  onClick={() => navigate('home')}
                >
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-600" />
              {product.category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className="cursor-pointer text-gray-500 hover:text-white"
                      onClick={() =>
                        navigate('collection', { category: product.category!.slug })
                      }
                    >
                      {product.category.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-gray-600" />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-medium truncate max-w-[200px] sm:max-w-none">
                  {product.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm"
        >
          <ChevronLeft className="size-4" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-md bg-[#111] mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIndex}
                  src={product.images[selectedImageIndex]?.url}
                  alt={product.images[selectedImageIndex]?.altText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isNew && (
                  <Badge className="bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-none px-2.5 py-1 hover:bg-gray-200">
                    Nuevo
                  </Badge>
                )}
                {product.isBestseller && (
                  <Badge className="bg-[#dc2626] text-white text-[10px] font-bold uppercase tracking-wider rounded-none px-2.5 py-1">
                    Best Seller
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((image, i) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === i
                        ? 'border-white'
                        : 'border-[#333] hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <span className="text-xl font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-gray-500 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                  <span className="text-sm font-bold text-[#dc2626]">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Icons row */}
            <div className="flex items-center gap-4 mt-6">
              <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                <Heart className="size-5" />
                <span className="text-xs">Favorito</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                <Share2 className="size-5" />
                <span className="text-xs">Compartir</span>
              </button>
            </div>

            {/* Size selector */}
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                Talla
                {selectedVariant && (
                  <span className="text-gray-500 font-normal normal-case tracking-normal ml-2">
                    — {selectedVariant.size}
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((variant) => {
                  const inStock = variant.stockQuantity > 0
                  const isSelected = selectedVariant?.id === variant.id
                  return (
                    <button
                      key={variant.id}
                      onClick={() => inStock && setSelectedVariant(variant)}
                      disabled={!inStock}
                      className={`min-w-[3.5rem] h-11 px-4 text-sm font-medium uppercase tracking-wider border-2 transition-all ${
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
              {isOutOfStock && (
                <p className="text-sm text-[#dc2626] mt-3">Agotado</p>
              )}
            </div>

            {/* Colors */}
            {availableColors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3">
                  Color
                </h3>
                <div className="flex items-center gap-3">
                  {availableColors.map((variant) => (
                    <span
                      key={variant.color}
                      className="text-sm text-gray-300"
                    >
                      {variant.color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mt-8">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant || isOutOfStock}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-bold uppercase tracking-widest h-14 rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="size-5 mr-2" />
                Añadir al Carrito
              </Button>
              {!selectedVariant && !isOutOfStock && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Selecciona una talla
                </p>
              )}
            </div>

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border border-[#1a1a1a] rounded-md">
                <Truck className="size-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Envío Express</p>
                  <p className="text-[10px] text-gray-500">2-4 días hábiles</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-[#1a1a1a] rounded-md">
                <RotateCcw className="size-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Devoluciones</p>
                  <p className="text-[10px] text-gray-500">30 días para cambios</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-[#1a1a1a] rounded-md">
                <Shield className="size-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Compra Segura</p>
                  <p className="text-[10px] text-gray-500">Pago protegido</p>
                </div>
              </div>
            </div>

            {/* Accordion */}
            <div className="mt-8 border-t border-[#1a1a1a]">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="description" className="border-[#1a1a1a]">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-white hover:no-underline hover:text-white">
                    Descripción
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-400 leading-relaxed">
                    {product.description}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="details" className="border-[#1a1a1a]">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-white hover:no-underline hover:text-white">
                    Detalles de la prenda
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-gray-400 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#dc2626]" />
                        Algodón premium 240gsm
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#dc2626]" />
                        Corte oversize
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#dc2626]" />
                        Impresión serigrafía
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#dc2626]" />
                        Hecho en Colombia
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="care" className="border-[#1a1a1a]">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-white hover:no-underline hover:text-white">
                    Guía de lavado
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-gray-400 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#dc2626]" />
                        Lavar a mano con agua fría
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#dc2626]" />
                        No usar blanqueador
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#dc2626]" />
                        Secar a la sombra
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-[#dc2626]" />
                        Planchar a baja temperatura
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                  También te puede interesar
                </h2>
                <div className="mt-1 h-0.5 w-12 bg-[#dc2626]" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default function ProductDetailView() {
  const slug = useNavigationStore((s) => s.viewParams.slug || '')
  return <ProductDetailInner key={slug} slug={slug} />
}