'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail } from 'lucide-react';
import { useNewsletterStore } from '@/stores/useNewsletterStore';

export default function NewsletterSuccess() {
  const showSuccess = useNewsletterStore((s) => s.showSuccess);
  const dismissSuccess = useNewsletterStore((s) => s.dismissSuccess);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => {
      dismissSuccess();
    }, 5000);
    return () => clearTimeout(timer);
  }, [showSuccess, dismissSuccess]);

  return (
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[60] bg-[#0a0a0a] border-t border-red-600/40"
        >
          {/* Top red glow line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {/* Animated envelope icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                  className="relative flex-shrink-0"
                >
                  <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: [0, -5, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Mail className="size-5 text-red-500" />
                    </motion.div>
                  </div>
                  {/* Pulse ring */}
                  <motion.div
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    className="absolute inset-0 rounded-full bg-red-600/20"
                  />
                </motion.div>

                <div className="min-w-0">
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white font-black text-sm sm:text-base uppercase tracking-wider"
                  >
                    ¡Bienvenido a la familia KOP!
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-neutral-400 text-xs sm:text-sm mt-0.5 truncate"
                  >
                    Revisa tu email para un 10% de descuento extra
                  </motion.p>
                </div>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={dismissSuccess}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-[#333] hover:border-white/30 hover:bg-white/5 text-neutral-500 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
