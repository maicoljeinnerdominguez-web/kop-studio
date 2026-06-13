'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  ChevronRight,
  ShoppingBag,
  Loader2,
  ImageOff,
} from 'lucide-react';
import { useNavigationStore } from '@/stores/useNavigationStore';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  productVariant: {
    id: string;
    size: string;
    color: string;
    product: {
      id: string;
      title: string;
      slug: string;
      images: { id: string; url: string; altText: string; isPrimary: boolean }[];
      category: { name: string } | null;
    };
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  customerEmail: string | null;
  createdAt: string;
  items: OrderItem[];
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
function formatCOP(amount: number) {
  return '$' + Math.round(amount).toLocaleString('es-CO');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getShortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

const STATUS_CONFIG: Record<string, { label: string; className: string; borderColor: string }> = {
  PENDING: {
    label: 'Pendiente',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    borderColor: '#eab308',
  },
  PAID: {
    label: 'Pagado',
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    borderColor: '#f97316',
  },
  PREPARING: {
    label: 'En preparación',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    borderColor: '#eab308',
  },
  SHIPPED: {
    label: 'Enviado',
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    borderColor: '#f97316',
  },
  DELIVERED: {
    label: 'Entregado',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    borderColor: '#22c55e',
  },
  CANCELLED: {
    label: 'Cancelado',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    borderColor: '#ef4444',
  },
};

function getStatusBadge(status: string) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span
      className={`inline-flex items-center text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 border-l-2 border-l-[${config.borderColor}] ${config.className}`}
      style={{ borderLeftColor: config.borderColor }}
    >
      {config.label}
    </span>
  );
}

/* ────────────────────────────────────────────
   Product Thumbnail
   ──────────────────────────────────────────── */
function ProductThumb({ item }: { item: OrderItem }) {
  const primaryImage = item.productVariant.product.images.find((img) => img.isPrimary);
  const fallbackImage = item.productVariant.product.images[0];
  const imageUrl = primaryImage?.url || fallbackImage?.url;

  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#111] border border-[#222] rounded overflow-hidden shrink-0 relative group">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item.productVariant.product.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageOff className="size-4 text-neutral-600" />
        </div>
      )}
      {item.quantity > 1 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
          {item.quantity}
        </span>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Order Card
   ──────────────────────────────────────────── */
function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.5)' }}
      transition={{ duration: 0.25 }}
      className="bg-[#0a0a0a] border border-[#1a1a1a] hover:border-red-600/30 transition-all duration-300 p-4 sm:p-6 cursor-default"
    >
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <Package className="size-4 text-neutral-500" />
          <div>
            <p className="text-white text-sm font-bold tracking-wide uppercase">
              #{getShortOrderId(order.id)}
            </p>
            <p className="text-neutral-500 text-xs mt-0.5">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(order.status)}
          <span className="text-white text-sm font-bold">
            {formatCOP(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Product Thumbnails */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
        {order.items.map((item) => (
          <ProductThumb key={item.id} item={item} />
        ))}
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('order-tracking', { orderId: order.id })}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs uppercase tracking-widest font-bold transition-colors group"
        >
          Ver detalle
          <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Empty State
   ──────────────────────────────────────────── */
function EmptyState() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-20 h-20 bg-[#111] border border-[#222] rounded-full flex items-center justify-center mb-6">
        <Package className="size-8 text-neutral-600" />
      </div>
      <h2 className="text-white text-lg font-bold uppercase tracking-wider mb-2">
        Aún no tienes pedidos
      </h2>
      <p className="text-neutral-500 text-sm text-center max-w-sm mb-8">
        Explora nuestra colección y realiza tu primera compra. No te arrepentirás.
      </p>
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-widest font-bold px-8 py-3.5 transition-colors"
      >
        <ShoppingBag className="size-4" />
        Explorar tienda
      </button>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Main View
   ──────────────────────────────────────────── */
export default function OrderHistoryView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Error al cargar los pedidos');
        const data = await res.json();
        setOrders(data);
      } catch {
        setError('No se pudieron cargar tus pedidos. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-[60vh]">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs">
          <li>
            <button
              onClick={() => navigate('home')}
              className="text-neutral-500 hover:text-white uppercase tracking-widest font-medium transition-colors"
            >
              Inicio
            </button>
          </li>
          <li>
            <ChevronRight className="size-3 text-neutral-700" />
          </li>
          <li className="text-white uppercase tracking-widest font-bold">
            Mis Pedidos
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
          Mis Pedidos
        </h1>
        <div className="h-[1px] bg-gradient-to-r from-red-600/60 via-red-600/20 to-transparent mt-3" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="size-8 text-red-600 animate-spin" />
              <p className="text-sm text-neutral-500 tracking-widest">CARGANDO PEDIDOS...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-white text-xs uppercase tracking-widest font-bold border border-[#333] hover:bg-white hover:text-black px-6 py-2.5 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <div key={order.id} className={`stagger-fade-in stagger-${Math.min(idx + 1, 5)}`}>
              <OrderCard order={order} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

