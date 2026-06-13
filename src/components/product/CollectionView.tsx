'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal, X, ShoppingBag } from 'lucide-react'
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
                className={`min-w-[2.5rem] h-9 border text-xs uppercase tracking-wider transition-colors ${
                  isSelected
                    ? 'bg-white text-black border-white'
                    : 'border-[#333] text-neutral-400 hover:border-white hover:text-white'
                }`}
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
                className={`h-9 px-3 border text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-black border-white'
                    : 'border-[#333] text-neutral-400 hover:border-white hover:text-white'
                }`}
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

function CollectionInner({ categorySlug }: { categorySlug: string }) {
  const navigate = useNavigationStore((s) => s.navigate)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [filterOpen, setFilterOpen] = useState(false)

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

  const activeFilters =
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
      camisetas: 'Camisetas',
      inferiores: 'Inferiores',
      basicos: 'Básicos',
      accesorios: 'Accesorios',
      descuentos: 'Descuentos',
    }
    return map[categorySlug] || categorySlug
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
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-medium">
                  {categoryName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wider">
              {categoryName}
            </h1>
          </div>

          {/* Mobile filter button */}
          <div className="flex items-center gap-3 lg:hidden">
            {activeFilters && (
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
                  FILTRAR{!loading && ` (${filteredProducts.length} productos)`}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-[#0a0a0a] border-[#262626] p-6">
                <SheetHeader>
                  <SheetTitle className="text-white text-sm uppercase tracking-widest">
                    Filtros
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">{filterContent}</div>
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
                {/* Product count header */}
                <div className="border-t border-[#1a1a1a] pt-6 mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-400">
                      <span className="text-white font-medium">{filteredProducts.length}</span> productos
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CollectionView() {
  const categorySlug = useNavigationStore((s) => s.viewParams.category || '')
  return <CollectionInner key={categorySlug} categorySlug={categorySlug} />
}