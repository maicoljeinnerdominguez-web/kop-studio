'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore } from '@/stores/useNavigationStore';
import type { Product, Category } from '@/types';

const SIZES = ['S', 'M', 'L', 'XL', 'OS'];

const productSchema = z.object({
  title: z.string().min(1, 'Nombre es requerido'),
  price: z.coerce.number().min(1, 'Precio es requerido'),
  compareAtPrice: z.coerce.number().optional().nullable(),
  sku: z.string().optional().nullable(),
  description: z.string().min(1, 'Descripción es requerida'),
  categoryId: z.string().min(1, 'Categoría es requerida'),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ImageRow {
  url: string;
  altText: string;
  isPrimary: boolean;
}

interface VariantRow {
  size: string;
  color: string;
  stockQuantity: number;
}

const darkInput =
  'bg-[#1a1a1a] border-[#262626] text-white placeholder:text-neutral-600 text-sm rounded-none focus-visible:border-red-600 focus-visible:ring-red-600/20';
const darkSelect =
  'bg-[#1a1a1a] border-[#262626] text-white rounded-none focus-visible:border-red-600 data-[placeholder]:text-neutral-600';

export default function AdminProductForm() {
  const viewParams = useNavigationStore((s) => s.viewParams);
  const navigate = useNavigationStore((s) => s.navigate);
  const productId = viewParams?.id || null;
  const isEditMode = !!productId;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ImageRow[]>([{ url: '', altText: '', isPrimary: false }]);
  const [variants, setVariants] = useState<VariantRow[]>(
    SIZES.map((size) => ({ size, color: 'Negro', stockQuantity: 0 }))
  );

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      price: 0,
      compareAtPrice: null,
      sku: '',
      description: '',
      categoryId: '',
      isNew: false,
      isBestseller: false,
    },
  });

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      // categories are optional, no toast needed
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error('Not found');
      const product: Product = await res.json();

      form.reset({
        title: product.title,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        sku: product.sku || '',
        description: product.description,
        categoryId: product.categoryId,
        isNew: product.isNew,
        isBestseller: product.isBestseller,
      });

      if (product.images.length > 0) {
        setImages(
          product.images.map((img) => ({
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
          }))
        );
      }

      if (product.variants.length > 0) {
        setVariants(
          product.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stockQuantity: v.stockQuantity,
          }))
        );
      }
    } catch {
      toast.error('Error al cargar producto');
      navigate('admin-products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    setImages((prev) => [...prev, { url: '', altText: '', isPrimary: false }]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateImage = (index: number, field: keyof ImageRow, value: string | boolean) => {
    setImages((prev) =>
      prev.map((img, i) => {
        if (i !== index) return img;
        if (field === 'isPrimary' && value === true) {
          return { ...img, isPrimary: true };
        }
        if (field === 'isPrimary' && value === false) {
          return img;
        }
        return { ...img, [field]: value };
      })
    );
    // When setting primary, unset others
    if (field === 'isPrimary' && value === true) {
      setImages((prev) =>
        prev.map((img, i) => (i === index ? { ...img, isPrimary: true } : { ...img, isPrimary: false }))
      );
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { size: 'M', color: 'Negro', stockQuantity: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateVariant = (index: number, field: keyof VariantRow, value: string | number) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        images: images.filter((img) => img.url.trim()),
        variants: variants.map((v) => ({
          ...v,
          stockQuantity: Number(v.stockQuantity),
        })),
      };

      const url = isEditMode ? `/api/products/${productId}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed');

      toast.success(
        isEditMode ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
      );
      navigate('admin-products');
    } catch {
      toast.error('Error al guardar el producto. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-black px-4 py-8 md:px-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-black px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('admin-products')}
              className="flex items-center justify-center w-9 h-9 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">
                {isEditMode ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
              </h1>
              <p className="text-neutral-500 text-xs mt-0.5 uppercase tracking-wider">
                {isEditMode ? `Editando producto #${productId?.slice(0, 8)}` : 'Completa la información del producto'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 md:p-6">
            <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-5">
              Información Básica
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                  Nombre del producto *
                </Label>
                <Input
                  {...form.register('title')}
                  className={darkInput}
                  placeholder="Ej: Camiseta Urban Black"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-xs">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Precio *
                  </Label>
                  <Input
                    {...form.register('price')}
                    type="number"
                    min={0}
                    className={darkInput}
                    placeholder="89000"
                  />
                  {form.formState.errors.price && (
                    <p className="text-red-500 text-xs">{form.formState.errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                    Precio anterior (opcional)
                  </Label>
                  <Input
                    {...form.register('compareAtPrice')}
                    type="number"
                    min={0}
                    className={darkInput}
                    placeholder="120000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                  SKU (opcional)
                </Label>
                <Input
                  {...form.register('sku')}
                  className={darkInput}
                  placeholder="KOP-TSH-BLK-001"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                  Descripción *
                </Label>
                <Textarea
                  {...form.register('description')}
                  className={darkInput + ' min-h-[100px]'}
                  placeholder="Describe el producto..."
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-xs">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                  Categoría *
                </Label>
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={darkSelect + ' w-full'}>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#262626] text-white">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-[#262626] focus:text-white">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <p className="text-red-500 text-xs">{form.formState.errors.categoryId.message}</p>
                )}
              </div>

              {/* Switches */}
              <div className="flex flex-col sm:flex-row gap-6 mt-2">
                <div className="flex items-center gap-3">
                  <Controller
                    control={form.control}
                    name="isNew"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-red-600"
                      />
                    )}
                  />
                  <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium cursor-pointer">
                    ¿Es nuevo?
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Controller
                    control={form.control}
                    name="isBestseller"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-red-600"
                      />
                    )}
                  />
                  <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium cursor-pointer">
                    ¿Es best seller?
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 md:p-6">
            <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-5">
              Imágenes
            </h2>
            <div className="space-y-3">
              {images.map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row gap-3 items-start"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                      <Input
                        value={img.url}
                        onChange={(e) => handleUpdateImage(index, 'url', e.target.value)}
                        className={darkInput}
                        placeholder="URL de la imagen"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Input
                        value={img.altText}
                        onChange={(e) => handleUpdateImage(index, 'altText', e.target.value)}
                        className={darkInput}
                        placeholder="Texto alternativo"
                      />
                      <label className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={img.isPrimary}
                          onChange={(e) => handleUpdateImage(index, 'isPrimary', e.target.checked)}
                          className="w-4 h-4 rounded-none bg-[#1a1a1a] border-[#262626] accent-red-600"
                        />
                        <span className="text-neutral-400 text-[11px] uppercase tracking-wider whitespace-nowrap">
                          Principal
                        </span>
                      </label>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    disabled={images.length === 1}
                    className="text-neutral-500 hover:text-red-500 hover:bg-red-600/10 h-9 w-9 p-0 rounded-none flex-shrink-0 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleAddImage}
              className="mt-3 text-neutral-500 hover:text-white hover:bg-[#1a1a1a] uppercase text-xs tracking-wider font-bold rounded-none h-9 px-4"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Añadir imagen
            </Button>
          </div>

          {/* Sizes & Stock */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 md:p-6">
            <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-5">
              Tallas y Stock
            </h2>
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row gap-3 items-start"
                >
                  <Select
                    value={variant.size}
                    onValueChange={(val) => handleUpdateVariant(index, 'size', val)}
                  >
                    <SelectTrigger className={darkSelect + ' w-full sm:w-24'}>
                      <SelectValue placeholder="Talla" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#262626] text-white">
                      {SIZES.map((size) => (
                        <SelectItem key={size} value={size} className="text-white focus:bg-[#262626] focus:text-white">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={variant.color}
                    onChange={(e) => handleUpdateVariant(index, 'color', e.target.value)}
                    className={darkInput + ' flex-1'}
                    placeholder="Color"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={variant.stockQuantity}
                    onChange={(e) =>
                      handleUpdateVariant(index, 'stockQuantity', parseInt(e.target.value) || 0)
                    }
                    className={darkInput + ' w-full sm:w-24'}
                    placeholder="Stock"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveVariant(index)}
                    disabled={variants.length === 1}
                    className="text-neutral-500 hover:text-red-500 hover:bg-red-600/10 h-9 w-9 p-0 rounded-none flex-shrink-0 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleAddVariant}
              className="mt-3 text-neutral-500 hover:text-white hover:bg-[#1a1a1a] uppercase text-xs tracking-wider font-bold rounded-none h-9 px-4"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Añadir variante
            </Button>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('admin-products')}
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
                'GUARDAR PRODUCTO'
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
