'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Truck, ShoppingBag, MessageCircle, Package, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigationStore } from '@/stores/useNavigationStore';

export default function OrderConfirmation() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [copied, setCopied] = useState(false);

  const orderNumber = useMemo(() => {
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `KOP-${digits}`;
  }, []);

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

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="max-w-lg mx-auto text-center space-y-8">
        {/* Animated Checkmark with Bounce + Confetti */}
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
          <CheckCircle2 className="size-20 text-green-500" />

          {/* Confetti particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
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

          {/* Order Number with Copy Button */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-neutral-400 text-sm font-mono">
              Orden #
            </span>
            <span className="text-white text-lg font-bold font-mono tracking-wider">
              {orderNumber}
            </span>
            <button
              onClick={handleCopyOrderNumber}
              className="p-1.5 rounded-sm bg-[#1a1a1a] border border-[#333] hover:border-[#555] transition-colors group"
              aria-label="Copiar número de orden"
            >
              <Copy
                className={`size-3.5 transition-colors ${copied ? 'text-green-500' : 'text-neutral-500 group-hover:text-white'}`}
              />
            </button>
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

        {/* Estimated Delivery */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex items-center justify-center gap-2 text-sm"
        >
          <Truck className="size-4 text-neutral-400" />
          <span className="text-neutral-400 text-xs uppercase tracking-widest font-bold">
            Envío estimado: 2-4 días hábiles
          </span>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-widest font-bold px-8 py-3.5 transition-colors"
          >
            <ShoppingBag className="size-4" />
            Seguir comprando
          </button>
          <button
            onClick={() => navigate('order-history')}
            className="flex items-center gap-2 border border-[#333] text-neutral-300 hover:bg-white hover:text-black uppercase text-xs tracking-widest font-bold px-8 py-3.5 transition-colors"
          >
            <Package className="size-4" />
            Ver mis pedidos
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="border-t border-[#1a1a1a]"
        />

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
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
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white uppercase text-xs tracking-widest font-bold px-6 py-3 transition-colors"
          >
            <MessageCircle className="size-4" fill="white" />
            WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
}