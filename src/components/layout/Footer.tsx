'use client';

import { useState, type FormEvent } from 'react';
import { Instagram, Twitter, Lock, Check } from 'lucide-react';
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

export default function Footer() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Ingresa tu correo electrónico');
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Ingresa un correo electrónico válido');
      return;
    }

    setEmailSuccess(true);
    setEmail('');
  };

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
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
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
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                    setEmailSuccess(false);
                  }}
                  className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-neutral-600 text-sm h-9 rounded-none flex-1"
                />
                {emailSuccess ? (
                  <div className="flex items-center justify-center w-9 h-9 bg-green-600 shrink-0">
                    <Check className="size-4 text-white" />
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white uppercase text-[10px] tracking-wider font-bold px-3 h-9 rounded-none"
                  >
                    SUSCRIBIRSE
                  </Button>
                )}
              </div>
              {emailError && (
                <p className="text-red-500 text-xs">{emailError}</p>
              )}
              {emailSuccess && (
                <p className="text-green-500 text-xs flex items-center gap-1.5">
                  <Check className="size-3" />
                  ¡Suscripción exitosa!
                </p>
              )}
              <p className="text-[10px] text-neutral-600 leading-relaxed">
                Al suscribirte, aceptas nuestra política de privacidad.
              </p>
            </form>
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
            className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
          >
            <Instagram className="size-4" />
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
          >
            <Twitter className="size-4" />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-center text-neutral-600 text-xs tracking-wide">
            © 2026 KOP STUDIO. Todos los derechos reservados. | Diseñado con pasión en Colombia 🇨🇴
          </p>
        </div>
      </div>
    </footer>
  );
}