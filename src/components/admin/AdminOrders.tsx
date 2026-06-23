'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronRight,
  MapPin,
  User,
  Mail,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/stores/useNavigationStore';
import type { OrderStatus } from '@/types';

/* ─── Types ─── */
interface AdminOrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  productVariant: {
    id: string;
    size: string;
    color: string;
    product: {
      title: string;
      images: { id: string; url: string; altText: string; isPrimary: boolean }[];
    };
  };
}

interface AdminOrder {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  customerEmail: string | null;
  createdAt: string;
  user: { name: string; email: string };
  items: AdminOrderItem[];
  _count: { items: number };
}

interface AdminOrderDetail extends Omit<AdminOrder, '_count' | 'user'> {
  user: { name: string; email: string; phone: string | null };
  items: AdminOrderItem[];
}

/* ─── Helpers ─── */
function formatPrice(amount: number) {
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  });
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: typeof Clock }
> = {
  PENDING: {
    label: 'Pendiente',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: Clock,
  },
  PAID: {
    label: 'Pagado',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: CheckCircle,
  },
  SHIPPED: {
    label: 'Enviado',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: XCircle,
  },
};

const STATUS_FLOW: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
const ALL_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'PAID', label: 'Pagadas' },
  { value: 'SHIPPED', label: 'Enviadas' },
  { value: 'DELIVERED', label: 'Entregadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

/* ─── Component ─── */
export default function AdminOrders() {
  const navigate = useNavigationStore((s) => s.navigate);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Detail sheet
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailStatusLoading, setDetailStatusLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        activeFilter === 'ALL'
          ? '/api/admin/orders'
          : `/api/admin/orders?status=${activeFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      // Also update detail if open
      if (detailOrder && detailOrder.id === orderId) {
        setDetailOrder((prev) => (prev ? { ...prev, status: newStatus as OrderStatus } : prev));
      }
      toast.success(`Estado actualizado a ${STATUS_CONFIG[newStatus as OrderStatus].label}`);
    } catch {
      toast.error('Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetail = async (orderId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDetailOrder(data);
    } catch {
      toast.error('Error al cargar detalle de orden');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDetailStatusChange = async (newStatus: string) => {
    if (!detailOrder) return;
    setDetailStatusLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${detailOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setDetailOrder(updated);
      setOrders((prev) =>
        prev.map((o) => (o.id === detailOrder.id ? updated : o))
      );
      toast.success(`Estado actualizado a ${STATUS_CONFIG[newStatus as OrderStatus].label}`);
    } catch {
      toast.error('Error al actualizar estado');
    } finally {
      setDetailStatusLoading(false);
    }
  };

  const filteredOrders = orders;

  return (
    <section className="min-h-screen bg-black px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('admin-dashboard')}
              className="flex items-center justify-center w-9 h-9 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors flex-shrink-0"
              aria-label="Volver al Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">
                GESTIÓN DE ÓRDENES
              </h1>
              {!loading && (
                <p className="text-neutral-500 text-xs mt-1 uppercase tracking-wider">
                  {orders.length} orden{orders.length !== 1 ? 'es' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border transition-colors rounded-none ${
                activeFilter === opt.value
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-transparent border-[#262626] text-neutral-400 hover:text-white hover:border-neutral-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-[#1a1a1a] hover:bg-transparent">
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium w-8" />
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Orden ID
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Cliente
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden md:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden sm:table-cell">
                    Items
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Total
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden lg:table-cell">
                    Estado
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden md:table-cell">
                    Fecha
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b-[#1a1a1a] hover:bg-transparent">
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow className="border-b-0 hover:bg-transparent">
                    <TableCell colSpan={9} className="text-center py-12">
                      <Package className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                      <p className="text-neutral-500 text-sm">
                        {activeFilter !== 'ALL'
                          ? `No hay órdenes ${STATUS_CONFIG[activeFilter as OrderStatus]?.label.toLowerCase() || ''}`
                          : 'No hay órdenes aún'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const statusCfg = STATUS_CONFIG[order.status];
                    const StatusIcon = statusCfg.icon;
                    const isExpanded = expandedId === order.id;

                    return (
                      <FragmentWrapper key={order.id}>
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b-[#1a1a1a] hover:bg-[#111] transition-colors cursor-pointer"
                          onClick={() => openDetail(order.id)}
                        >
                          <TableCell>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedId(isExpanded ? null : order.id);
                              }}
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
                          <TableCell>
                            <p className="text-white text-xs font-mono">
                              {order.id.slice(0, 8)}...
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-white text-xs font-medium truncate max-w-[140px]">
                              {order.user?.name || 'N/A'}
                            </p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-neutral-400 text-xs truncate max-w-[180px]">
                              {order.customerEmail || order.user?.email || '—'}
                            </p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <p className="text-white text-xs text-center">
                              {order._count.items}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-white text-xs font-medium">
                              {formatPrice(order.totalAmount)}
                            </p>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge
                              variant="outline"
                              className={`${statusCfg.color} ${statusCfg.bg} ${statusCfg.border} text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-none border`}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-neutral-400 text-xs">
                              {formatDateShort(order.createdAt)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDetail(order.id);
                                }}
                                className="h-8 w-8 p-0 rounded-none hover:bg-[#1a1a1a] text-neutral-400 hover:text-white"
                                title="Ver detalle"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <div
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Select
                                  value={order.status}
                                  onValueChange={(val) =>
                                    handleStatusChange(order.id, val)
                                  }
                                  disabled={updatingId === order.id}
                                >
                                  <SelectTrigger className="h-8 w-[120px] bg-[#1a1a1a] border-[#262626] text-white text-[10px] uppercase tracking-wider rounded-none focus:border-red-600">
                                    {updatingId === order.id ? (
                                      <span className="flex items-center gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      </span>
                                    ) : (
                                      <SelectValue />
                                    )}
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#0a0a0a] border-[#262626] rounded-none">
                                    {ALL_STATUSES.map((s) => {
                                      const sc = STATUS_CONFIG[s];
                                      return (
                                        <SelectItem
                                          key={s}
                                          value={s}
                                          className={`${sc.color} text-xs uppercase tracking-wider focus:${sc.bg} rounded-none`}
                                        >
                                          {sc.label}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </TableCell>
                        </motion.tr>

                        {/* Expanded Items Row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-b-[#1a1a1a]"
                            >
                              <TableCell colSpan={9} className="p-0">
                                <div className="bg-[#111] p-4 md:p-6">
                                  <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold mb-3">
                                    Items de la orden
                                  </p>
                                  <div className="space-y-2">
                                    {order.items.map((item) => {
                                      const productTitle = item.productVariant?.product?.title || 'Producto';
                                      const primaryImage = item.productVariant?.product?.images?.[0]?.url;
                                      return (
                                        <div
                                          key={item.id}
                                          className="flex items-center gap-3 bg-[#0a0a0a] border border-[#1a1a1a] p-3"
                                        >
                                          <div className="w-10 h-10 bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                                            {primaryImage ? (
                                              <img
                                                src={primaryImage}
                                                alt={productTitle}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-4 h-4 text-neutral-600" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs font-medium truncate">
                                              {productTitle}
                                            </p>
                                            <p className="text-neutral-500 text-[10px]">
                                              Talla: {item.productVariant?.size || '—'} · Color:{' '}
                                              {item.productVariant?.color || '—'}
                                            </p>
                                          </div>
                                          <div className="text-right flex-shrink-0">
                                            <p className="text-white text-xs font-medium">
                                              {formatPrice(item.priceAtPurchase)}
                                            </p>
                                            <p className="text-neutral-500 text-[10px]">
                                              x{item.quantity}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </TableCell>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </FragmentWrapper>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* ─── Order Detail Sheet ─── */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent
          side="right"
          className="bg-[#0a0a0a] border-[#262626] sm:max-w-lg w-full p-0 overflow-y-auto"
        >
          {detailLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : detailOrder ? (
            <div>
              {/* Sheet Header */}
              <SheetHeader className="p-6 pb-4">
                <div className="flex items-center justify-between pr-6">
                  <div>
                    <SheetTitle className="text-white text-lg font-bold uppercase tracking-wider">
                      Orden {detailOrder.id.slice(0, 8)}...
                    </SheetTitle>
                    <SheetDescription className="text-neutral-500 text-xs mt-1">
                      {formatDate(detailOrder.createdAt)}
                    </SheetDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${STATUS_CONFIG[detailOrder.status].color} ${STATUS_CONFIG[detailOrder.status].bg} ${STATUS_CONFIG[detailOrder.status].border} text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-none border`}
                  >
                    {STATUS_CONFIG[detailOrder.status].label}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="px-6 pb-6 space-y-6">
                {/* Status Timeline */}
                <div>
                  <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold mb-3">
                    Estado de la orden
                  </p>
                  <div className="flex items-center gap-0">
                    {STATUS_FLOW.map((step, idx) => {
                      const stepIdx = STATUS_FLOW.indexOf(detailOrder.status);
                      const isCancelled = detailOrder.status === 'CANCELLED';
                      const isCompleted = !isCancelled && stepIdx >= idx;
                      const isCurrent = !isCancelled && stepIdx === idx;
                      const StepIcon = STATUS_CONFIG[step].icon;

                      return (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 flex items-center justify-center border transition-colors ${
                                isCancelled
                                  ? 'border-neutral-700 bg-[#1a1a1a]'
                                  : isCurrent
                                    ? 'border-red-600 bg-red-600'
                                    : isCompleted
                                      ? 'border-red-600 bg-red-600/20'
                                      : 'border-neutral-700 bg-[#1a1a1a]'
                              }`}
                            >
                              <StepIcon
                                className={`w-3.5 h-3.5 ${
                                  isCancelled
                                    ? 'text-neutral-600'
                                    : isCompleted || isCurrent
                                      ? 'text-white'
                                      : 'text-neutral-600'
                                }`}
                              />
                            </div>
                            <span
                              className={`text-[9px] uppercase tracking-wider mt-1 ${
                                isCancelled
                                  ? 'text-neutral-600'
                                  : isCompleted || isCurrent
                                    ? 'text-white'
                                    : 'text-neutral-600'
                              }`}
                            >
                              {STATUS_CONFIG[step].label}
                            </span>
                          </div>
                          {idx < STATUS_FLOW.length - 1 && (
                            <div
                              className={`flex-1 h-px mx-1 mb-4 ${
                                isCancelled
                                  ? 'bg-neutral-800'
                                  : stepIdx > idx
                                    ? 'bg-red-600'
                                    : 'bg-neutral-800'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                    {/* Cancelled indicator */}
                    {detailOrder.status === 'CANCELLED' && (
                      <div className="flex items-center flex-none ml-2">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 flex items-center justify-center border border-red-600 bg-red-600/20">
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          </div>
                          <span className="text-[9px] uppercase tracking-wider mt-1 text-red-400">
                            Cancelada
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-[#1a1a1a]" />

                {/* Customer Info */}
                <div>
                  <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold mb-3">
                    Información del cliente
                  </p>
                  <div className="bg-[#111] border border-[#1a1a1a] p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                      <p className="text-white text-xs">{detailOrder.user?.name || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                      <p className="text-neutral-400 text-xs">
                        {detailOrder.customerEmail || detailOrder.user?.email || '—'}
                      </p>
                    </div>
                    {detailOrder.user?.phone && (
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                        <p className="text-neutral-400 text-xs">{detailOrder.user.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold mb-3">
                    Dirección de envío
                  </p>
                  <div className="bg-[#111] border border-[#1a1a1a] p-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0 mt-0.5" />
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        {detailOrder.shippingAddress || 'No especificada'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#1a1a1a]" />

                {/* Order Items */}
                <div>
                  <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold mb-3">
                    Productos ({detailOrder.items.length})
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {detailOrder.items.map((item) => {
                      const productTitle =
                        item.productVariant?.product?.title || 'Producto';
                      const primaryImage =
                        item.productVariant?.product?.images?.[0]?.url;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 bg-[#111] border border-[#1a1a1a] p-3"
                        >
                          <div className="w-14 h-14 bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                            {primaryImage ? (
                              <img
                                src={primaryImage}
                                alt={productTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-neutral-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">
                              {productTitle}
                            </p>
                            <p className="text-neutral-500 text-[10px] mt-0.5">
                              Talla: {item.productVariant?.size || '—'} · Color:{' '}
                              {item.productVariant?.color || '—'}
                            </p>
                            <p className="text-neutral-500 text-[10px]">
                              Cantidad: {item.quantity} × {formatPrice(item.priceAtPurchase)}
                            </p>
                          </div>
                          <p className="text-white text-xs font-bold flex-shrink-0">
                            {formatPrice(item.priceAtPurchase * item.quantity)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator className="bg-[#1a1a1a]" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <p className="text-neutral-400 text-xs uppercase tracking-wider font-bold">
                    Total
                  </p>
                  <p className="text-white text-lg font-bold">
                    {formatPrice(detailOrder.totalAmount)}
                  </p>
                </div>

                <Separator className="bg-[#1a1a1a]" />

                {/* Change Status */}
                <div>
                  <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold mb-3">
                    Cambiar estado
                  </p>
                  <Select
                    value={detailOrder.status}
                    onValueChange={handleDetailStatusChange}
                    disabled={detailStatusLoading}
                  >
                    <SelectTrigger className="w-full h-10 bg-[#111] border-[#262626] text-white text-xs uppercase tracking-wider rounded-none focus:border-red-600">
                      {detailStatusLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Actualizando...
                        </span>
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-[#262626] rounded-none">
                      {ALL_STATUSES.map((s) => {
                        const sc = STATUS_CONFIG[s];
                        return (
                          <SelectItem
                            key={s}
                            value={s}
                            className={`${sc.color} text-xs uppercase tracking-wider rounded-none`}
                          >
                            {sc.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Full ID */}
                <div>
                  <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold mb-1">
                    ID Completo
                  </p>
                  <p className="text-neutral-600 text-[10px] font-mono break-all">
                    {detailOrder.id}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  );
}

/* ─── Fragment wrapper for AnimatePresence + Table ─── */
function FragmentWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}