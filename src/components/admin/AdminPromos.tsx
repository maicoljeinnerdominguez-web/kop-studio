'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Loader2,
  Tag,
  Power,
  PowerOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { PromoCode } from '@/types';

/* ─── Helpers ─── */

const darkInput =
  'bg-[#1a1a1a] border-[#262626] text-white placeholder:text-neutral-600 text-sm rounded-none focus-visible:border-red-600 focus-visible:ring-red-600/20';
const darkSelect =
  'bg-[#1a1a1a] border-[#262626] text-white rounded-none focus-visible:border-red-600 data-[placeholder]:text-neutral-600';

function formatPromoValue(type: string, value: number): string {
  if (type === 'PERCENTAGE') return `${value}%`;
  return `$${Math.round(value).toLocaleString('es-CO')} COP`;
}

function formatCOP(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return `$${Math.round(amount).toLocaleString('es-CO')} COP`;
}

function formatUses(used: number, max: number | null | undefined): string {
  if (max == null) return `${used} / ∞`;
  return `${used} / ${max}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getPromoStatus(promo: PromoCode): 'active' | 'inactive' | 'expired' {
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return 'expired';
  if (promo.isActive) return 'active';
  return 'inactive';
}

/* ─── Form data types ─── */

interface PromoFormData {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: string;
  minPurchase: string;
  maxUses: string;
  isActive: boolean;
  expiresAt: string;
}

const emptyForm: PromoFormData = {
  code: '',
  type: 'PERCENTAGE',
  value: '',
  minPurchase: '',
  maxUses: '',
  isActive: true,
  expiresAt: '',
};

/* ─── Validation ─── */

function validateForm(data: PromoFormData): string | null {
  const code = data.code.trim();
  if (!code) return 'El código es requerido';
  if (code.length < 3) return 'El código debe tener al menos 3 caracteres';
  if (!/^[A-Z0-9_-]+$/.test(code))
    return 'El código solo puede contener letras, números, guiones y guiones bajos';

  const value = parseFloat(data.value);
  if (isNaN(value) || value <= 0) return 'El valor debe ser mayor a 0';
  if (data.type === 'PERCENTAGE' && value > 100)
    return 'El porcentaje no puede ser mayor a 100';

  if (data.minPurchase) {
    const min = parseFloat(data.minPurchase);
    if (isNaN(min) || min < 0) return 'La compra mínima debe ser un valor válido';
  }

  if (data.maxUses) {
    const max = parseInt(data.maxUses, 10);
    if (isNaN(max) || max < 1) return 'Los usos máximos deben ser al menos 1';
  }

  return null;
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

export default function AdminPromos() {
  const navigate = useNavigationStore((s) => s.navigate);

  /* ─── Internal view state ─── */
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ─── List state ─── */
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ─── Form state ─── */
  const [form, setForm] = useState<PromoFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ─── Fetch promos ─── */
  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promos');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPromos(data);
    } catch {
      toast.error('Error al cargar promociones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  /* ─── Filtered promos ─── */
  const filteredPromos = useMemo(() => {
    if (!search.trim()) return promos;
    const q = search.toUpperCase();
    return promos.filter((p) => p.code.toUpperCase().includes(q));
  }, [promos, search]);

  /* ─── Handlers: list ─── */

  const handleToggleActive = async (promo: PromoCode) => {
    setTogglingId(promo.id);
    try {
      const res = await fetch(`/api/admin/promos/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      setPromos((prev) =>
        prev.map((p) =>
          p.id === promo.id ? { ...p, isActive: !p.isActive } : p
        )
      );
      toast.success(promo.isActive ? 'Cupón desactivado' : 'Cupón activado');
    } catch {
      toast.error('Error al actualizar cupón');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setPromos((prev) => prev.filter((p) => p.id !== id));
      toast.success('Cupón eliminado');
    } catch {
      toast.error('Error al eliminar cupón');
    } finally {
      setDeletingId(null);
    }
  };

  /* ─── Handlers: form ─── */

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setView('form');
  };

  const openEdit = (promo: PromoCode) => {
    setEditingId(promo.id);
    setForm({
      code: promo.code,
      type: promo.type,
      value: String(promo.value),
      minPurchase: promo.minPurchase != null ? String(promo.minPurchase) : '',
      maxUses: promo.maxUses != null ? String(promo.maxUses) : '',
      isActive: promo.isActive,
      expiresAt: promo.expiresAt
        ? new Date(promo.expiresAt).toISOString().split('T')[0]
        : '',
    });
    setFormError(null);
    setView('form');
  };

  const updateField = (field: keyof PromoFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm(form);
    if (error) {
      setFormError(error);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : null,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
        isActive: form.isActive,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };

      const isEdit = !!editingId;
      const url = isEdit ? `/api/admin/promos/${editingId}` : '/api/admin/promos';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed');
      }

      toast.success(
        isEdit ? 'Cupón actualizado correctamente' : 'Cupón creado correctamente'
      );
      setView('list');
      fetchPromos();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al guardar el cupón'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ═══════════════════════════════════════════
     RENDER — Form View
     ═══════════════════════════════════════════ */

  if (view === 'form') {
    const isEdit = !!editingId;
    return (
      <section className="min-h-screen bg-black px-4 py-8 md:px-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setView('list')}
              className="flex items-center justify-center w-9 h-9 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
              aria-label="Volver a la lista"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">
                {isEdit ? 'EDITAR CUPÓN' : 'NUEVO CUPÓN'}
              </h1>
              <p className="text-neutral-500 text-xs mt-0.5 uppercase tracking-wider">
                {isEdit
                  ? `Editando: ${form.code}`
                  : 'Completa la información del cupón'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Info */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 md:p-6">
              <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-5">
                Información del Cupón
              </h2>
              <div className="space-y-4">
                {/* Code */}
                <div className="space-y-1.5">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Código *
                  </Label>
                  <Input
                    value={form.code}
                    onChange={(e) =>
                      updateField('code', e.target.value.toUpperCase().trim())
                    }
                    className={darkInput}
                    placeholder="Ej: VERANO15"
                    maxLength={30}
                  />
                  {formError && form.code.trim().length < 3 && (
                    <p className="text-red-500 text-xs">{formError}</p>
                  )}
                </div>

                {/* Type + Value row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                      Tipo *
                    </Label>
                    <Select
                      value={form.type}
                      onValueChange={(val) =>
                        updateField('type', val as 'PERCENTAGE' | 'FIXED')
                      }
                    >
                      <SelectTrigger className={darkSelect + ' w-full'}>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#262626] text-white">
                        <SelectItem
                          value="PERCENTAGE"
                          className="text-white focus:bg-[#262626] focus:text-white"
                        >
                          PORCENTAJE
                        </SelectItem>
                        <SelectItem
                          value="FIXED"
                          className="text-white focus:bg-[#262626] focus:text-white"
                        >
                          VALOR FIJO
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                      Valor *
                      <span className="text-neutral-600 ml-1 normal-case">
                        ({form.type === 'PERCENTAGE' ? '%' : 'COP'})
                      </span>
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={form.type === 'PERCENTAGE' ? '1' : '1000'}
                      value={form.value}
                      onChange={(e) => updateField('value', e.target.value)}
                      className={darkInput}
                      placeholder={
                        form.type === 'PERCENTAGE' ? '15' : '20000'
                      }
                    />
                    {formError && parseFloat(form.value) <= 0 && (
                      <p className="text-red-500 text-xs">{formError}</p>
                    )}
                  </div>
                </div>

                {/* Min purchase + Max uses row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                      Compra mínima
                      <span className="text-neutral-600 ml-1 normal-case">
                        (COP, opcional)
                      </span>
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step="1000"
                      value={form.minPurchase}
                      onChange={(e) => updateField('minPurchase', e.target.value)}
                      className={darkInput}
                      placeholder="50000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                      Usos máximos
                      <span className="text-neutral-600 ml-1 normal-case">
                        (opcional)
                      </span>
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.maxUses}
                      onChange={(e) => updateField('maxUses', e.target.value)}
                      className={darkInput}
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* Expiration */}
                <div className="space-y-1.5">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Fecha de expiración
                    <span className="text-neutral-600 ml-1 normal-case">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => updateField('expiresAt', e.target.value)}
                    className={darkInput}
                  />
                </div>

                {/* Active switch */}
                <div className="flex items-center gap-3 mt-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(val) => updateField('isActive', val)}
                    className="data-[state=checked]:bg-red-600"
                  />
                  <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium cursor-pointer">
                    ¿Activo?
                  </Label>
                </div>
              </div>
            </div>

            {/* Form error */}
            {formError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs text-center bg-red-500/10 border border-red-500/20 px-4 py-2"
              >
                {formError}
              </motion.p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setView('list')}
                className="flex-1 border-neutral-700 text-white hover:bg-neutral-800 uppercase text-xs tracking-wider font-bold rounded-none h-11"
              >
                CANCELAR
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-[2] bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-wider font-bold rounded-none h-11 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    GUARDANDO...
                  </>
                ) : (
                  'GUARDAR CUPÓN'
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER — List View
     ═══════════════════════════════════════════ */

  return (
    <section className="min-h-screen bg-black px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-6xl mx-auto">
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
                GESTIÓN DE PROMOCIONES
              </h1>
              {!loading && (
                <p className="text-neutral-500 text-xs mt-1 uppercase tracking-wider">
                  {promos.length} cupón{promos.length !== 1 ? 'es' : ''}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-wider font-bold rounded-none h-9 px-5"
          >
            <Plus className="w-4 h-4 mr-2" />
            CREAR NUEVO CUPÓN
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cupón..."
            className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-neutral-600 text-sm rounded-none pl-9 h-10 focus-visible:border-red-600"
          />
        </div>

        {/* Promos Table */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-[#1a1a1a] hover:bg-transparent">
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Código
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Tipo
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Valor
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden sm:table-cell">
                    Mínimo Compra
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden md:table-cell">
                    Usos
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden lg:table-cell">
                    Estado
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden xl:table-cell">
                    Expiración
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow
                      key={i}
                      className="border-b-[#1a1a1a] hover:bg-transparent"
                    >
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredPromos.length === 0 ? (
                  <TableRow className="border-b-0 hover:bg-transparent">
                    <TableCell colSpan={8} className="text-center py-12">
                      <Tag className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                      <p className="text-neutral-500 text-sm">
                        {search
                          ? 'No se encontraron cupones'
                          : 'No hay cupones creados aún'}
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
                      {!search && (
                        <Button
                          variant="ghost"
                          onClick={openCreate}
                          className="text-neutral-500 hover:text-white text-xs mt-2 uppercase tracking-wider"
                        >
                          Crear primer cupón
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromos.map((promo) => {
                    const status = getPromoStatus(promo);
                    return (
                      <motion.tr
                        key={promo.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b-[#1a1a1a] hover:bg-[#111] transition-colors"
                      >
                        {/* Code */}
                        <TableCell>
                          <p className="text-white text-xs font-bold uppercase tracking-wider">
                            {promo.code}
                          </p>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-none border-neutral-700 text-neutral-400 bg-neutral-800/50"
                          >
                            {promo.type === 'PERCENTAGE'
                              ? 'PORCENTAJE'
                              : 'VALOR FIJO'}
                          </Badge>
                        </TableCell>

                        {/* Value */}
                        <TableCell>
                          <p className="text-white text-xs font-medium">
                            {formatPromoValue(promo.type, promo.value)}
                          </p>
                        </TableCell>

                        {/* Min purchase */}
                        <TableCell className="hidden sm:table-cell">
                          <p className="text-neutral-400 text-xs">
                            {formatCOP(promo.minPurchase)}
                          </p>
                        </TableCell>

                        {/* Uses */}
                        <TableCell className="hidden md:table-cell">
                          <p className="text-neutral-400 text-xs">
                            {formatUses(promo.usedCount, promo.maxUses)}
                          </p>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="hidden lg:table-cell">
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-none border ${
                              status === 'active'
                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                : status === 'expired'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                  : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/30'
                            }`}
                          >
                            {status === 'active'
                              ? 'Activo'
                              : status === 'expired'
                                ? 'Expirado'
                                : 'Inactivo'}
                          </Badge>
                        </TableCell>

                        {/* Expiration */}
                        <TableCell className="hidden xl:table-cell">
                          <p className="text-neutral-400 text-xs">
                            {formatDate(promo.expiresAt)}
                          </p>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {/* Toggle active */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(promo)}
                              disabled={togglingId === promo.id || status === 'expired'}
                              className={`h-8 w-8 p-0 rounded-none hover:bg-[#1a1a1a] ${
                                promo.isActive
                                  ? 'text-green-500 hover:text-green-400'
                                  : 'text-neutral-500 hover:text-neutral-400'
                              } disabled:opacity-30`}
                              title={
                                promo.isActive ? 'Desactivar' : 'Activar'
                              }
                            >
                              {promo.isActive ? (
                                <Power className="w-3.5 h-3.5" />
                              ) : (
                                <PowerOff className="w-3.5 h-3.5" />
                              )}
                            </Button>

                            {/* Edit */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(promo)}
                              className="h-8 w-8 p-0 rounded-none hover:bg-[#1a1a1a] text-neutral-400 hover:text-white"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>

                            {/* Delete */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={deletingId === promo.id}
                                  className="h-8 w-8 p-0 rounded-none hover:bg-red-600/10 text-neutral-500 hover:text-red-500"
                                  title="Eliminar"
                                >
                                  {deletingId === promo.id ? (
                                    <Skeleton className="h-3.5 w-3.5 rounded" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#0a0a0a] border-[#262626] rounded-none">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white uppercase tracking-wider text-sm">
                                    ¿Eliminar cupón?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-neutral-400 text-xs">
                                    Esta acción no se puede deshacer. Se
                                    eliminará el cupón &quot;{promo.code}&quot;
                                    permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-neutral-700 text-white hover:bg-neutral-800 rounded-none uppercase text-xs tracking-wider font-bold">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(promo.id)}
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