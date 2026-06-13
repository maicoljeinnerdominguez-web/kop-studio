'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Package,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigationStore } from '@/stores/useNavigationStore';
import type { Product } from '@/types';

function formatPrice(amount: number) {
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
}

export default function AdminProducts() {
  const navigate = useNavigationStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?active=false');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setProducts(data);
    } catch {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.title.toLowerCase().includes(q));
  }, [products, search]);

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product.id);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive,
          price: product.price,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: !p.isActive } : p
        )
      );
      toast.success(
        product.isActive ? 'Producto desactivado' : 'Producto activado'
      );
    } catch {
      toast.error('Error al actualizar producto');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Producto eliminado');
    } catch {
      toast.error('Error al eliminar producto');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="min-h-screen bg-black px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">
              GESTIÓN DE PRODUCTOS
            </h1>
            {!loading && (
              <p className="text-neutral-500 text-xs mt-1 uppercase tracking-wider">
                {products.length} producto{products.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button
            onClick={() => navigate('admin-products-new')}
            className="bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-wider font-bold rounded-none h-9 px-5"
          >
            <Plus className="w-4 h-4 mr-2" />
            AÑADIR NUEVO PRODUCTO
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-neutral-600 text-sm rounded-none pl-9 h-10 focus-visible:border-red-600"
          />
        </div>

        {/* Product Table */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-[#1a1a1a] hover:bg-transparent">
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Imagen
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Nombre
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Precio
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden sm:table-cell">
                    Categoría
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden md:table-cell">
                    Estado
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden lg:table-cell">
                    Stock
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-b-[#1a1a1a] hover:bg-transparent">
                      <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow className="border-b-0 hover:bg-transparent">
                    <TableCell colSpan={7} className="text-center py-12">
                      <Package className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                      <p className="text-neutral-500 text-sm">
                        {search ? 'No se encontraron productos' : 'No hay productos aún'}
                      </p>
                      {search && (
                        <Button
                          variant="ghost"
                          onClick={() => setSearch('')}
                          className="text-neutral-500 hover:text-white text-xs mt-2 uppercase tracking-wider"
                        >
                          Limpiar búsqueda
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const primaryImage =
                      product.images.find((img) => img.isPrimary)?.url ||
                      product.images[0]?.url ||
                      '';
                    const totalStock = product.variants.reduce(
                      (sum, v) => sum + v.stockQuantity,
                      0
                    );

                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b-[#1a1a1a] hover:bg-[#111] transition-colors"
                      >
                        <TableCell>
                          <div className="w-10 h-10 bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                            {primaryImage ? (
                              <img
                                src={primaryImage}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-neutral-600" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white text-xs font-medium truncate max-w-[200px]">
                              {product.title}
                            </p>
                            {product.sku && (
                              <p className="text-neutral-600 text-[10px] mt-0.5">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white text-xs font-medium">
                              {formatPrice(product.price)}
                            </p>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <p className="text-neutral-600 text-[10px] line-through">
                                {formatPrice(product.compareAtPrice)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <p className="text-neutral-400 text-xs">
                            {product.category?.name || '—'}
                          </p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-none border ${
                              product.isActive
                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/30'
                            }`}
                          >
                            {product.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <p className="text-white text-xs">{totalStock}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(product)}
                              disabled={togglingId === product.id}
                              className={`h-8 w-8 p-0 rounded-none hover:bg-[#1a1a1a] ${
                                product.isActive
                                  ? 'text-green-500 hover:text-green-400'
                                  : 'text-neutral-500 hover:text-neutral-400'
                              }`}
                              title={product.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {product.isActive ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate('admin-products-edit', { id: product.id })
                              }
                              className="h-8 w-8 p-0 rounded-none hover:bg-[#1a1a1a] text-neutral-400 hover:text-white"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={deletingId === product.id}
                                  className="h-8 w-8 p-0 rounded-none hover:bg-red-600/10 text-neutral-500 hover:text-red-500"
                                  title="Eliminar"
                                >
                                  {deletingId === product.id ? (
                                    <Skeleton className="h-3.5 w-3.5 rounded" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#0a0a0a] border-[#262626] rounded-none">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white uppercase tracking-wider text-sm">
                                    ¿Eliminar producto?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-neutral-400 text-xs">
                                    Esta acción no se puede deshacer. Se eliminará &quot;{product.title}&quot; permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-neutral-700 text-white hover:bg-neutral-800 rounded-none uppercase text-xs tracking-wider font-bold">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(product.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-none uppercase text-xs tracking-wider font-bold"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
