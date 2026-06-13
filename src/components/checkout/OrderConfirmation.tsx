'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Truck, ShoppingBag, MessageCircle, Package, Copy, PackageCheck, Clock, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigationStore } from '@/stores/useNavigationStore';

const TRACKER_STEPS = [
  { label: 'Pedido confirmado', icon: CheckCircle2 },
  { label: 'En preparación', icon: Package },
  { label: 'Enviado', icon: Truck },
  { label: 'Entregado', icon: PackageCheck },
];

const CONFETTI_COLORS = ['#dc2626', '#ef4444', '#ffffff', '#991b1b', '#f87171', '#fbbf24'];

function getBusinessDaysFromNow(minDays: number, maxDays: number) {
  const addBusinessDays = (date: Date, days: number) => {
    let d = new Date(date);
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) added++;
    }
    return d;
  };
  const now = new Date();
  const from = addBusinessDays(now, minDays);
  const to = addBusinessDays(now, maxDays);
  const fmt = (d: Date) =>
    d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  return { from: fmt(from), to: fmt(to) };
}

export default function OrderConfirmation() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [copied, setCopied] = useState(false);

  const orderNumber = useMemo(() => {
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `KOP-${digits}`;
  }, []);

  const deliveryEstimate = useMemo(() => getBusinessDaysFromNow(3, 5), []);

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast.success('Número de orden copiado');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  const handleShareOrder = async () => {
    const text = `¡Acabo de hacer un pedido en KOP STUDIO! Orden: ${orderNumber}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'KOP STUDIO - Pedido', text });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('¡Pedido copiado al portapapeles!');
      } catch {
        toast.error('No se pudo compartir');
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center py-20 px-4 overflow-hidden">
      {/* Floating particle background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: i % 4 === 0 ? '#dc2626' : i % 4 === 1 ? '#ffffff' : '#404040',
              left: `${(i * 13 + 5) % 100}%`,
              bottom: '-10px',
            }}
            animate={{
              y: [0, -600 - Math.random() * 400],
              opacity: [0, 0.6, 0.6, 0],
              rotate: [0, 180 + Math.random() * 360],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              delay: i * 0.4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Confetti burst on mount — 24 pieces falling from top */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {Array.from({ length: 24 }).map((_, i) => {
          const isCircle = i % 3 === 0;
          const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
          const left = `${5 + (i * 4.1) % 90}%`;
          const size = 4 + (i % 4) * 2;
          return (
            <div
              key={`confetti-${i}`}
              className="confetti-piece absolute"
              style={{
                left,
                top: '-10px',
                width: `${size}px`,
                height: isCircle ? `${size}px` : `${size * 1.5}px`,
                backgroundColor: color,
                borderRadius: isCircle ? '50%' : '1px',
                ['--fall-duration' as string]: `${1.5 + (i % 5) * 0.4}s`,
                ['--fall-delay' as string]: `${i * 0.06}s`,
              }}
            />
          );
        })}
      </div>

      <div className="max-w-lg mx-auto text-center space-y-8 relative z-10">
        {/* Animated Checkmark with Pulsing Glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="flex justify-center relative"
        >
          {/* Pulsing glow behind checkmark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-green-500/10 pulsing-glow-green" />
          </div>
          <CheckCircle2 className="size-20 text-green-500 relative z-10" />

          {/* Confetti particles (original smaller burst) */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`micro-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: i % 3 === 0 ? '#dc2626' : i % 3 === 1 ? '#ffffff' : '#991b1b',
                  left: `${10 + (i * 7) % 80}%`,
                  top: '50%',
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: -60 - Math.random() * 80,
                  opacity: 0,
                  scale: 0,
                  x: (Math.random() - 0.5) * 60,
                }}
                transition={{
                  duration: 1 + Math.random() * 0.5,
                  delay: 0.3 + i * 0.05,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
            ¡PEDIDO CONFIRMADO!
          </h1>

          {/* Order Number with Copy Button + Tooltip */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-neutral-400 text-sm font-mono">
              Orden #
            </span>
            <span className="text-white text-lg font-bold font-mono tracking-wider">
              {orderNumber}
            </span>
            <div className="relative group">
              <button
                onClick={handleCopyOrderNumber}
                className={`p-1.5 bg-[#1a1a1a] border transition-all duration-200 group-hover/btn:scale-105 ${
                  copied ? 'border-green-500/50 bg-green-500/10' : 'border-[#333] hover:border-[#555]'
                }`}
                aria-label="Copiar número de orden"
              >
                <Copy
                  className={`size-3.5 transition-colors ${copied ? 'text-green-500' : 'text-neutral-500 group-hover/btn:text-white'}`}
                />
              </button>
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#222] border border-[#333] text-[9px] uppercase tracking-widest text-neutral-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {copied ? '¡Copiado!' : 'Copiar'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#333]" />
              </div>
            </div>
            {copied && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-green-500 text-[10px] uppercase tracking-widest font-bold"
              >
                Copiado
              </motion.span>
            )}
          </div>

          <p className="text-neutral-400 text-sm leading-relaxed">
            Gracias por tu compra. Recibirás un email de confirmación con los
            detalles de tu pedido.
          </p>
        </motion.div>

        {/* Animated Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between relative">
            {/* Background line */}
            <div className="absolute top-[10px] left-5 right-5 h-px bg-[#1a1a1a]" />
            {/* Filled line */}
            <motion.div
              className="absolute top-[10px] left-5 h-px bg-red-600"
              initial={{ width: '0%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            {TRACKER_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isFirst = idx === 0;
              return (
                <div key={step.label} className="relative flex flex-col items-center z-10 flex-1">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.15, type: 'spring', stiffness: 200 }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isFirst
                        ? 'bg-red-600 border-red-600'
                        : 'bg-black border-[#333]'
                    }`}
                  >
                    {isFirst ? (
                      <CheckCircle2 className="size-3 text-white" />
                    ) : (
                      <Icon className="size-2.5 text-neutral-600" />
                    )}
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + idx * 0.15 }}
                    className={`text-[9px] mt-2 text-center leading-tight ${
                      isFirst
                        ? 'text-red-500 font-bold'
                        : 'text-neutral-600'
                    }`}
                  >
                    {step.label}
                  </motion.span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Estimated Delivery — calculated 3-5 business days */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-neutral-400" />
            <span className="text-neutral-400 text-xs uppercase tracking-widest font-bold">
              Envío estimado
            </span>
          </div>
          <p className="text-white text-sm font-bold">
            {deliveryEstimate.from} — {deliveryEstimate.to}
          </p>
          <p className="text-neutral-500 text-[11px]">
            3-5 días hábiles
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-widest font-bold px-8 py-3.5 transition-colors btn-press"
          >
            <ShoppingBag className="size-4" />
            Seguir comprando
          </button>
          <button
            onClick={() => navigate('order-history')}
            className="flex items-center gap-2 border border-[#333] text-neutral-300 hover:bg-white hover:text-black uppercase text-xs tracking-widest font-bold px-8 py-3.5 transition-colors btn-press"
          >
            <Package className="size-4" />
            Ver mis pedidos
          </button>
          <button
            onClick={handleShareOrder}
            className="flex items-center gap-2 border border-[#333] text-neutral-300 hover:border-white hover:text-white uppercase text-xs tracking-widest font-bold px-6 py-3.5 transition-all duration-200 btn-press"
          >
            <Share2 className="size-4" />
            Compartir mi pedido
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          className="h-px bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent"
        />

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="space-y-3"
        >
          <p className="text-white text-xs uppercase tracking-widest font-bold">
            ¿Necesitas ayuda?
          </p>
          <p className="text-neutral-400 text-sm">
            Si tienes alguna pregunta sobre tu pedido, contáctanos por WhatsApp.
          </p>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white uppercase text-xs tracking-widest font-bold px-6 py-3 transition-colors btn-press"
          >
            <MessageCircle className="size-4" fill="white" />
            WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
}