'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigationStore } from '@/stores/useNavigationStore'
import ProductCard from '@/components/product/ProductCard'
import type { Product, Category, Review } from '@/types'

const STATIC_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Carlos M.',
    rating: 5,
    comment:
      'La calidad de las prendas es increíble. El hoodie Sivere es mi pieza favorita, el tejido es super pesado y cómodo.',
    date: 'Mayo 2026',
  },
  {
    id: '2',
    name: 'Valentina R.',
    rating: 5,
    comment:
      'Compré el cargo tactical y llegó super rápido. La tela ripstop es de primera. Ya quiero comprar en otro color.',
    date: 'Abril 2026',
  },
  {
    id: '3',
    name: 'Juan D.',
    rating: 4,
    comment:
      'Las gráficas de las camisetas son arte. Se nota el trabajo artesanal. 100% recomendado para quienes buscan estilo único.',
    date: 'Mayo 2026',
  },
]

const CATEGORIES_DISPLAY: { name: string; slug: string; image: string }[] = [
  { name: 'New Merch', slug: 'new-merch', image: '/images/products/hoodie-mandala-2.png' },
  { name: 'Camisetas', slug: 'camisetas', image: '/images/products/tshirt-gothic-1.png' },
  { name: 'Inferiores', slug: 'inferiores', image: '/images/products/cargo-black-3.png' },
  { name: 'Accesorios', slug: 'accesorios', image: '/images/products/puffer-bag-5.png' },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
}

export default function HomeView() {
  const navigate = useNavigationStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingBest, setLoadingBest] = useState(true)

  const carouselRef1 = useRef<HTMLDivElement>(null)
  const carouselRef2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: (Category & { _count: { products: number } })[]) => {
        setCategories(
          data.map((c) => ({ ...c, children: undefined, parent: undefined }))
        )
      })
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [])

  useEffect(() => {
    fetch('/api/products?new=true')
      .then((r) => r.json())
      .then((data: Product[]) => setNewProducts(data))
      .catch(() => {})
      .finally(() => setLoadingNew(false))
  }, [])

  useEffect(() => {
    fetch('/api/products?bestseller=true')
      .then((r) => r.json())
      .then((data: Product[]) => setBestsellerProducts(data))
      .catch(() => {})
      .finally(() => setLoadingBest(false))
  }, [])

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (!ref.current) return
    const amount = ref.current.clientWidth * 0.7
    ref.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  const getCategoryCount = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug)
    return cat ? (cat as Category & { _count?: { products: number } })._count?.products : 0
  }

  return (
    <main>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero/hero-main.png"
            alt="KOP STUDIO - Ascensión Colección 2026"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-widest uppercase"
          >
            ASCENSIÓN COLECCIÓN 2026
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="mt-4 text-2xl text-white/80 italic"
          >
            Built in Silence
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() => navigate('collection', { category: 'new-merch' })}
              className="bg-white text-black hover:bg-gray-200 text-xs font-bold uppercase tracking-wider px-8 py-6 h-auto rounded-none"
            >
              Explorar Colección
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('collection', { category: 'bestsellers' })}
              className="border-white text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider px-8 py-6 h-auto rounded-none bg-transparent"
            >
              Ver Bestsellers
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== CATEGORIES GRID ===== */}
      <section className="py-16 px-4">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          custom={0}
          className="text-center text-sm font-bold uppercase tracking-widest text-white mb-10"
        >
          Categorías
        </motion.h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {CATEGORIES_DISPLAY.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              custom={i}
              onClick={() => navigate('collection', { category: cat.slug })}
              className="group cursor-pointer relative overflow-hidden rounded-md border border-[#1a1a1a] hover:border-[#dc2626] transition-colors duration-300"
            >
              <div className="aspect-[3/4] overflow-hidden bg-[#0a0a0a]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
                <h3 className="text-white text-sm font-bold uppercase tracking-wider">
                  {cat.name}
                </h3>
                {loadingCategories ? (
                  <Skeleton className="h-3 w-12 mt-1 bg-[#333]" />
                ) : (
                  <p className="text-white/60 text-xs mt-0.5">
                    {getCategoryCount(cat.slug)} productos
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== LO NUEVO CAROUSEL ===== */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="relative">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                Lo Nuevo
              </h2>
              <div className="mt-1 h-0.5 w-12 bg-[#dc2626]" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll(carouselRef1, 'left')}
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center hover:border-white transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="size-4 text-white" />
              </button>
              <button
                onClick={() => scroll(carouselRef1, 'right')}
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center hover:border-white transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="size-4 text-white" />
              </button>
            </div>
          </div>

          {loadingNew ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[260px] sm:min-w-[280px]">
                  <Skeleton className="aspect-[3/4] w-full bg-[#111] rounded-md" />
                </div>
              ))}
            </div>
          ) : newProducts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-12">
              No hay productos nuevos disponibles
            </p>
          ) : (
            <div
              ref={carouselRef1}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {newProducts.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[55vw] sm:min-w-[260px] md:min-w-[280px] snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {newProducts.length > 0 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => navigate('collection', { category: 'new-merch' })}
                className="border-[#333] text-white hover:border-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider px-8 h-auto py-3 rounded-none bg-transparent"
              >
                Ver Todos
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ===== BEST SELLERS CAROUSEL ===== */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="relative">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                Best Sellers
              </h2>
              <div className="mt-1 h-0.5 w-12 bg-[#dc2626]" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll(carouselRef2, 'left')}
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center hover:border-white transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="size-4 text-white" />
              </button>
              <button
                onClick={() => scroll(carouselRef2, 'right')}
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center hover:border-white transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="size-4 text-white" />
              </button>
            </div>
          </div>

          {loadingBest ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[260px] sm:min-w-[280px]">
                  <Skeleton className="aspect-[3/4] w-full bg-[#111] rounded-md" />
                </div>
              ))}
            </div>
          ) : bestsellerProducts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-12">
              No hay best sellers disponibles
            </p>
          ) : (
            <div
              ref={carouselRef2}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {bestsellerProducts.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[55vw] sm:min-w-[260px] md:min-w-[280px] snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {bestsellerProducts.length > 0 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => navigate('collection', { category: 'bestsellers' })}
                className="border-[#333] text-white hover:border-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider px-8 h-auto py-3 rounded-none bg-transparent"
              >
                Ver Todos
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ===== REVIEWS SECTION ===== */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={0}
            className="text-center text-sm font-bold uppercase tracking-widest text-white mb-10"
          >
            Lo Que Dicen Nuestros Clientes
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATIC_REVIEWS.map((review, i) => (
              <motion.div
                key={review.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                custom={i}
                className="rounded-md border border-[#1a1a1a] bg-[#0a0a0a] p-6"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`size-4 ${
                        star <= review.rating
                          ? 'fill-[#dc2626] text-[#dc2626]'
                          : 'fill-[#333] text-[#333]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {review.name}
                  </span>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

