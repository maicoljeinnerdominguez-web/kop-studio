'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/useCartStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import type { Product } from '@/types';

// Adjacent category mapping for outfit pairing
const ADJACENT_CATEGORIES: Record<string, string[]> = {
  'camisetas': ['inferiores', 'accesorios', 'basicos'],
  'inferiores': ['camisetas', 'accesorios'],
  'basicos': ['camisetas', 'inferiores', 'accesorios'],
  'accesorios': ['camisetas', 'inferiores', 'basicos'],
  'new-merch': ['camisetas', 'inferiores', 'accesorios'],
  'bestsellers': ['camisetas', 'inferiores', 'accesorios'],
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

interface CompleteTheLookProps {
  categorySlug: string;
  currentProductId: string;
}

export default function CompleteTheLook({ categorySlug, currentProductId }: CompleteTheLookProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigationStore((s) => s.navigate);
  const [, setScrollRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecommendations() {
      setLoading(true);
      const categoriesToFetch = ADJACENT_CATEGORIES[categorySlug] || ['camisetas', 'inferiores', 'accesorios'];

      const allProducts: Product[] = [];
      for (const cat of categoriesToFetch) {
        try {
          const res = await fetch(`/api/products?category=${cat}`);
          if (res.ok) {
            const data: Product[] = await res.json();
            allProducts.push(...data);
          }
        } catch {
          // silently skip failed fetches
        }
      }

      if (!cancelled) {
        // Deduplicate, exclude current product, take up to 8
        const seen = new Set<string>();
        const filtered = allProducts.filter((p) => {
          if (p.id === currentProductId || seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        setProducts(filtered.slice(0, 8));
        setLoading(false);
      }
    }

    fetchRecommendations();
    return () => { cancelled = true; };
  }, [categorySlug, currentProductId]);

  if (!loading && products.length === 0) return null;

  const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')}`;

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const variant = product.variants.find((v) => v.stockQuantity > 0);
    if (variant) {
      addItem(product, variant);
      toast.success('Producto añadido al carrito');
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const el = document.getElementById('complete-the-look-scroll');
    if (!el) return;
    const scrollAmount = 180;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="mt-12 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-black text-lg uppercase tracking-wider">
            Completa tu look
          </h2>
          <div className="h-[2px] w-16 bg-red-600 mt-2 rounded-full" />
        </div>

        {/* Scroll arrows for desktop */}
        {products.length > 4 && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full border border-[#333] hover:border-white/30 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full border border-[#333] hover:border-white/30 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-32 h-40 bg-[#111] rounded-md animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div
          id="complete-the-look-scroll"
          ref={setScrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-hide"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex gap-3"
          >
            {products.map((product) => {
              const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
              const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
              const inStock = product.variants.some((v) => v.stockQuantity > 0);

              return (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  className="flex-shrink-0 w-32 snap-start"
                >
                  <div
                    className="group cursor-pointer h-40 rounded-md bg-[#111] border border-[#1a1a1a] hover:border-red-600/40 transition-all duration-300 overflow-hidden"
                    onClick={() => navigate('product', { slug: product.slug })}
                  >
                    {/* Image */}
                    <div className="relative h-[100px] overflow-hidden bg-[#0a0a0a]">
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={primaryImage.altText}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ShoppingBag className="size-5 text-[#333]" />
                        </div>
                      )}

                      {/* Discount badge */}
                      {hasDiscount && (
                        <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                          OFF
                        </span>
                      )}

                      {/* Out of stock overlay */}
                      {!inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-[8px] font-black uppercase tracking-wider">Agotado</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2 flex flex-col justify-between h-[calc(160px-100px)]">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-white truncate leading-tight">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11px] font-bold text-white">
                            {formatPrice(product.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-[9px] text-neutral-500 line-through">
                              {formatPrice(product.compareAtPrice!)}
                            </span>
                          )}
                        </div>
                      </div>

                      {inStock && (
                        <button
                          onClick={(e) => handleQuickAdd(e, product)}
                          className="mt-1.5 w-full text-[9px] font-bold uppercase tracking-wider py-1.5 rounded-sm bg-white text-black hover:bg-red-600 hover:text-white transition-colors duration-200"
                        >
                          Añadir
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Hide scrollbar utility */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
