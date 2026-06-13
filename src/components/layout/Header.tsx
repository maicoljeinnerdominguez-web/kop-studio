'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useCartStore } from '@/stores/useCartStore';
import type { Product } from '@/types';

const NAV_LINKS = [
  { label: 'New Merch', slug: 'new-merch' },
  { label: 'Bestsellers', slug: 'bestsellers' },
  { label: 'Total Looks', slug: 'total-looks' },
  { label: 'Camisetas', slug: 'camisetas' },
  { label: 'Inferiores', slug: 'inferiores' },
  { label: 'Básicos', slug: 'basicos' },
  { label: 'Descuentos', slug: 'descuentos' },
  { label: 'Favoritos', slug: 'favoritos', icon: Heart },
] as const;

export default function Header() {
  const navigate = useNavigationStore((s) => s.navigate);
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 2) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch {
        setSearchResults([]);
      }
    }, 300);
  }, []);

  const handleResultClick = (product: Product) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate('product', { id: product.id, slug: product.slug });
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-black border-b border-[#262626] transition-shadow duration-300 ${
        isScrolled ? 'shadow-lg shadow-black/50' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile menu + Logo */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white hover:bg-white/10"
                  aria-label="Abrir menú"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-black border-[#262626] w-72 sm:max-w-xs">
                <SheetHeader>
                  <SheetTitle className="text-white text-lg tracking-wider font-bold">
                    KOP STUDIO
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6 px-2">
                  {NAV_LINKS.map((link) => (
                    <button
                      key={link.slug}
                      onClick={() => {
                        navigate('collection', { category: link.slug });
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-sm text-neutral-300 hover:text-white hover:bg-white/5 px-3 py-3 rounded-md transition-colors tracking-wide uppercase font-medium flex items-center gap-2"
                    >
                      {'icon' in link && link.icon && <link.icon className="size-4" />}
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t border-[#262626] my-3" />
                  <button
                    onClick={() => {
                      navigate('admin-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-sm text-neutral-400 hover:text-white hover:bg-white/5 px-3 py-3 rounded-md transition-colors tracking-wide uppercase font-medium"
                  >
                    Admin
                  </button>
                </nav>
              </SheetContent>
            </Sheet>

            <button
              onClick={() => navigate('home')}
              className="flex-shrink-0"
              aria-label="Ir al inicio"
            >
              <motion.span
                className="text-white font-bold text-xl tracking-wider"
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                KOP STUDIO
              </motion.span>
            </button>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <motion.button
                key={link.slug}
                onClick={() => navigate('collection', { category: link.slug })}
                className="px-3 py-2 text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-colors font-medium relative group flex items-center gap-1.5"
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {'icon' in link && link.icon && <link.icon className="size-3.5" />}
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
          </nav>

          {/* Right: Search, Cart, User */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-white hover:bg-white/10"
                aria-label="Buscar"
              >
                <AnimatePresence mode="wait">
                  {searchOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="size-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Search className="size-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#111] border border-[#262626] rounded-lg shadow-2xl shadow-black/60 overflow-hidden"
                  >
                    <div className="p-3">
                      <Input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-neutral-500 text-sm h-9"
                        autoFocus
                      />
                    </div>

                    {searchResults.length > 0 && (
                      <div className="max-h-72 overflow-y-auto border-t border-[#262626]">
                        {searchResults.map((product) => {
                          const primaryImage = product.images?.[0];
                          return (
                            <button
                              key={product.id}
                              onClick={() => handleResultClick(product)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                                {primaryImage?.url ? (
                                  <img
                                    src={primaryImage.url}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                                    N/A
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-white truncate">
                                  {product.title}
                                </p>
                                <p className="text-xs text-neutral-400">
                                  ${product.price.toLocaleString('es-CO')}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div className="p-4 text-center text-neutral-500 text-sm">
                        No se encontraron resultados
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative text-white hover:bg-white/10"
              aria-label="Abrir carrito"
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <ShoppingCart className="size-5" />
              </motion.div>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </Button>

            {/* User */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('admin-dashboard')}
              className="text-white hover:bg-white/10"
              aria-label="Admin"
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <User className="size-5" />
              </motion.div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}