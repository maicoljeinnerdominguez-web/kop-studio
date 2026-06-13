'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Instagram, Twitter, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/stores/useNavigationStore';

const SHOP_LINKS = [
  { label: 'New Merch', slug: 'new-merch' },
  { label: 'Bestsellers', slug: 'bestsellers' },
  { label: 'Camisetas', slug: 'camisetas' },
  { label: 'Inferiores', slug: 'inferiores' },
  { label: 'Básicos', slug: 'basicos' },
  { label: 'Accesorios', slug: 'accesorios' },
];

const INFO_LINKS = [
  { label: 'Envíos', slug: 'envios' },
  { label: 'Devoluciones', slug: 'devoluciones' },
  { label: 'Términos', slug: 'terminos' },
  { label: 'Privacidad', slug: 'privacidad' },
  { label: 'Contacto', slug: 'contacto' },
];

const PAYMENT_METHODS = ['Visa', 'Mastercard', 'PSE', 'Nequi', 'Addi'];

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function Footer() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-reset success after 3 seconds
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setEmail('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Auto-clear error after 3 seconds
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleNewsletterSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMessage('');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        setErrorMessage('Ingresa tu correo electrónico');
        setStatus('error');
        return;
      }
      if (!emailRegex.test(email)) {
        setErrorMessage('Ingresa un correo electrónico válido');
        setStatus('error');
        return;
      }

      setStatus('loading');

      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage('Intenta de nuevo');
        }
      } catch {
        setStatus('error');
        setErrorMessage('Intenta de nuevo');
      }
    },
    [email]
  );

  const isDisabled = status === 'loading' || status === 'success';

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#262626]">
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-xl tracking-wider">
              KOP STUDIO
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Streetwear colombiano con actitud. Diseños que rompen esquemas y
              definan tu estilo urbano sin importar las reglas.
            </p>
            {/* Social Media Icons Row */}
            <div className="flex gap-3 pt-1">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-neutral-400 hover:scale-110 hover:text-white hover:border-white/50 transition-all duration-200"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-neutral-400 hover:scale-110 hover:text-white hover:border-white/50 transition-all duration-200"
              >
                <Twitter className="size-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Tienda */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">
              Tienda
            </h4>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.slug}>
                  <button
                    onClick={() => navigate('collection', { category: link.slug })}
                    className="text-neutral-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Información */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">
              Información
            </h4>
            <ul className="space-y-2.5">
              {INFO_LINKS.map((link) => (
                <li key={link.slug}>
                  <button
                    onClick={() => navigate('home')}
                    className="text-neutral-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">
              Newsletter
            </h4>
            <p className="text-neutral-500 text-sm mb-4">
              Recibe ofertas exclusivas y lanzamientos antes que nadie.
            </p>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex items-center gap-2 py-2"
                >
                  <motion.svg
                    className="size-5 text-green-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                  >
                    <motion.path
                      d="M20 6L9 17l-5-5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    />
                  </motion.svg>
                  <span className="text-green-400 text-sm font-medium">
                    ¡Suscrito exitosamente!
                  </span>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleNewsletterSubmit}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      disabled={isDisabled}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage('');
                      }}
                      className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-neutral-600 text-sm h-9 rounded-none flex-1 focus-visible:border-white/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Button
                      type="submit"
                      disabled={isDisabled}
                      className="bg-red-600 hover:bg-red-700 text-white uppercase text-[10px] tracking-wider font-bold px-3 h-9 rounded-none hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {status === 'loading' ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        'SUSCRIBIRSE'
                      )}
                    </Button>
                  </div>
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 text-xs overflow-hidden"
                      >
                        {errorMessage}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className="text-[10px] text-neutral-600 leading-relaxed">
                    Al suscribirte, aceptas nuestra política de privacidad.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-neutral-600 text-xs uppercase tracking-wider mr-1 flex items-center gap-1.5">
              <Lock className="size-3" />
              Métodos de pago:
            </span>
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="bg-[#111] border border-[#1a1a1a] text-neutral-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Social Bottom Bar */}
      <div className="border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center gap-4">
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-neutral-400 hover:scale-110 hover:text-white hover:border-white/50 transition-all duration-200"
          >
            <Instagram className="size-4" />
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-neutral-400 hover:scale-110 hover:text-white hover:border-white/50 transition-all duration-200"
          >
            <Twitter className="size-4" />
          </a>
        </div>
      </div>

      {/* Divider + Powered By + Copyright */}
      <div className="border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-2">
          <p className="text-center text-neutral-600 text-xs tracking-wide">
            Diseñado con pasión en Bogotá, Colombia 🇨🇴
          </p>
          <p className="text-center text-neutral-600 text-xs tracking-wide">
            © 2026 KOP STUDIO. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}