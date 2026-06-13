'use client'

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
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
  Ruler,
  X,
  Copy,
  MessageCircle,
  Maximize2,
  Scale,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNavigationStore } from '@/stores/useNavigationStore'
import { useCartStore } from '@/stores/useCartStore'
import { useRecentlyViewedStore } from '@/stores/useRecentlyViewedStore'
import { useCompareStore } from '@/stores/useCompareStore'
import ProductCard from '@/components/product/ProductCard'
import ProductReviews from '@/components/product/ProductReviews'
import ProductLightbox from '@/components/product/ProductLightbox'
import SizeQuizDialog from '@/components/product/SizeQuizDialog'
import CompleteTheLook from '@/components/product/CompleteTheLook'
import type { Product, ProductVariant } from '@/types'

const SIZE_CHART = [
  { size: 'S', pecho: 48, largo: 68, hombro: 43 },
  { size: 'M', pecho: 52, largo: 71, hombro: 45 },
  { size: 'L', pecho: 56, largo: 74, hombro: 48 },
  { size: 'XL', pecho: 60, largo: 77, hombro: 50 },
  { size: 'OS', pecho: 64, largo: 80, hombro: 52 },
]

function SizeGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors ml-3">
          <Ruler className="size-3.5" />
          <span className="text-[11px] uppercase tracking-wider font-medium">Guía de tallas</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-md rounded-none p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-sm font-bold uppercase tracking-widest text-white">
            Guía de Tallas
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-xs">
            Medidas en centímetros (cm)
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 pt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                <TableHead className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold h-10 px-3">Talla</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold h-10 px-3 text-center">Pecho</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold h-10 px-3 text-center">Largo</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold h-10 px-3 text-center">Hombro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SIZE_CHART.map((row) => (
                <TableRow key={row.size} className="border-[#1a1a1a] hover:bg-white/5">
                  <TableCell className="px-3 py-3 text-sm font-bold text-white">{row.size}</TableCell>
                  <TableCell className="px-3 py-3 text-sm text-neutral-300 text-center">{row.pecho} cm</TableCell>
                  <TableCell className="px-3 py-3 text-sm text-neutral-300 text-center">{row.largo} cm</TableCell>
                  <TableCell className="px-3 py-3 text-sm text-neutral-300 text-center">{row.hombro} cm</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-[11px] text-neutral-500 mt-4 leading-relaxed">
            Las medidas pueden variar ±2cm. Para un fit oversizado, recomendamos subir una talla.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ImageZoom({
  src,
  alt,
  isSelected,
}: {
  src: string
  alt: string
  isSelected: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setZoomPosition({ x, y })
    },
    []
  )

  const handleMouseEnter = useCallback(() => setIsZoomed(true), [])
  const handleMouseLeave = useCallback(() => setIsZoomed(false), [])

  if (!isSelected) return null

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden cursor-zoom-in"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.img
        src={src}
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full object-cover transition-transform duration-200 ease-out img-blur-up"
        style={
          isZoomed
            ? {
                transform: 'scale(1.5)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }
            : {
                transform: 'scale(1)',
              }
        }
      />
    </div>
  )
}

function RecentlyViewedSection({ currentProductId }: { currentProductId: string }) {
  const recentlyViewed = useRecentlyViewedStore((s) => s.recentlyViewed)
  const navigate = useNavigationStore((s) => s.navigate)

  const filtered = recentlyViewed.filter((p) => p.id !== currentProductId)

  if (filtered.length < 2) return null

  return (
    <section className="mt-16 pb-8">
      <div className="flex items-center mb-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            Vistos Recientemente
          </h2>
          <div className="h-0.5 w-12 bg-red-600 mt-2" />
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate('product', { slug: item.slug })}
            className="shrink-0 w-24 snap-start group"
          >
            <div className="w-24 h-32 overflow-hidden rounded-sm border border-[#1a1a1a] bg-[#111] group-hover:border-[#333] transition-colors">
              {item.images[0] ? (
                <img
                  src={item.images[0].url}
                  alt={item.images[0].altText}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="size-5 text-[#333]" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 mt-2 leading-tight line-clamp-2 text-left">
              {item.title}
            </p>
            <p className="text-[11px] font-medium text-white mt-0.5 text-left">
              ${item.price.toLocaleString('es-CO')}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}

function ProductDetailInner({ slug }: { slug: string }) {
  const navigate = useNavigationStore((s) => s.navigate)
  const goBack = useNavigationStore((s) => s.goBack)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const addViewedProduct = useRecentlyViewedStore((s) => s.addViewedProduct)
  const compareIds = useCompareStore((s) => s.productIds)
  const addCompare = useCompareStore((s) => s.addProduct)
  const removeCompare = useCompareStore((s) => s.removeProduct)

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [sizeQuizOpen, setSizeQuizOpen] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p.slug === slug) || null
        setProduct(found)
        if (found) {
          addViewedProduct({
            id: found.id,
            title: found.title,
            slug: found.slug,
            price: found.price,
            images: found.images.map((img) => ({ url: img.url, altText: img.altText })),
          })
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

  const selectedVariantStock = selectedVariant?.stockQuantity ?? 0
  const isLowStock = selectedVariantStock > 0 && selectedVariantStock < 5

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return
    addItem(product, selectedVariant)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
    toast.success('Producto añadido al carrito')
    openCart()
  }

  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  // Derived effective color: auto-select if only one, or validate current selection
  const effectiveColor = useMemo(() => {
    if (availableColors.length === 1) return availableColors[0].color
    if (selectedColor && availableColors.find(c => c.color === selectedColor)) return selectedColor
    return null
  }, [availableColors, selectedColor])

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    // Re-evaluate variant when color changes
    if (selectedVariant) {
      const size = selectedVariant.size
      const newVariant = product?.variants.find(
        (v) => v.size === size && v.color === color && v.stockQuantity > 0
      )
      setSelectedVariant(newVariant || null)
    }
  }

  // Update size selection to consider color
  const handleSizeSelect = (variant: ProductVariant) => {
    if (variant.stockQuantity <= 0) return
    if (effectiveColor && variant.color !== effectiveColor) {
      // Find same size in selected color
      const colorVariant = product?.variants.find(
        (v) => v.size === variant.size && v.color === effectiveColor && v.stockQuantity > 0
      )
      setSelectedVariant(colorVariant || null)
    } else {
      setSelectedVariant(variant)
    }
  }

  const canAddToCart = selectedVariant && (!effectiveColor || (effectiveColor && selectedVariant.color === effectiveColor))

  const handleCopyLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success('¡Enlace copiado!', {
        icon: <Copy className="size-4" />,
        duration: 2000,
      })
    } catch {
      toast.error('No se pudo copiar el enlace')
    }
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Mira este producto de KOP STUDIO: ${product?.title} - ${formatPrice(product?.price || 0)}`)
    const url = encodeURIComponent(window.location.href)
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank')
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Mira este producto de KOP STUDIO: ${product?.title} - ${formatPrice(product?.price || 0)}`)
    const url = encodeURIComponent(window.location.href)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const generateSku = (title: string) => {
    const words = title.split(' ').slice(0, 2)
    const prefix = words.map((w) => w.substring(0, 3).toUpperCase()).join('-')
    const hash = title.length.toString().padStart(3, '0')
    const suffix = slug.slice(-3).toUpperCase()
    return `KOP-${prefix}-${hash}-${suffix}`
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
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 sm:mb-8 text-sm touch-target min-h-11 hover-scale"
        >
          <ChevronLeft className="size-5" />
          <span>Volver</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div>
            <div
              className="group relative aspect-square md:aspect-[4/5] overflow-hidden rounded-md bg-[#111] mb-3 cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Open image lightbox"
              onKeyDown={(e) => { if (e.key === 'Enter') setLightboxOpen(true) }}
            >
              <AnimatePresence mode="wait">
                {product.images.map((image, i) => (
                  <ImageZoom
                    key={image.id}
                    src={image.url}
                    alt={image.altText}
                    isSelected={i === selectedImageIndex}
                  />
                ))}
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
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

              {/* Expand/lightbox hint with zoom overlay */}
              <div className="absolute bottom-3 right-3 bg-black/50 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-white/10">
                <Maximize2 className="size-5 text-white" />
              </div>
              {/* Zoom cursor overlay icon — top right */}
              <div className="absolute top-3 right-3 bg-black/40 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </div>

            {/* Image counter */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-neutral-500">
                <span className="text-white font-medium">{selectedImageIndex + 1}</span>
                {' / '}
                {product.images.length}
              </p>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
                {product.images.map((image, i) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`shrink-0 w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === i
                        ? 'border-white thumbnail-progress'
                        : 'border-[#333] hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="w-full h-full object-cover img-blur-up"
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

            {/* SKU */}
            <p className="text-neutral-500 text-xs font-mono mt-2">
              SKU: {product.sku || generateSku(product.title)}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className={`text-2xl font-bold ${hasDiscount ? 'text-white price-flash' : 'text-white'}`}>
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-neutral-500 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Material tags row */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="material-tag">Algodón Premium</span>
              <span className="material-tag">240gsm</span>
              <span className="material-tag">Made in Colombia</span>
            </div>

            {/* Icons row */}
            <div className="flex items-center gap-4 mt-6">
              <button className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors">
                <Heart className="size-5" />
                <span className="text-xs">Favorito</span>
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors">
                    <Share2 className="size-5" />
                    <span className="text-xs">Compartir</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="bg-[#111] border-[#333] text-white p-2 rounded-none w-52">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors rounded-sm"
                  >
                    <Copy className="size-4" />
                    Copiar enlace
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors rounded-sm"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors rounded-sm"
                  >
                    <Share2 className="size-4" />
                    Twitter/X
                  </button>
                </PopoverContent>
              </Popover>
            </div>

            {/* Size selector */}
            <div className="mt-8">
              <div className="flex items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                  Talla
                  {selectedVariant && (
                    <span className="text-neutral-500 font-normal normal-case tracking-normal ml-2">
                      — {selectedVariant.size}
                    </span>
                  )}
                </h3>
                <div className="flex items-center ml-auto">
                  <button
                    onClick={() => setSizeQuizOpen(true)}
                    className="text-[11px] text-neutral-500 mr-1 hover:text-red-500 transition-colors underline underline-offset-2 decoration-neutral-600 hover:decoration-red-500"
                  >
                    ¿No sabes tu talla?
                  </button>
                  <SizeGuideDialog />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {availableSizes.map((variant) => {
                  const inStock = variant.stockQuantity > 0
                  const isSelected = selectedVariant?.id === variant.id
                  return (
                    <motion.button
                      key={variant.id}
                      whileTap={inStock ? { scale: 0.9 } : undefined}
                      onClick={() => inStock && handleSizeSelect(variant)}
                      disabled={!inStock}
                      className={`min-w-[3.5rem] h-11 px-4 text-sm font-medium uppercase tracking-wider border-2 transition-all duration-200 ${
                        isSelected
                          ? 'bg-white text-black border-white'
                          : inStock
                            ? 'bg-transparent text-white border-[#404040] hover:border-white'
                            : 'bg-transparent text-[#333] border-[#1a1a1a] cursor-not-allowed'
                      }`}
                    >
                      {variant.size}
                    </motion.button>
                  )
                })}
              </div>
              {isOutOfStock && (
                <p className="text-sm text-red-600 mt-3">Agotado</p>
              )}
            </div>

            {/* Colors */}
            {availableColors.length > 1 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3">
                  Color
                  {effectiveColor && (
                    <span className="text-neutral-500 font-normal normal-case tracking-normal ml-2">
                      — {effectiveColor}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((variant) => {
                    const isSelected = effectiveColor === variant.color
                    return (
                      <motion.button
                        key={variant.color}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleColorSelect(variant.color)}
                        className="flex items-center gap-2 h-9 px-3 text-xs font-medium uppercase tracking-wider transition-all duration-200"
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-neutral-800 border-2 transition-all duration-200 ${
                            isSelected ? 'border-red-600 ring-2 ring-red-600/30' : 'border-[#404040] hover:border-white'
                          }`}
                        />
                        <span className={`transition-colors ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                          {variant.color}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mt-8">
              {/* Stock indicator */}
              {selectedVariant && !isOutOfStock && (
                <div className="flex items-center gap-2 mb-3">
                  {isLowStock ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-xs text-yellow-500 font-medium">Últimas unidades</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-green-500 font-medium">En stock</span>
                    </>
                  )}
                </div>
              )}

              <motion.div
                animate={
                  selectedVariant && !isOutOfStock && !addedToCart
                    ? { scale: [1, 1.015, 1] }
                    : { scale: 1 }
                }
                transition={
                  selectedVariant && !isOutOfStock && !addedToCart
                    ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                    : {}
                }
              >
                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || isOutOfStock}
                  className={`w-full text-white text-sm font-bold uppercase tracking-widest h-14 rounded-none disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 relative z-0 ${
                    addedToCart
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'btn-gradient-sweep'
                  }`}
                >
                  {addedToCart ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="size-5" />
                      AÑADIDO
                    </motion.span>
                  ) : (
                    <>
                      <ShoppingBag className="size-5 mr-2" />
                      AGREGAR AL CARRITO
                    </>
                  )}
                </Button>
              </motion.div>

              {!canAddToCart && !isOutOfStock && (
                <p className="text-xs text-neutral-500 mt-2 text-center">
                  {availableColors.length > 1 && !effectiveColor
                    ? 'Selecciona un color y una talla'
                    : 'Selecciona una talla'
                  }
                </p>
              )}

              {/* Compare Button */}
              {product && (
                <button
                  onClick={() => {
                    const isAdded = compareIds.includes(product.id)
                    if (isAdded) {
                      removeCompare(product.id)
                      toast.info('Producto eliminado de la comparación')
                    } else {
                      if (compareIds.length >= 3) {
                        toast.error('Máximo 3 productos para comparar')
                        return
                      }
                      addCompare(product.id)
                      toast.success('Producto agregado a la comparación')
                    }
                  }}
                  className={`w-full mt-3 text-[11px] font-bold uppercase tracking-widest h-11 rounded-none border transition-colors duration-200 flex items-center justify-center gap-2 ${
                    compareIds.includes(product.id)
                      ? 'bg-red-600/10 border-red-600 text-red-500'
                      : 'bg-transparent border-[#333] text-neutral-300 hover:border-white hover:text-white'
                  }`}
                >
                  <Scale className="size-4" />
                  {compareIds.includes(product.id) ? 'EN COMPARACIÓN' : 'COMPARAR'}
                </button>
              )}
            </div>

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border border-[#1a1a1a] rounded-md">
                <Truck className="size-5 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Envío Express</p>
                  <p className="text-[10px] text-neutral-500">2-4 días hábiles</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-[#1a1a1a] rounded-md">
                <RotateCcw className="size-5 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Devoluciones</p>
                  <p className="text-[10px] text-neutral-500">30 días para cambios</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-[#1a1a1a] rounded-md">
                <Shield className="size-5 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Compra Segura</p>
                  <p className="text-[10px] text-neutral-500">Pago protegido</p>
                </div>
              </div>
            </div>

            {/* Accordion */}
            <div className="mt-8 border-t border-[#1a1a1a]">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="description" className="border-[#1a1a1a]">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-white hover:no-underline hover:text-white data-[state=open]:border-l-2 data-[state=open]:border-red-600 data-[state=open]:pl-2 transition-all">
                    Descripción
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-neutral-400 leading-relaxed">
                    {product.description}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="material" className="border-[#1a1a1a]">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-white hover:no-underline hover:text-white data-[state=open]:border-l-2 data-[state=open]:border-red-600 data-[state=open]:pl-2 transition-all">
                    Material y Cuidado
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-neutral-400 leading-relaxed">
                    100% Algodón Premium de 240gsm. Lavar a máquina en ciclo frío. No usar blanqueador. Secar a temperatura baja. Planchar del revés.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="details" className="border-[#1a1a1a]">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-white hover:no-underline hover:text-white data-[state=open]:border-l-2 data-[state=open]:border-red-600 data-[state=open]:pl-2 transition-all">
                    Detalles de la prenda
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-neutral-400 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-red-600" />
                        Algodón premium 240gsm
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-red-600" />
                        Corte oversize
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-red-600" />
                        Impresión serigrafía
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-red-600" />
                        Hecho en Colombia
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="care" className="border-[#1a1a1a]">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-white hover:no-underline hover:text-white data-[state=open]:border-l-2 data-[state=open]:border-red-600 data-[state=open]:pl-2 transition-all">
                    Guía de lavado
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-neutral-400 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-red-600" />
                        Lavar a mano con agua fría
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-red-600" />
                        No usar blanqueador
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-red-600" />
                        Secar a la sombra
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-red-600" />
                        Planchar a baja temperatura
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Recently Viewed Products */}
        <RecentlyViewedSection currentProductId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pb-12">
            <div className="flex items-center mb-8">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                  También te puede interesar
                </h2>
                <div className="h-0.5 w-12 bg-red-600 mt-2" />
              </div>
            </div>
            {/* Horizontal scrollable on mobile, grid on desktop */}
            <div className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
              {relatedProducts.map((p) => (
                <div key={p.id} className="min-w-[260px] sm:min-w-[280px] lg:min-w-0 snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <ProductReviews productId={product.id} />

        {/* Complete the Look */}
        {product.category?.slug && (
          <CompleteTheLook
            categorySlug={product.category.slug}
            currentProductId={product.id}
          />
        )}
      </div>

      {/* Size Quiz Dialog */}
      <SizeQuizDialog
        open={sizeQuizOpen}
        onOpenChange={setSizeQuizOpen}
        onSizeSelect={(size) => {
          const variant = product.variants.find(
            (v) => v.size === size && v.stockQuantity > 0 && (!effectiveColor || v.color === effectiveColor)
          )
          if (variant) setSelectedVariant(variant)
        }}
      />

      {/* Product Lightbox */}
      <ProductLightbox
        images={product.images.map((img) => ({ url: img.url, altText: img.altText }))}
        initialIndex={selectedImageIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </main>
  )
}

export default function ProductDetailView() {
  const slug = useNavigationStore((s) => s.viewParams.slug || '')
  return <ProductDetailInner key={slug} slug={slug} />
}