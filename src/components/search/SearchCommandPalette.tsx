'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ArrowRight, Tag, X } from 'lucide-react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useSearchOpenStore } from '@/stores/useSearchOpenStore';
import type { Product } from '@/types';

const QUICK_LINKS = [
  { label: 'Nuevos Productos', category: 'new-merch' },
  { label: 'Bestsellers', category: 'bestsellers' },
  { label: 'Camisetas', category: 'camisetas' },
  { label: 'Inferiores', category: 'inferiores' },
  { label: 'Accesorios', category: 'accesorios' },
] as const;

export default function SearchCommandPalette() {
  const isOpen = useSearchOpenStore((s) => s.isOpen);
  const setOpen = useSearchOpenStore((s) => s.setOpen);
  const navigate = useNavigationStore((s) => s.navigate);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to let animation start before focusing
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Global keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value || value.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setResults([]);
    setLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [setOpen]);

  const handleResultClick = useCallback(
    (product: Product) => {
      close();
      navigate('product', { slug: product.slug });
    },
    [close, navigate]
  );

  const handleQuickLinkClick = useCallback(
    (category: string) => {
      close();
      navigate('collection', { category });
    },
    [close, navigate]
  );

  const showResults = query.length >= 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex justify-center bg-black/70 backdrop-blur-sm"
          style={{ paddingTop: '15vh' }}
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-w-xl w-full mx-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl shadow-black/80"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
            }}
          >
            {/* Search Input Area */}
            <div className="relative flex items-center">
              <Search className="absolute left-4 size-5 text-neutral-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar productos, categorías..."
                className="w-full bg-transparent text-white text-base placeholder:text-neutral-500 border-none outline-none h-14 px-4 pl-12 pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#1a1a1a] text-neutral-500 text-[10px] px-2 py-0.5 rounded-sm font-mono select-none">
                ESC
              </span>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto search-palette-scrollbar">
              {/* Loading State */}
              {showResults && loading && (
                <div className="p-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-[#111] rounded-md mb-2 animate-pulse"
                    />
                  ))}
                </div>
              )}

              {/* Search Results */}
              {showResults && !loading && results.length > 0 && (
                <div className="p-1">
                  {results.map((product) => {
                    const primaryImage = product.images?.[0];
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleResultClick(product)}
                        className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors cursor-pointer rounded-md mx-1 w-full text-left"
                      >
                        <div className="w-12 h-12 rounded-md bg-[#111] overflow-hidden flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {product.title}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {product.category?.name}
                          </p>
                          <p className="text-sm text-neutral-300">
                            ${product.price.toLocaleString('es-CO')}
                          </p>
                        </div>
                        <ArrowRight className="size-4 text-neutral-600 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No Results */}
              {showResults && !loading && results.length === 0 && (
                <p className="text-neutral-500 text-sm py-8 text-center">
                  No se encontraron resultados para &quot;{query}&quot;
                </p>
              )}

              {/* Quick Links (shown when query is empty or too short) */}
              {!showResults && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold px-4 pt-3 pb-2">
                    ACCESOS RÁPIDOS
                  </p>
                  <div className="p-1 pb-2">
                    {QUICK_LINKS.map((link) => (
                      <button
                        key={link.category}
                        onClick={() => handleQuickLinkClick(link.category)}
                        className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors cursor-pointer rounded-md mx-1 w-full text-left"
                      >
                        <div className="w-12 h-12 rounded-md bg-[#111] flex items-center justify-center flex-shrink-0">
                          <Tag className="size-5 text-neutral-500" />
                        </div>
                        <span className="text-sm text-white font-medium">
                          {link.label}
                        </span>
                        <ArrowRight className="size-4 text-neutral-600 flex-shrink-0 ml-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#1a1a1a]">
              <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <kbd className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-[10px] font-mono">
                    ↵
                  </kbd>
                  Abrir
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-[10px] font-mono">
                    esc
                  </kbd>
                  Cerrar
                </span>
              </div>
              <span className="text-[10px] text-neutral-600 tracking-wider uppercase font-medium">
                KOP STUDIO
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}