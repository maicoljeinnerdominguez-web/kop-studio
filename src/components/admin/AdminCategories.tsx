'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Loader2,
  FolderTree,
  Folder,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

/* ─── Helpers ─── */

const darkInput =
  'bg-[#1a1a1a] border-[#262626] text-white placeholder:text-neutral-600 text-sm rounded-none focus-visible:border-red-600 focus-visible:ring-red-600/20';
const darkSelect =
  'bg-[#1a1a1a] border-[#262626] text-white rounded-none focus-visible:border-red-600 data-[placeholder]:text-neutral-600';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ─── Types ─── */

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  _count: { products: number };
}

interface CategoryFormData {
  name: string;
  parentId: string;
}

const emptyForm: CategoryFormData = {
  name: '',
  parentId: '',
};

/* ─── Validation ─── */

function validateForm(data: CategoryFormData): string | null {
  const name = data.name.trim();
  if (!name) return 'El nombre es requerido';
  if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (name.length > 80) return 'El nombre no puede exceder 80 caracteres';
  return null;
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

export default function AdminCategories() {
  const navigate = useNavigationStore((s) => s.navigate);

  /* ─── Internal view state ─── */
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ─── List state ─── */
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* ─── Form state ─── */
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ─── Fetch categories ─── */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCategories(data);
    } catch {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ─── Parent categories for select (exclude current editing item + its children) ─── */
  const parentOptions = useMemo(() => {
    return categories.filter((c) => c.id !== editingId);
  }, [categories, editingId]);

  /* ─── Handlers: list ─── */

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed');
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Categoría eliminada');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar categoría';
      toast.error(message);
      setDeleteError(message);
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

  const openEdit = (category: CategoryWithCount) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      parentId: category.parentId || '',
    });
    setFormError(null);
    setView('form');
  };

  const updateField = (field: keyof CategoryFormData, value: string) => {
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
        name: form.name.trim(),
        parentId: form.parentId || null,
      };

      const isEdit = !!editingId;
      const url = isEdit
        ? `/api/admin/categories/${editingId}`
        : '/api/admin/categories';
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
        isEdit
          ? 'Categoría actualizada correctamente'
          : 'Categoría creada correctamente'
      );
      setView('list');
      fetchCategories();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al guardar la categoría'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Auto-generated slug preview ─── */
  const slugPreview = useMemo(() => {
    if (!form.name.trim()) return '';
    return generateSlug(form.name);
  }, [form.name]);

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
                {isEdit ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
              </h1>
              <p className="text-neutral-500 text-xs mt-0.5 uppercase tracking-wider">
                {isEdit
                  ? `Editando: ${form.name || '...'}`
                  : 'Completa la información de la categoría'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Info */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 md:p-6">
              <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-5">
                Información de la Categoría
              </h2>
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Nombre *
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={darkInput}
                    placeholder="Ej: Camisetas, Accesorios, Oversize"
                    maxLength={80}
                  />
                  {formError && (
                    <p className="text-red-500 text-xs">{formError}</p>
                  )}
                </div>

                {/* Slug preview */}
                {slugPreview && (
                  <div className="space-y-1.5">
                    <Label className="text-neutral-500 text-xs uppercase tracking-wider font-medium">
                      Slug (auto-generado)
                    </Label>
                    <div className="bg-[#111] border border-[#1a1a1a] px-3 py-2 text-neutral-400 text-sm">
                      /{slugPreview}
                    </div>
                  </div>
                )}

                {/* Parent Category */}
                <div className="space-y-1.5">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Categoría Padre
                  </Label>
                  <Select
                    value={form.parentId}
                    onValueChange={(val) => updateField('parentId', val)}
                  >
                    <SelectTrigger className={darkSelect + ' w-full'}>
                      <SelectValue placeholder="Sin categoría padre" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#262626] text-white">
                      <SelectItem value="none">Sin categoría padre</SelectItem>
                      {parentOptions.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-neutral-600 text-[11px]">
                    Opcional. Las subcategorías se agrupan bajo una categoría padre.
                  </p>
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-wider font-bold rounded-none h-10 px-6"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEdit ? 'GUARDAR CAMBIOS' : 'CREAR CATEGORÍA'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setView('list')}
                className="border border-neutral-700 text-neutral-400 hover:text-white hover:bg-transparent hover:border-neutral-500 uppercase text-xs tracking-wider font-bold rounded-none h-10 px-6"
              >
                CANCELAR
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
                GESTIÓN DE CATEGORÍAS
              </h1>
              {!loading && (
                <p className="text-neutral-500 text-xs mt-1 uppercase tracking-wider">
                  {categories.length} categor{categories.length !== 1 ? 'ías' : 'ía'}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-wider font-bold rounded-none h-9 px-5"
          >
            <Plus className="w-4 h-4 mr-2" />
            CREAR NUEVA CATEGORÍA
          </Button>
        </div>

        {/* Categories Table */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-[#1a1a1a] hover:bg-transparent">
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Nombre
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden sm:table-cell">
                    Slug
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Productos
                  </TableHead>
                  <TableHead className="text-neutral-400 text-xs uppercase tracking-wider font-medium hidden md:table-cell">
                    Padre
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
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-10 rounded-full" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : categories.length === 0 ? (
                  <TableRow className="border-b-0 hover:bg-transparent">
                    <TableCell colSpan={5} className="text-center py-12">
                      <FolderTree className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                      <p className="text-neutral-500 text-sm">
                        No hay categorías aún
                      </p>
                      <Button
                        variant="ghost"
                        onClick={openCreate}
                        className="text-red-500 hover:text-red-400 text-xs mt-2 uppercase tracking-wider"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Crear primera categoría
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <motion.tr
                      key={category.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b-[#1a1a1a] hover:bg-[#111] transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Folder className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                          <span className="text-white text-xs font-medium truncate max-w-[200px]">
                            {category.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <code className="text-neutral-500 text-[11px] font-mono">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-none border bg-neutral-500/10 text-neutral-400 border-neutral-500/30"
                        >
                          {category._count.products}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="text-neutral-400 text-xs">
                          {category.parent ? category.parent.name : '—'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(category)}
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
                                disabled={deletingId === category.id}
                                className="h-8 w-8 p-0 rounded-none hover:bg-red-600/10 text-neutral-500 hover:text-red-500"
                                title="Eliminar"
                                onClick={() => setDeleteError(null)}
                              >
                                {deletingId === category.id ? (
                                  <Skeleton className="h-3.5 w-3.5 rounded" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#0a0a0a] border-[#262626] rounded-none">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white uppercase tracking-wider text-sm">
                                  ¿Eliminar categoría?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-neutral-400 text-xs">
                                  Esta acción no se puede deshacer. Se eliminará
                                  &quot;{category.name}&quot; permanentemente.
                                </AlertDialogDescription>
                                {deleteError && (
                                  <p className="text-red-500 text-xs mt-2 bg-red-500/10 border border-red-500/20 p-2">
                                    {deleteError}
                                  </p>
                                )}
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-neutral-700 text-white hover:bg-neutral-800 rounded-none uppercase text-xs tracking-wider font-bold">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}