'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ChevronRight, ShoppingCart, ShoppingBag, Scale, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCartStore } from '@/stores/useCartStore';
import { useCompareStore } from '@/stores/useCompareStore';
import type { Product, ProductVariant } from '@/types';

function formatPrice(price: number) {
  return `$${price.toLocaleString('es-CO')}`;
}

interface WishlistItemProps {
  product: Product;
  index: number;
  onRemove: () => void;
  onMoveToCart: () => void;
}

function WishlistItem({ product, index, onRemove, onMoveToCart }: WishlistItemProps) {
  const navigate = useNavigationStore((s) => s.navigate);
  const compareIds = useCompareStore((s) => s.productIds);
  const addCompare = useCompareStore((s) => s.addProduct);
  const removeCompare = useCompareStore((s) => s.removeProduct);
  const [imageError, setImageError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (addedToCart) {
      const timer = setTimeout(() => setAddedToCart(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [addedToCart]);

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary) || product.images[1];

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const savingsAmount = hasDiscount ? product.compareAtPrice! - product.price : 0;

  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const stockStatus = totalStock === 0 ? 'out' : totalStock < 5 ? 'low' : 'in';
  const stockDotColor = stockStatus === 'in' ? 'bg-green-500' : stockStatus === 'low' ? 'bg-yellow-500' : 'bg-red-500';

  const handleMoveToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveToCart();
    setAddedToCart(true);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group cursor-pointer"
      onClick={() => navigate('product', { slug: product.slug })}
    >
      <div className="relative overflow-hidden rounded-md bg-[#0a0a0a] border border-red-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 hover:border-red-600/60">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#111]">
          {!imageError && primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText}
              className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-0 transition-opacity duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
              <ShoppingBag className="size-8 text-[#333]" />
            </div>
          )}

          {!imageError && secondaryImage && (
            <img
              src={secondaryImage.url}
              alt={secondaryImage.altText}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              onError={() => setImageError(true)}
            />
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}

          {/* Stock dot */}
          <span
            className={`absolute top-2 right-2 z-10 w-2 h-2 rounded-full ${stockDotColor} ${stockStatus === 'low' ? 'animate-pulse' : ''}`}
            title={stockStatus === 'in' ? 'En stock' : stockStatus === 'low' ? 'Pocas unidades' : 'Agotado'}
          />

          {/* Move to cart button - bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleMoveToCart}
              className={`w-full text-[10px] font-bold uppercase tracking-wider py-2 rounded-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-black hover:bg-red-600 hover:text-white'
              }`}
            >
              <ShoppingCart size={12} />
              {addedToCart ? '✓ AÑADIDO' : 'MOVER AL CARRITO'}
            </button>
          </div>
        </div>

        {/* Product info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-white truncate leading-tight">
            {product.title}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {product.category?.name || ''}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-base font-bold text-white">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-500 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          {hasDiscount && savingsAmount > 0 && (
            <p className="text-red-500/80 text-[10px] font-bold mt-0.5">
              Ahorras {formatPrice(savingsAmount)}
            </p>
          )}
          {/* Add to Compare */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const isAdded = compareIds.includes(product.id);
              if (isAdded) {
                removeCompare(product.id);
                toast.info('Eliminado de la comparación');
              } else {
                if (compareIds.length >= 3) {
                  toast.error('Máximo 3 productos para comparar');
                  return;
                }
                addCompare(product.id);
                toast.success('Agregado a la comparación');
              }
            }}
            className={`mt-2 w-full text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-sm border transition-colors duration-200 flex items-center justify-center gap-1.5 ${
              compareIds.includes(product.id)
                ? 'bg-red-600/10 border-red-600/60 text-red-500'
                : 'border-[#222] text-neutral-500 hover:border-[#444] hover:text-neutral-300'
            }`}
          >
            {compareIds.includes(product.id) ? <Check size={10} /> : <Scale size={10} />}
            {compareIds.includes(product.id) ? 'EN COMPARACIÓN' : 'COMPARAR'}
          </button>
        </div>

        {/* Persistent delete icon on hover */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-8 z-20 w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600/20 rounded-sm"
          aria-label="Eliminar de favoritos"
        >
          <X size={12} className="text-neutral-400 hover:text-red-500 transition-colors" />
        </button>
      </div>
    </motion.div>
  );
}

export default function WishlistView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const wishlistIds = useWishlistStore((s) => s.wishlist);
  const removeFromWishlistIds = useWishlistStore((s) => s.toggleWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
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

  const moveToCart = useCallback((product: Product) => {
    const availableVariant = product.variants.find((v: ProductVariant) => v.stockQuantity > 0);
    if (availableVariant) {
      addItem(product, availableVariant);
      toast.success(`${product.title} añadido al carrito`);
      openCart();
    } else {
      toast.error('Producto sin stock disponible');
    }
  }, [addItem, openCart]);

  const removeFromWishlist = useCallback((productId: string) => {
    removeFromWishlistIds(productId);
    toast.success('Eliminado de favoritos');
  }, [removeFromWishlistIds]);

  const handleBuyAll = useCallback(() => {
    let added = 0;
    wishlistProducts.forEach((product) => {
      const availableVariant = product.variants.find((v: ProductVariant) => v.stockQuantity > 0);
      if (availableVariant) {
        addItem(product, availableVariant);
        added++;
      }
    });
    if (added > 0) {
      toast.success(`${added} producto${added > 1 ? 's' : ''} añadido${added > 1 ? 's' : ''} al carrito`);
      openCart();
    } else {
      toast.error('No hay productos con stock disponible');
    }
  }, [wishlistProducts, addItem, openCart]);

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
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center relative overflow-hidden">
            {/* Animated floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-red-600/30 rounded-full"
                  style={{
                    left: `${10 + (i * 7.3) % 80}%`,
                    top: `${20 + (i * 11.7) % 60}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, (i % 2 === 0 ? 15 : -15), 0],
                    opacity: [0, 0.6, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 3 + (i * 0.4),
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
            {/* Broken heart SVG animation */}
            <motion.div
              className="relative mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <motion.svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                className="text-neutral-700"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Broken heart */}
                <motion.path
                  d="M40 65 C15 45 5 30 15 18 C22 10 32 12 40 25 C48 12 58 10 65 18 C75 30 65 45 40 65Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                />
                {/* Crack line */}
                <motion.line
                  x1="40" y1="15" x2="40" y2="55"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 1, delay: 1 }}
                />
                <motion.line
                  x1="40" y1="35" x2="32" y2="42"
                  stroke="currentColor"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                />
                <motion.line
                  x1="40" y1="35" x2="48" y2="42"
                  stroke="currentColor"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                />
              </motion.svg>
            </motion.div>
            <h2 className="text-white text-xl sm:text-2xl font-bold tracking-wider uppercase mb-3 relative z-10">
              TU LISTA DE DESEOS EST&Aacute; VAC&Iacute;A
            </h2>
            <p className="text-neutral-400 text-sm max-w-md mb-8 relative z-10">
              Guarda tus productos favoritos para comprarlos despu&eacute;s
            </p>
            <button
              onClick={() => navigate('home')}
              className="bg-white text-black text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-sm hover:bg-red-600 hover:text-white transition-colors duration-200 relative z-10"
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
              <div className="flex items-center gap-3">
                {productCount >= 2 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleBuyAll}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors duration-200"
                  >
                    <ShoppingCart className="size-3.5" />
                    COMPRAR TODO
                  </motion.button>
                )}
                <button
                  onClick={clearWishlist}
                  className="flex items-center gap-2 text-xs text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-wider font-medium"
                >
                  <X className="size-4" />
                  LIMPIAR LISTA
                </button>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {wishlistProducts.map((product, idx) => (
                  <WishlistItem
                    key={product.id}
                    product={product}
                    index={idx}
                    onRemove={() => removeFromWishlist(product.id)}
                    onMoveToCart={() => moveToCart(product)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}