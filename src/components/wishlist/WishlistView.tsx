'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ChevronRight } from 'lucide-react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/types';

export default function WishlistView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const wishlistIds = useWishlistStore((s) => s.wishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data: Product[] = await res.json();
          setProducts(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const productCount = wishlistProducts.length;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <button
            onClick={() => navigate('home')}
            className="hover:text-white transition-colors uppercase tracking-wider"
          >
            Inicio
          </button>
          <ChevronRight className="size-3" />
          <span className="text-white uppercase tracking-wider">Favoritos</span>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : productCount === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <Heart className="size-20 text-neutral-700 mb-6" />
            <h2 className="text-white text-xl sm:text-2xl font-bold tracking-wider uppercase mb-3">
              TU LISTA DE DESEOS EST&Aacute; VAC&Iacute;A
            </h2>
            <p className="text-neutral-400 text-sm max-w-md mb-8">
              Guarda tus productos favoritos para comprarlos despu&eacute;s
            </p>
            <button
              onClick={() => navigate('home')}
              className="bg-white text-black text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-sm hover:bg-red-600 hover:text-white transition-colors duration-200"
            >
              EXPLORAR TIENDA
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-wider uppercase">
                  FAVORITOS{' '}
                  <span className="text-neutral-400 font-medium">
                    ({productCount} PRODUCTO{productCount !== 1 ? 'S' : ''})
                  </span>
                </h1>
                <div className="w-16 h-0.5 bg-red-600 mt-2" />
              </div>
              <button
                onClick={clearWishlist}
                className="flex items-center gap-2 text-xs text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-wider font-medium"
              >
                <X className="size-4" />
                LIMPIAR LISTA
              </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {wishlistProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}