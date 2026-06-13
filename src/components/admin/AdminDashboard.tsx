'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Clock,
  Package,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Loader2,
  ClipboardList,
  AlertTriangle,
  Pencil,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Skeleton,
} from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import AdminLogin from '@/components/layout/AdminLogin';
import type { AdminStats, OrderStatus, Product } from '@/types';

/* ─── Mini Sparkline SVG ─── */
function MiniSparkline({ color = '#dc2626' }: { color?: string }) {
  const points = [3, 12, 7, 18, 10, 22, 15, 20, 25, 18, 30, 22];
  const w = 48;
  const h = 20;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const pathData = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
  return (
    <svg className="stat-sparkline" viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={pathData} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toLocaleString('es-CO')}{suffix}</span>;
}

/* ─── Low Stock Product type ─── */
interface LowStockProduct {
  id: string;
  title: string;
  slug: string;
  totalStock: number;
}

function formatPrice(amount: number) {
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  SHIPPED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

interface OrderItemDetail {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  productVariant: {
    size: string;
    color: string;
    product: {
      title: string;
    };
  };
}

interface RecentOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  items?: OrderItemDetail[];
}

/* ─── OrderStatusSelect ─── */
function OrderStatusSelect({
  orderId,
  currentStatus,
  onStatusChange,
}: {
  orderId: string;
  currentStatus: string;
  onStatusChange: (orderId: string, newStatus: string) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const status = currentStatus as OrderStatus;

  const handleChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar');
      }

      const updated = await res.json();
      onStatusChange(orderId, updated.status);
      setFlashKey((k) => k + 1);
      toast.success(`Estado actualizado a ${STATUS_LABELS[newStatus as OrderStatus]}`);
    } catch {
      toast.error('Error al actualizar el estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const colorClasses = STATUS_COLORS[status] || STATUS_COLORS.PENDING;

  return (
    <div className="relative inline-flex">
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]/80 rounded-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
        </div>
      )}
      <Select value={status} onValueChange={handleChange}>
        <SelectTrigger
          key={flashKey}
          className={`inline-flex items-center gap-0 border ${colorClasses} hover:opacity-80 focus-visible:ring-1 focus-visible:ring-neutral-500 h-6 px-2 py-0 text-[10px] uppercase tracking-wider font-bold rounded-none bg-transparent cursor-pointer shadow-none transition-opacity ${flashKey > 0 ? 'status-flash' : ''}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="bg-[#0a0a0a] border-[#1a1a1a] rounded-none"
        >
          {ALL_STATUSES.map((s) => (
            <SelectItem
              key={s}
              value={s}
              className={`text-xs uppercase tracking-wider font-medium rounded-none focus:bg-[#1a1a1a] ${
                STATUS_COLORS[s]
              } cursor-pointer`}
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      s === 'PENDING'
                        ? '#eab308'
                        : s === 'PAID'
                        ? '#10b981'
                        : s === 'SHIPPED'
                        ? '#f97316'
                        : s === 'DELIVERED'
                        ? '#22c55e'
                        : '#ef4444',
                  }}
                />
                {STATUS_LABELS[s]}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ─── OrderItemsRow ─── */
function OrderItemsRow({ items }: { items: OrderItemDetail[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="bg-[#080808] border-t border-[#1a1a1a] px-4 py-3">
        <Table>
          <TableHeader>
            <TableRow className="border-b-[#1a1a1a] hover:bg-transparent">
              <TableHead className="text-neutral-500 text-[10px] uppercase tracking-wider font-medium">
                Producto
              </TableHead>
              <TableHead className="text-neutral-500 text-[10px] uppercase tracking-wider font-medium">
                Talla
              </TableHead>
              <TableHead className="text-neutral-500 text-[10px] uppercase tracking-wider font-medium">
                Color
              </TableHead>
              <TableHead className="text-neutral-500 text-[10px] uppercase tracking-wider font-medium text-center">
                Cantidad
              </TableHead>
              <TableHead className="text-neutral-500 text-[10px] uppercase tracking-wider font-medium text-right">
                Precio Unitario
              </TableHead>
              <TableHead className="text-neutral-500 text-[10px] uppercase tracking-wider font-medium text-right">
                Subtotal
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="border-b-[#111] hover:bg-transparent">
                <TableCell className="text-neutral-300 text-xs">
                  {item.productVariant.product.title}
                </TableCell>
                <TableCell className="text-neutral-400 text-xs">{item.productVariant.size}</TableCell>
                <TableCell className="text-neutral-400 text-xs">{item.productVariant.color}</TableCell>
                <TableCell className="text-neutral-400 text-xs text-center">{item.quantity}</TableCell>
                <TableCell className="text-neutral-300 text-xs text-right">
                  {formatPrice(item.priceAtPurchase)}
                </TableCell>
                <TableCell className="text-white text-xs font-medium text-right">
                  {formatPrice(item.priceAtPurchase * item.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

/* ─── AdminDashboard ─── */
export default function AdminDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigationStore((s) => s.navigate);
  const logout = useAuthStore((s) => s.logout);

  const [showLogin, setShowLogin] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setShowLogin(false);
    fetchAdminData();
  }, [isAuthenticated]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStats({
        totalSales: data.totalSales,
        pendingOrders: data.pendingOrders,
        activeProducts: data.activeProducts,
        totalOrders: data.totalOrders,
      });
      setRecentOrders(data.recentOrders || []);
    } catch {
      toast.error('Error al cargar datos del panel');
    } finally {
      setLoading(false);
    }

    // Fetch low stock products
    try {
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const products: Product[] = await productsRes.json();
        const lowStock: LowStockProduct[] = products
          .map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            totalStock: p.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
          }))
          .filter((p) => p.totalStock < 5)
          .sort((a, b) => a.totalStock - b.totalStock);
        setLowStockProducts(lowStock);
      }
    } catch {
      // silently fail
    }
  };

  const handleStatusChange = useCallback((orderId: string, newStatus: string) => {
    setRecentOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }, []);

  const toggleExpand = useCallback(async (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-white text-lg font-bold uppercase tracking-wider text-center mb-6">
            PANEL DE ADMINISTRACIÓN
          </h1>
          <AdminLogin open={showLogin} onOpenChange={setShowLogin} />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Ventas Totales',
      value: stats?.totalSales ?? 0,
      displayValue: stats ? (
        <span className="flex items-center">
          <AnimatedCounter value={stats.totalSales} prefix="$" />
          <MiniSparkline color="#22c55e" />
        </span>
      ) : (
        <span>—</span>
      ),
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      trend: { value: '12%', up: true },
    },
    {
      label: 'Órdenes Pendientes',
      value: stats?.pendingOrders ?? 0,
      displayValue: stats ? (
        <span className="flex items-center">
          <AnimatedCounter value={stats.pendingOrders} />
          <MiniSparkline color="#eab308" />
        </span>
      ) : (
        <span>—</span>
      ),
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      trend: { value: '5%', up: false },
    },
    {
      label: 'Productos Activos',
      value: stats?.activeProducts ?? 0,
      displayValue: stats ? (
        <span className="flex items-center">
          <AnimatedCounter value={stats.activeProducts} />
          <MiniSparkline color="#f87171" />
        </span>
      ) : (
        <span>—</span>
      ),
      icon: Package,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      trend: { value: '3%', up: true },
    },
    {
      label: 'Total Órdenes',
      value: stats?.totalOrders ?? 0,
      displayValue: stats ? (
        <span className="flex items-center">
          <AnimatedCounter value={stats.totalOrders} />
          <MiniSparkline color="#fb923c" />
        </span>
      ) : (
        <span>—</span>
      ),
      icon: ShoppingBag,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      trend: { value: '8%', up: true },
    },
  ];

  return (
    <section className="min-h-screen bg-black px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">
              PANEL DE ADMINISTRACIÓN
            </h1>
            <div className="h-[2px] w-16 bg-red-600 mt-2" />
            <p className="text-neutral-500 text-xs mt-1 uppercase tracking-wider">
              Gestiona tu tienda
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('home')}
              className="border-neutral-700 text-white hover:bg-neutral-800 uppercase text-xs tracking-wider font-bold rounded-none h-9 px-4"
            >
              VOLVER A LA TIENDA
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-neutral-500 hover:text-red-500 uppercase text-xs tracking-wider font-bold rounded-none h-9 px-4"
            >
              SALIR
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(220, 38, 38, 0.08)' }}
                className={`bg-[#0a0a0a] border border-[#1a1a1a] p-5 hover:border-red-600/30 transition-all duration-300 cursor-default ${idx === 0 ? 'animated-gradient-border pulse-glow-red' : ''}`}
              >
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.displayValue}</p>
                    <p className="text-neutral-500 text-xs uppercase tracking-wider mt-1">
                      {card.label}
                    </p>
                    {card.trend && (
                      <span className={`text-[10px] font-bold ${card.trend.up ? 'text-green-500' : 'text-red-500'}`}>
                        {card.trend.up ? '↑' : '↓'} {card.trend.value}
                      </span>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Two-column layout: Recent Activity + Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Recent Activity - takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-0.5 w-12 bg-red-600" />
              <Clock className="size-4 text-neutral-500" />
              <h2 className="text-white text-sm font-bold uppercase tracking-wider">
                Actividad Reciente
              </h2>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-lg mb-3">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-3 w-32 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : recentOrders.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a]] p-8 text-center">
                  <p className="text-neutral-500 text-sm">No hay actividad reciente</p>
                </div>
              ) : (
                recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => toggleExpand(order.id)}
                    className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-lg mb-3 cursor-pointer hover:bg-[#111] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-xs font-mono font-bold">#{order.id.slice(0, 8)}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-bold border px-2 py-0.5 rounded-sm ${STATUS_COLORS[order.status as OrderStatus] || STATUS_COLORS.PENDING}`}>
                        {STATUS_LABELS[order.status as OrderStatus] || order.status}
                      </span>
                    </div>
                    <p className="text-neutral-300 text-xs mb-1">
                      {order.user?.name || order.user?.email || 'Guest'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-bold">{formatPrice(order.totalAmount)}</span>
                      <span className="text-neutral-500 text-xs">{formatDate(order.createdAt)}</span>
                    </div>
                    <AnimatePresence>
                      {expandedOrders.has(order.id) && order.items && order.items.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-[#1a1a1a] overflow-hidden"
                        >
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs py-1">
                              <span className="text-neutral-300">{item.productVariant.product.title} ({item.productVariant.size}/{item.productVariant.color}) ×{item.quantity}</span>
                              <span className="text-white font-medium">{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-[#1a1a1a] hover:bg-transparent">
                        <TableHead className="w-8" />
                        <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                          Orden ID
                        </TableHead>
                        <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                          Cliente
                        </TableHead>
                        <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                          Total
                        </TableHead>
                        <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                          Estado
                        </TableHead>
                        <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                          Fecha
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i} className="border-b-[#1a1a1a] hover:bg-transparent">
                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          </TableRow>
                        ))
                      ) : recentOrders.length === 0 ? (
                        <TableRow className="border-b-0 hover:bg-transparent">
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-neutral-500 text-sm">No hay actividad reciente</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentOrders.slice(0, 5).map((order, idx) => {
                          const isExpanded = expandedOrders.has(order.id);
                          return (
                            <Fragment key={order.id}>
                              <TableRow
                                className={`border-b-[#1a1a1a] hover:bg-white/[0.02] transition-colors cursor-pointer row-hover-highlight ${isExpanded ? 'bg-[#111]' : idx % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-white/[0.015]'}`}
                                onClick={() => toggleExpand(order.id)}
                              >
                                <TableCell className="w-8">
                                  <button
                                    className="text-neutral-500 hover:text-white transition-colors"
                                    aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </button>
                                </TableCell>
                                <TableCell className="text-white text-xs font-mono">
                                  #{order.id.slice(0, 8)}
                                </TableCell>
                                <TableCell className="text-white text-xs">
                                  {order.user?.name || order.user?.email || 'Guest'}
                                </TableCell>
                                <TableCell className="text-white text-xs font-medium">
                                  {formatPrice(order.totalAmount)}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <OrderStatusSelect
                                    orderId={order.id}
                                    currentStatus={order.status}
                                    onStatusChange={handleStatusChange}
                                  />
                                </TableCell>
                                <TableCell className="text-neutral-400 text-xs">
                                  {formatDate(order.createdAt)}
                                </TableCell>
                              </TableRow>
                              <AnimatePresence>
                                {isExpanded && order.items && order.items.length > 0 && (
                                  <TableRow className="border-b-[#1a1a1a] hover:bg-transparent p-0">
                                    <TableCell colSpan={6} className="p-0">
                                      <OrderItemsRow items={order.items} />
                                    </TableCell>
                                  </TableRow>
                                )}
                              </AnimatePresence>
                            </Fragment>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts - 1 column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="size-4 text-yellow-500" />
              <h2 className="text-white text-sm font-bold uppercase tracking-wider">
                Alerta de Stock Bajo
              </h2>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  ))}
                </div>
              ) : lowStockProducts.length === 0 ? (
                <div className="p-6 text-center">
                  <Package className="size-8 text-neutral-700 mx-auto mb-2" />
                  <p className="text-neutral-500 text-xs">Todo el inventario está bien</p>
                </div>
              ) : (
                <div className="divide-y divide-[#1a1a1a]">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[#111] transition-colors"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="text-white text-xs font-medium truncate">
                          {product.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-xs font-bold ${
                            product.totalStock === 0
                              ? 'text-red-500'
                              : 'text-yellow-500'
                          }`}
                        >
                          {product.totalStock === 0 ? 'AGOTADO' : `${product.totalStock} uds`}
                        </span>
                        <button
                          onClick={() => navigate('admin-products-edit', { id: product.id })}
                          className="p-1 hover:bg-[#222] rounded-sm transition-colors"
                          aria-label={`Editar ${product.title}`}
                        >
                          <Pencil size={12} className="text-neutral-500 hover:text-white transition-colors" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={() => navigate('admin-products')}
              className="bg-[#0a0a0a] border border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-neutral-600 uppercase text-xs tracking-wider font-bold rounded-none h-10 px-5 justify-start sm:justify-center"
            >
              <Package className="w-4 h-4 mr-2" />
              GESTIONAR PRODUCTOS
            </Button>
            <Button
              onClick={() => navigate('admin-products-new')}
              className="bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-wider font-bold rounded-none h-10 px-5 justify-start sm:justify-center"
            >
              CREAR NUEVO PRODUCTO
            </Button>
            <Button
              onClick={() => toast.info('Vista de órdenes completas próximamente')}
              className="bg-[#0a0a0a] border border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-neutral-600 uppercase text-xs tracking-wider font-bold rounded-none h-10 px-5 justify-start sm:justify-center"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              VER ÓRDENES COMPLETAS
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}