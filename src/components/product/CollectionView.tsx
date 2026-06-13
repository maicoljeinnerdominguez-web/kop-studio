'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SlidersHorizontal, X, ShoppingBag, ArrowUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useNavigationStore } from '@/stores/useNavigationStore'
import ProductCard from '@/components/product/ProductCard'
import type { Product } from '@/types'

const SIZES = ['S', 'M', 'L', 'XL', 'OS']

interface PriceRangeOption {
  label: string
  min: number
  max: number
}

const PRICE_RANGES: (PriceRangeOption & { value: string })[] = [
  { label: 'Todos', value: 'all', min: 0, max: Infinity },
  { label: 'Hasta $100K', value: '0-100000', min: 0, max: 100000 },
  { label: '$100K - $150K', value: '100000-150000', min: 100000, max: 150000 },
  { label: '$150K - $200K', value: '150000-200000', min: 150000, max: 200000 },
  { label: 'Más de $200K', value: '200000-inf', min: 200000, max: Infinity },
]

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'bestseller'

function FilterSidebar({
  selectedSizes,
  toggleSize,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  onClear,
  productCount,
}: {
  selectedSizes: string[]
  toggleSize: (size: string) => void
  priceRange: string
  setPriceRange: (v: string) => void
  sortBy: string
  setSortBy: (v: string) => void
  onClear: () => void
  productCount: number
}) {
  return (
    <div className="space-y-8">
      {/* Size filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-red-600" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">
            Talla
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size)
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`min-w-[2.5rem] h-9 border text-xs uppercase tracking-wider filter-btn focus-ring-red ${isSelected ? 'active bg-white text-black border-white' : 'border-[#333] text-neutral-400'}`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>

      {/* Price range filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-red-600" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">
            Precio
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((range) => {
            const isSelected = priceRange === range.value
            return (
              <button
                key={range.value}
                onClick={() => setPriceRange(range.value)}
                className={`h-9 px-3 border text-xs uppercase tracking-wider filter-btn whitespace-nowrap focus-ring-red ${isSelected ? 'active bg-white text-black border-white' : 'border-[#333] text-neutral-400'}`}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sort */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-red-600" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">
            Ordenar
          </h3>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full border-[#404040] bg-[#0a0a0a] text-white">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a0a] border-[#262626]">
            <SelectItem value="newest">Más nuevos</SelectItem>
            <SelectItem value="price-asc">Menor precio</SelectItem>
            <SelectItem value="price-desc">Mayor precio</SelectItem>
            <SelectItem value="bestseller">Bestsellers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters */}
      <Button
        variant="outline"
        onClick={onClear}
        className="w-full border-[#404040] text-gray-400 hover:text-white hover:border-white text-xs uppercase tracking-wider py-2 rounded-none bg-transparent"
      >
        Limpiar Filtros
      </Button>

      <p className="text-xs text-gray-500">
        {productCount} producto{productCount !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

function ActiveFilterChips({
  selectedSizes,
  toggleSize,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  onClear,
}: {
  selectedSizes: string[]
  toggleSize: (size: string) => void
  priceRange: string
  setPriceRange: (v: string) => void
  sortBy: string
  setSortBy: (v: string) => void
  onClear: () => void
}) {
  const chips: { label: string; onRemove: () => void }[] = []

  selectedSizes.forEach((size) => {
    chips.push({
      label: `Talla: ${size}`,
      onRemove: () => toggleSize(size),
    })
  })

  if (priceRange !== 'all') {
    const range = PRICE_RANGES.find((r) => r.value === priceRange)
    if (range) {
      chips.push({
        label: `Precio: ${range.label}`,
        onRemove: () => setPriceRange('all'),
      })
    }
  }

  if (sortBy !== 'newest') {
    const sortLabels: Record<string, string> = {
      'price-asc': 'Menor precio',
      'price-desc': 'Mayor precio',
      bestseller: 'Bestsellers',
    }
    chips.push({
      label: `Orden: ${sortLabels[sortBy] || sortBy}`,
      onRemove: () => setSortBy('newest'),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((chip, i) => (
        <div
          key={i}
          className="bg-[#1a1a1a] border border-[#333] text-xs text-neutral-300 px-3 py-1.5 rounded-sm flex items-center gap-2"
        >
          <span>{chip.label}</span>
          <button
            onClick={chip.onRemove}
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label={`Remove filter: ${chip.label}`}
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
      <button
        onClick={onClear}
        className="text-xs text-red-600 hover:text-red-500 uppercase tracking-wider font-medium transition-colors"
      >
        Limpiar todo
      </button>
    </div>
  )
}

function CollectionInner({ categorySlug }: { categorySlug: string }) {
  const navigate = useNavigationStore((s) => s.navigate)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const url = categorySlug
      ? `/api/products?category=${categorySlug}`
      : '/api/products'
    fetch(url)
      .then((r) => r.json())
      .then((data: Product[]) => setAllProducts(data))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false))
  }, [categorySlug])

  // Scroll to top detection for mobile floating button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toggleSize = useCallback((size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedSizes([])
    setPriceRange('all')
    setSortBy('newest')
  }, [])

  const hasActiveFilters =
    selectedSizes.length > 0 || priceRange !== 'all' || sortBy !== 'newest'

  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedSizes.includes(v.size))
      )
    }

    if (priceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.value === priceRange)
      if (range) {
        result = result.filter(
          (p) => p.price >= range.min && p.price <= range.max
        )
      }
    }

    switch (sortBy as SortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'bestseller':
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))
        break
      case 'newest':
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
    }

    return result
  }, [allProducts, selectedSizes, priceRange, sortBy])

  const categoryName = useMemo(() => {
    const map: Record<string, string> = {
      'new-merch': 'New Merch',
      bestsellers: 'Bestsellers',
      'total-looks': 'Total Looks',
      camisetas: 'CAMISETAS',
      inferiores: 'INFERIORES',
      basicos: 'BÁSICOS',
      accesorios: 'ACCESORIOS',
      descuentos: 'DESCUENTOS',
    }
    return map[categorySlug] || categorySlug.toUpperCase()
  }, [categorySlug])

  const filterContent = (
    <FilterSidebar
      selectedSizes={selectedSizes}
      toggleSize={toggleSize}
      priceRange={priceRange}
      setPriceRange={setPriceRange}
      sortBy={sortBy}
      setSortBy={setSortBy}
      onClear={clearFilters}
      productCount={filteredProducts.length}
    />
  )

  return (
    <main className="min-h-screen" ref={scrollContainerRef}>
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
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-medium">
                  {categoryName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="max-w-7xl mx-auto px-4"><div className="separator-dot py-3"><span className="w-1.5 h-1.5 rounded-full bg-red-600" /></div></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with product count */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wider animated-border-bottom">
              {categoryName}
              {!loading && (
                <motion.span
                  className="text-neutral-500 font-normal text-lg sm:text-xl ml-2"
                  key={filteredProducts.length}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  ({filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''})
                </motion.span>
              )}
            </h1>
          </div>

          {/* Mobile filter button */}
          <div className="flex items-center gap-3 lg:hidden">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-white"
              >
                <X className="size-3 mr-1" />
                Limpiar
              </Button>
            )}
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border border-[#333] text-white gap-2 rounded-none bg-transparent hover:border-white"
                >
                  <SlidersHorizontal className="size-4" />
                  FILTRAR{!loading && ` (${filteredProducts.length})`}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 bg-[#0a0a0a] border-[#262626] p-6 flex flex-col"
              >
                <SheetHeader>
                  <SheetTitle className="text-white text-sm uppercase tracking-widest">
                    Filtros
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex-1 overflow-y-auto">
                  {filterContent}
                </div>
                {/* Sticky apply button */}
                <div className="sticky bottom-0 pt-4 pb-2 bg-[#0a0a0a] border-t border-[#262626]">
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="bg-red-600 text-white h-11 w-full uppercase text-xs font-bold tracking-widest hover:bg-red-700 transition-colors"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">{filterContent}</div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="aspect-[3/4] w-full bg-[#111] rounded-md" />
                    <Skeleton className="h-4 w-3/4 mt-3 bg-[#111]" />
                    <Skeleton className="h-3 w-1/2 mt-2 bg-[#111]" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <ShoppingBag className="size-16 text-neutral-700 mb-6" />
                <p className="text-white text-lg uppercase tracking-wider font-bold mb-2">
                  NO HAY PRODUCTOS
                </p>
                <p className="text-neutral-500 text-sm mb-6">
                  No se encontraron productos con los filtros seleccionados
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-[#333] text-white hover:border-white text-xs uppercase tracking-widest rounded-none bg-transparent h-10 px-6"
                >
                  LIMPIAR FILTROS
                </Button>
              </div>
            ) : (
              <>
                {/* Active filter chips */}
                <ActiveFilterChips
                  selectedSizes={selectedSizes}
                  toggleSize={toggleSize}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onClear={clearFilters}
                />

                {/* Product count header */}
                <div className="border-t border-[#1a1a1a] pt-6 mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-400 count-animate">
                      <motion.span
                        key={filteredProducts.length}
                        className="text-white font-medium"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >{filteredProducts.length}</motion.span> productos
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5 border-radius-animate">
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to top button - mobile only */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="md:hidden fixed bottom-4 right-4 z-50 w-10 h-10 bg-[#1a1a1a] border border-[#333] text-white rounded-full flex items-center justify-center hover:border-white transition-colors"
          aria-label="Volver arriba"
        >
          <ArrowUp className="size-4" />
        </button>
      )}
    </main>
  )
}

export default function CollectionView() {
  const categorySlug = useNavigationStore((s) => s.viewParams.category || '')
  return <CollectionInner key={categorySlug} categorySlug={categorySlug} />
}