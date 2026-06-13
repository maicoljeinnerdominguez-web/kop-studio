'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Clock,
  Package,
  ShoppingBag,
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

interface RecentOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string } | null;
}

export default function AdminDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigationStore((s) => s.navigate);
  const logout = useAuthStore((s) => s.logout);

  const [showLogin, setShowLogin] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

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
    },
    {
      label: 'Órdenes Pendientes',
      value: stats ? String(stats.pendingOrders) : '—',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Productos Activos',
      value: stats ? String(stats.activeProducts) : '—',
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Órdenes',
      value: stats ? String(stats.totalOrders) : '—',
      icon: ShoppingBag,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
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
                className="bg-[#0a0a0a] border border-[#1a1a1a] p-5"
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
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
            Órdenes Recientes
          </h2>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-[#1a1a1a] hover:bg-transparent">
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
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : recentOrders.length === 0 ? (
                    <TableRow className="border-b-0 hover:bg-transparent">
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-neutral-500 text-sm">No hay órdenes aún</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="border-b-[#1a1a1a] hover:bg-[#111] transition-colors"
                      >
                        <TableCell className="text-white text-xs font-mono">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-white text-xs">
                          {order.user?.name || order.user?.email || 'Guest'}
                        </TableCell>
                        <TableCell className="text-white text-xs font-medium">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-none border ${
                              STATUS_COLORS[order.status as OrderStatus] || STATUS_COLORS.PENDING
                            }`}
                          >
                            {STATUS_LABELS[order.status as OrderStatus] || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-neutral-400 text-xs">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
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
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('admin-products')}
              className="bg-[#0a0a0a] border border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-neutral-600 uppercase text-xs tracking-wider font-bold rounded-none h-10 px-5"
            >
              <Package className="w-4 h-4 mr-2" />
              GESTIONAR PRODUCTOS
            </Button>
            <Button
              onClick={() => navigate('admin-products-new')}
              className="bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-wider font-bold rounded-none h-10 px-5"
            >
              CREAR NUEVO PRODUCTO
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
