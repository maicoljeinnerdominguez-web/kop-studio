'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronDown, Truck, RotateCcw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigationStore } from '@/stores/useNavigationStore'
import { useRecentlyViewedStore } from '@/stores/useRecentlyViewedStore'
import ProductCard from '@/components/product/ProductCard'
import type { Product, Category } from '@/types'



const HERO_WORDS = ['ASCENSIÓN', 'COLECCIÓN', '2026']

const brandStats = [
  { value: '100+', label: 'Diseños' },
  { value: '5K+', label: 'Clientes' },
  { value: '4.9★', label: 'Rating' },
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

const trustFeatures = [
  { icon: Truck, title: 'ENVÍO EXPRESS', desc: '2-4 días hábiles' },
  { icon: RotateCcw, title: 'DEVOLUCIONES', desc: '30 días para cambios' },
  { icon: ShieldCheck, title: 'COMPRA SEGURA', desc: 'Pago protegido' },
]

export default function HomeView() {
  const navigate = useNavigationStore()
  const recentlyViewed = useRecentlyViewedStore((s) => s.recentlyViewed)
  const [categories, setCategories] = useState<Category[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingBest, setLoadingBest] = useState(true)

  const carouselRef1 = useRef<HTMLDivElement>(null)
  const carouselRef2 = useRef<HTMLDivElement>(null)
  const carouselRef3 = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

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
      <section ref={heroRef} className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src="/images/hero/hero-main.png"
            alt="KOP STUDIO - Ascensión Colección 2026"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>

        {/* Grain/noise texture overlay */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none opacity-[0.35] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />

        {/* Bottom gradient fade to black */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[6]" />

        <motion.div className="relative z-10 text-center px-4 max-w-3xl mx-auto pb-16" style={{ opacity: heroOpacity }}>
          <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-widest uppercase">
            {HERO_WORDS.map((word, i) => (
              <span key={word}>
                <motion.span
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.15, ease: 'easeOut' }}
                  className="inline-block"
                >
                  {word}
                </motion.span>{' '}
              </span>
            ))}
          </h1>

          {/* Red line that draws itself under the heading */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.65, ease: 'easeOut' }}
            className="mt-4 mx-auto h-[2px] w-24 bg-[#dc2626] origin-center"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="mt-4 text-lg sm:text-2xl text-white/80 italic tracking-[0.2em]"
          >
            Built in Silence
          </motion.p>

          {/* Drop date with pulsing red dot */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              DROP: 2026
            </span>
          </motion.div>

          {/* CTA buttons staggered */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85, ease: 'easeOut' }}
            >
              <Button
                onClick={() => navigate('collection', { category: 'new-merch' })}
                className="bg-white text-black hover:bg-gray-200 text-xs font-bold uppercase tracking-wider px-8 py-6 h-auto rounded-none"
              >
                Explorar Colección
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: 'easeOut' }}
            >
              <Button
                variant="outline"
                onClick={() => navigate('collection', { category: 'bestsellers' })}
                className="border-white text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider px-8 py-6 h-auto rounded-none bg-transparent"
              >
                Ver Bestsellers
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll-down indicator (mobile) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 sm:hidden">
          <ChevronDown className="w-6 h-6 text-white/40 animate-bounce" />
        </div>
      </section>

      {/* ===== TRUST / FEATURES STRIP ===== */}
      <section className="border-y border-[#1a1a1a] py-4 px-4" style={{ background: 'linear-gradient(180deg, rgba(220,38,38,0.03) 0%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto flex justify-around items-center">
          {trustFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              className="flex flex-col items-center gap-1"
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <div className={`p-2 rounded-full ${idx === 0 ? 'truck-pulse-ring' : ''}`}>
                <feature.icon className={`size-5 text-red-600 mb-0.5 trust-feature-icon`} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
                {feature.title}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-500 hidden sm:block">
                {feature.desc}
              </span>
            </motion.div>
          ))}
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 max-w-5xl mx-auto">
          {CATEGORIES_DISPLAY.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              custom={i}
              onClick={() => navigate('collection', { category: cat.slug })}
              className="group cursor-pointer relative overflow-hidden rounded-md border border-[#1a1a1a] hover:border-transparent hover:border-b-red-600 border-b-0 transition-colors duration-300"
              style={{ borderBottom: '2px solid transparent' }}
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
              {/* Red bottom border on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== LO NUEVO CAROUSEL ===== */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                  Lo Nuevo
                </h2>
                <div className="mt-1 h-0.5 w-12 bg-[#dc2626]" />
              </div>
              {!loadingNew && newProducts.length > 0 && (
                <button
                  onClick={() => navigate('collection', { category: 'new-merch' })}
                  className="text-xs tracking-wider text-neutral-500 hover:text-red-500 transition-colors uppercase"
                >
                  Ver Todos &rarr;
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll(carouselRef1, 'left')}
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="size-4 text-white" />
              </button>
              <button
                onClick={() => scroll(carouselRef1, 'right')}
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors"
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
              {newProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="min-w-[55vw] sm:min-w-[260px] md:min-w-[280px] snap-start"
                >
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          )}

          {/* Subtle divider */}
          {!loadingNew && newProducts.length > 0 && (
            <div className="mt-10 border-t border-[#1a1a1a]" />
          )}
        </div>
      </section>

      {/* ===== BEST SELLERS CAROUSEL ===== */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                  Best Sellers
                </h2>
                <div className="mt-1 h-0.5 w-12 bg-[#dc2626]" />
              </div>
              {!loadingBest && bestsellerProducts.length > 0 && (
                <button
                  onClick={() => navigate('collection', { category: 'bestsellers' })}
                  className="text-xs tracking-wider text-neutral-500 hover:text-red-500 transition-colors uppercase"
                >
                  Ver Todos &rarr;
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll(carouselRef2, 'left')}
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="size-4 text-white" />
              </button>
              <button
                onClick={() => scroll(carouselRef2, 'right')}
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors"
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
              {bestsellerProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="min-w-[55vw] sm:min-w-[260px] md:min-w-[280px] snap-start"
                >
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          )}

          {/* Subtle divider */}
          {!loadingBest && bestsellerProducts.length > 0 && (
            <div className="mt-10 border-t border-[#1a1a1a]" />
          )}
        </div>
      </section>

      {/* ===== BRAND STORY SECTION ===== */}
      <section className="bg-[#0a0a0a] py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left: Brand image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={0}
            className="overflow-hidden rounded-md"
          >
            <img
              src="/images/products/hoodie-mandala-2.png"
              alt="KOP STUDIO - Nuestra Historia"
              className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>

          {/* Right: Brand text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={1}
            className="flex flex-col gap-6"
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Nuestra Historia
            </h2>
            <p className="text-gray-300 leading-relaxed text-base">
              KOP STUDIO nació en las calles de Bogotá, donde la cultura urbana se
              encuentra con el arte. Cada prenda cuenta una historia de resistencia,
              identidad y estilo propio. No seguimos tendencias — las creamos.
            </p>
            {/* Brand stats */}
            <div className="flex items-center gap-8 mt-2">
              {brandStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeInUp}
                  custom={i + 2}
                  className="flex flex-col"
                >
                  <span className="text-xl font-bold text-red-600">{stat.value}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">{stat.label}</span>
                </motion.div>
              ))}
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => navigate('home')}
                className="border-white/30 text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider px-8 py-4 h-auto rounded-none bg-transparent transition-colors"
              >
                Conócenos
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== VISTOS RECIENTEMENTE CAROUSEL ===== */}
      {recentlyViewed.length >= 2 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                    Vistos Recientemente
                  </h2>
                  <div className="mt-1 h-0.5 w-12 bg-[#dc2626]" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll(carouselRef3, 'left')}
                  className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="size-4 text-white" />
                </button>
                <button
                  onClick={() => scroll(carouselRef3, 'right')}
                  className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="size-4 text-white" />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef3}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recentlyViewed.map((item, i) => (
                <div
                  key={item.id}
                  className="min-w-[55vw] sm:min-w-[260px] md:min-w-[280px] snap-start"
                >
                  <ProductCard product={item as unknown as Product} index={i} />
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-[#1a1a1a]" />
          </div>
        </section>
      )}


    </main>
  )
}