'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Tag } from 'lucide-react';
import { toast } from 'sonner';

const PROMO_CODE = 'KOP10';
const STORAGE_KEY = 'promo-banner-dismissed';

function usePromoDismissed() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  return { dismissed, dismiss };
}

export default function PromoBanner() {
  const { dismissed, dismiss } = usePromoDismissed();
  const [copied, setCopied] = useState(false);

  if (dismissed) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      toast.success(`Código ${PROMO_CODE} copiado al portapapeles`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el código');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative w-full overflow-hidden"
      >
        <div className="bg-[#0a0a0a] border-b border-red-600/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-3 sm:gap-4">
            {/* Left accent */}
            <div className="hidden sm:flex items-center gap-2">
              <Tag className="size-3.5 text-red-500" />
              <span className="text-neutral-500 text-xs uppercase tracking-widest font-bold">
                Promo
              </span>
            </div>

            {/* Promo text */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none justify-center">
              <span className="text-neutral-300 text-xs sm:text-sm">
                10% de descuento en tu primera compra con
              </span>
              <div className="flex items-center gap-1.5 bg-[#111] border border-[#333] rounded px-2 py-0.5">
                <span className="text-red-500 text-xs sm:text-sm font-bold tracking-widest uppercase">
                  {PROMO_CODE}
                </span>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors text-xs font-medium tracking-wide shrink-0"
              aria-label={`Copiar código ${PROMO_CODE}`}
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-green-400" />
                  <span className="text-green-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span className="hidden sm:inline">Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 text-neutral-500 hover:text-white transition-colors z-10 p-0.5"
          aria-label="Cerrar banner promocional"
        >
          <X className="size-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
