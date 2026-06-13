'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
        <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
          Talla
        </h3>
        <div className="flex flex-col gap-3">
          {SIZES.map((size) => (
            <label
              key={size}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={selectedSizes.includes(size)}
                onCheckedChange={() => toggleSize(size)}
                className="border-[#404040] data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-black"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                {size}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
          Precio
        </h3>
        <div className="flex flex-col gap-2.5">
          {PRICE_RANGES.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  priceRange === range.value
                    ? 'border-[#dc2626]'
                    : 'border-[#404040] group-hover:border-gray-500'
                }`}
                onClick={() => setPriceRange(range.value)}
              >
                {priceRange === range.value && (
                  <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
                )}
              </div>
              <input
                type="radio"
                name="priceRange"
                value={range.value}
                checked={priceRange === range.value}
                onChange={() => setPriceRange(range.value)}
                className="sr-only"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
          Ordenar
        </h3>
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
            {!loading && (
              <p className="text-sm text-gray-500 mt-1">
                {filteredProducts.length} producto
                {filteredProducts.length !== 1 ? 's' : ''}
              </p>
            )}
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
                  className="border-[#404040] text-white gap-2 rounded-none bg-transparent"
                >
                  <SlidersHorizontal className="size-4" />
                  Filtros
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <p className="text-gray-400 text-lg font-medium mb-2">
                  No se encontraron productos
                </p>
                <p className="text-gray-600 text-sm">
                  Intenta ajustar los filtros
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4 border-[#404040] text-white hover:border-white text-xs uppercase tracking-wider rounded-none bg-transparent"
                >
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
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