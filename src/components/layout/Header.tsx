'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useCartStore } from '@/stores/useCartStore';
import { useSearchOpenStore } from '@/stores/useSearchOpenStore';
import { useWishlistStore } from '@/stores/useWishlistStore';

const NAV_LINKS = [
  { label: 'New Merch', slug: 'new-merch' },
  { label: 'Bestsellers', slug: 'bestsellers' },
  { label: 'Total Looks', slug: 'total-looks' },
  { label: 'Camisetas', slug: 'camisetas' },
  { label: 'Inferiores', slug: 'inferiores' },
  { label: 'Básicos', slug: 'basicos' },
  { label: 'Descuentos', slug: 'descuentos' },
  { label: 'Favoritos', slug: 'favoritos' },
] as const;

export default function Header() {
  const navigate = useNavigationStore((s) => s.navigate);
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const toggleSearch = useSearchOpenStore((s) => s.toggle);
  const wishlistCount = useWishlistStore((s) => s.wishlist.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              <SheetContent side="left" className="bg-black/80 mobile-menu-backdrop border-[#262626] w-72 sm:max-w-xs" style={{ animation: 'slideInLeft 0.3s ease-out' }}>
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
                        if (link.slug === 'favoritos') {
                          navigate('wishlist');
                        } else {
                          navigate('collection', { category: link.slug });
                        }
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
                style={{ '--hover-shadow': '0 0 20px rgba(220, 38, 38, 0.3)' } as React.CSSProperties}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textShadow = '0 0 20px rgba(220, 38, 38, 0.3)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textShadow = 'none'; }}
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
                onClick={() =>
                  link.slug === 'favoritos'
                    ? navigate('wishlist')
                    : navigate('collection', { category: link.slug })
                }
                className="px-3 py-2 text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-colors font-medium relative group flex items-center gap-1.5"
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {'icon' in link && link.icon && <link.icon className="size-3.5" />}
                {link.label}
                {link.slug === 'new-merch' && (
                  <span className="relative flex h-1.5 w-1.5 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600" />
                  </span>
                )}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
          </nav>

          {/* Right: Search, Wishlist, Cart, User */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              className="text-white hover:bg-white/10"
              aria-label="Buscar"
            >
              <Search className="size-5" />
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('wishlist')}
              className="relative text-white hover:bg-white/10"
              aria-label="Favoritos"
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <Heart className="size-5" />
              </motion.div>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full" />
              )}
            </Button>

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
      {/* Animated gradient line at bottom */}
      <div className="gradient-line h-[1px] w-full" />
    </header>
  );
}