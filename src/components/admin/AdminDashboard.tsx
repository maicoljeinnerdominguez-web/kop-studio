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
import type { AdminStats, OrderStatus } from '@/types';

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
  PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SHIPPED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
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
          className={`inline-flex items-center gap-0 border ${colorClasses} hover:opacity-80 focus-visible:ring-1 focus-visible:ring-neutral-500 h-6 px-2 py-0 text-[10px] uppercase tracking-wider font-bold rounded-none bg-transparent cursor-pointer shadow-none transition-opacity`}
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
                        ? '#3b82f6'
                        : s === 'SHIPPED'
                        ? '#a855f7'
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
      value: stats ? formatPrice(stats.totalSales) : '—',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      trend: { value: '12%', up: true },
    },
    {
      label: 'Órdenes Pendientes',
      value: stats ? String(stats.pendingOrders) : '—',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      trend: { value: '5%', up: false },
    },
    {
      label: 'Productos Activos',
      value: stats ? String(stats.activeProducts) : '—',
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: { value: '3%', up: true },
    },
    {
      label: 'Total Órdenes',
      value: stats ? String(stats.totalOrders) : '—',
      icon: ShoppingBag,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: { value: '8%', up: true },
    },
  ];

  return (
    <section className="min-h-screen bg-black px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">
              PANEL DE ADMINISTRACIÓN
            </h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 hover:border-red-600/30 transition-colors duration-300"
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
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
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

        {/* Recent Orders - Mobile Cards */}
          <div className="md:hidden mb-8">
            <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Órdenes Recientes
            </h2>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-lg mb-3">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-32 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-8">No hay órdenes aún</p>
            ) : (
              recentOrders.map((order) => (
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

          {/* Recent Orders - Desktop Table */}
          <div className="hidden md:block mb-8">
          <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
            Órdenes Recientes
          </h2>
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
                        <p className="text-neutral-500 text-sm">No hay órdenes aún</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order) => {
                      const isExpanded = expandedOrders.has(order.id);
                      return (
                        <Fragment key={order.id}>
                          <TableRow
                            className={`border-b-[#1a1a1a] hover:bg-[#111] transition-colors cursor-pointer ${isExpanded ? 'bg-[#111]' : ''}`}
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

        {/* Quick Actions */}
        <div>
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


