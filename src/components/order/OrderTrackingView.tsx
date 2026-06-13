'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Loader2,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  CreditCard,
  PackageCheck,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface TrackedOrder {
  id: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: TrackedOrderItem[];
}

interface TrackedOrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  productVariant: {
    size: string;
    color: string;
    product: {
      title: string;
      slug: string;
      images: { id: string; url: string; altText: string; isPrimary: boolean }[];
      category: { name: string } | null;
    };
  };
}

const STATUS_STEPS = [
  { label: 'Confirmado', icon: Circle },
  { label: 'Pagado', icon: CreditCard },
  { label: 'En preparación', icon: ShoppingBag },
  { label: 'Enviado', icon: Truck },
  { label: 'Entregado', icon: PackageCheck },
] as const;

const STATUS_MAP: Record<string, { label: string; color: string; step: number; dotColor: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', step: 0, dotColor: '#eab308' },
  PAID: { label: 'Pagado', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', step: 1, dotColor: '#f97316' },
  SHIPPED: { label: 'Enviado', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', step: 3, dotColor: '#f97316' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-500/20 text-green-400 border-green-500/30', step: 4, dotColor: '#22c55e' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30', step: -1, dotColor: '#ef4444' },
};

function formatCOP(amount: number) {
  return '$' + Math.round(amount).toLocaleString('es-CO');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getShortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

/* ────────────────────────────────────────────
   Status Timeline Component
   ──────────────────────────────────────────── */
function StatusTimeline({ status }: { status: string }) {
  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP.PENDING;
  const currentStep = statusInfo.step;
  const isCancelled = status === 'CANCELLED';
  const dotColor = statusInfo.dotColor;

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <XCircle className="size-5 text-red-500" />
        <span className="text-red-400 text-sm font-medium">Pedido cancelado</span>
      </div>
    );
  }

  const fillPercent = currentStep >= 0 ? (currentStep / (STATUS_STEPS.length - 1)) * 100 : 0;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-3 left-4 right-4 h-0.5 bg-[#1a1a1a]" />
        {/* Animated filled line */}
        <motion.div
          className="absolute top-3 left-4 h-0.5 bg-gradient-to-r from-red-600 to-red-700"
          initial={{ width: '0%' }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{ maxWidth: 'calc(100% - 32px)' }}
        />

        {/* Steps */}
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          const isCurrent = idx === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.label} className="relative flex flex-col items-center z-10 flex-1">
              <motion.div
                initial={{ scale: 0.7, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + idx * 0.1, duration: 0.3 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-red-600 border-red-600'
                    : 'bg-black border-[#333]'
                }`}
              >
                {isCurrent ? (
                  <span className="block w-2 h-2 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}80` }} />
                ) : isCompleted ? (
                  <CheckCircle2 className="size-3.5 text-white" />
                ) : (
                  <Icon className="size-3 text-neutral-600" />
                )}
              </motion.div>
              <span
                className={`text-[10px] mt-2 text-center leading-tight transition-colors duration-300 ${
                  isCurrent
                    ? 'text-red-500 font-bold'
                    : isCompleted
                      ? 'text-neutral-300'
                      : 'text-neutral-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Order Card Component
   ──────────────────────────────────────────── */
function OrderCard({ order }: { order: TrackedOrder }) {
  const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING;
  const subtotal = order.items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
  const shipping = order.totalAmount >= 250000 ? 0 : 15000;
  const discount = Math.max(0, subtotal + shipping - order.totalAmount);

  return (
    <div className="bg-[#111] border border-[#1a1a1a] rounded-sm">
      {/* Order Header */}
      <div className="p-4 sm:p-6 border-b border-[#1a1a1a]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-1">
              Número de pedido
            </p>
            <p className="text-white font-bold tracking-wider text-sm">
              KOP-{getShortOrderId(order.id)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
              <Clock className="size-3" />
              {formatDate(order.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 border ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusInfo.dotColor, boxShadow: `0 0 6px ${statusInfo.dotColor}60` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="px-4 sm:px-6 border-b border-[#1a1a1a]">
        <StatusTimeline status={order.status} />
      </div>

      {/* Items */}
      <div className="p-4 sm:p-6 border-b border-[#1a1a1a]">
        <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-4">
          Productos
        </p>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {order.items.map((item) => {
            const primaryImage = item.productVariant.product.images[0];
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-[#0a0a0a] border border-[#1a1a1a] p-3 hover:border-[#262626] transition-colors duration-200"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 bg-[#1a1a1a] rounded-sm flex-shrink-0 overflow-hidden">
                  {primaryImage ? (
                    <img
                      src={primaryImage.url}
                      alt={primaryImage.altText}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="size-5 text-neutral-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {item.productVariant.product.title}
                  </p>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    {item.productVariant.color} / {item.productVariant.size}
                  </p>
                </div>

                {/* Qty & Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-medium">
                    {formatCOP(item.priceAtPurchase * item.quantity)}
                  </p>
                  <p className="text-neutral-500 text-xs">
                    x{item.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <div className="p-4 sm:p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Subtotal</span>
            <span className="text-neutral-300">{formatCOP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Envío</span>
            <span className="text-neutral-300">
              {shipping === 0 ? 'GRATIS' : formatCOP(shipping)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-red-400">Descuento</span>
              <span className="text-red-400">-{formatCOP(discount)}</span>
            </div>
          )}
          <div className="border-t border-[#1a1a1a] pt-2 mt-2 flex justify-between">
            <span className="text-white font-bold">Total</span>
            <span className="text-white font-bold">{formatCOP(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Not Found State
   ──────────────────────────────────────────── */
function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center text-center py-12"
    >
      <div className="w-16 h-16 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center mb-6">
        <Package className="size-7 text-neutral-600" />
      </div>
      <h3 className="text-white font-bold text-lg uppercase tracking-wider mb-2">
        Pedido no encontrado
      </h3>
      <p className="text-neutral-400 text-sm max-w-xs mb-8">
        Verifica que el email sea correcto. No encontramos pedidos asociados a
        esa dirección.
      </p>
      <Button
        onClick={onBack}
        variant="outline"
        className="border-[#333] text-neutral-300 hover:text-white hover:bg-white/5 rounded-none uppercase text-xs tracking-wider"
      >
        <ArrowLeft className="size-4 mr-2" />
        Volver a buscar
      </Button>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────── */
export default function OrderTrackingView() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Ingresa un email válido');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(
        `/api/orders/track?email=${encodeURIComponent(trimmedEmail)}`
      );

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      setOrders(data.orders ?? []);
      setSearched(true);
    } catch {
      setError('Error al buscar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setSearched(false);
    setOrders([]);
    setEmail('');
    setError('');
  };

  return (
    <div className="min-h-[60vh] bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <AnimatePresence mode="wait">
          {!searched ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Search Form Card */}
              <div className="max-w-lg mx-auto">
                <div className="bg-[#111] border border-[#1a1a1a] p-6 sm:p-8 noise-overlay relative">
                  <div className="relative z-[2]">
                  <h1 className="text-white font-bold text-2xl sm:text-3xl uppercase tracking-wider text-center mb-1">
                    Rastrear pedido
                  </h1>
                  <div className="w-12 h-0.5 bg-red-600 mx-auto mb-4" />
                  <p className="text-neutral-400 text-sm text-center mb-8">
                    Ingresa el email con el que realizaste tu compra para ver
                    el estado de tus pedidos.
                  </p>

                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="track-email"
                        className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold"
                      >
                        Email
                      </label>
                      <Input
                        id="track-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        disabled={loading}
                        className="bg-black border-[#333] text-white placeholder:text-neutral-600 h-11 rounded-none focus-visible:border-red-600/50 transition-colors"
                      />
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-400 text-xs overflow-hidden"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-wider font-bold h-11 rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : null}
                      Buscar pedido
                    </Button>
                  </form>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : orders.length === 0 ? (
            <NotFoundState onBack={handleBackToSearch} />
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-white font-bold text-2xl sm:text-3xl uppercase tracking-wider mb-1">
                    Rastrear pedido
                  </h1>
                  <div className="w-12 h-0.5 bg-red-600 mb-2" />
                  <p className="text-neutral-400 text-sm">
                    {orders.length} {orders.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'} para{' '}
                    <span className="text-neutral-300">{email}</span>
                  </p>
                </div>
                <Button
                  onClick={handleBackToSearch}
                  variant="outline"
                  size="sm"
                  className="border-[#333] text-neutral-300 hover:text-white hover:bg-white/5 rounded-none uppercase text-[10px] tracking-wider"
                >
                  <ArrowLeft className="size-3.5 mr-1.5" />
                  Volver
                </Button>
              </div>

              {/* Order Cards */}
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}