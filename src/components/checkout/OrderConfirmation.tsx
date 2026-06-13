'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Truck, ShoppingBag, MessageCircle } from 'lucide-react';
import { useNavigationStore } from '@/stores/useNavigationStore';

export default function OrderConfirmation() {
  const navigate = useNavigationStore((s) => s.navigate);

  const orderNumber = useMemo(() => {
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `KOP-${digits}`;
  }, []);

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="max-w-lg mx-auto text-center space-y-8">
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <CheckCircle2 className="size-20 text-green-500" />
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
          <p className="text-neutral-400 text-sm">
            Orden #{orderNumber}
          </p>
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
            disabled
            className="flex items-center gap-2 border border-[#333] text-neutral-600 uppercase text-xs tracking-widest font-bold px-8 py-3.5 cursor-not-allowed"
          >
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