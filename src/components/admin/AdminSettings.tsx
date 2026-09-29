'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChangePasswordCard from '@/components/admin/ChangePasswordCard';
import {
  Building2,
  Settings,
  Save,
  RotateCcw,
  ArrowLeft,
  Plus,
  Trash2,
  Tag,
  MessageCircle,
} from 'lucide-react';

const BUSINESS_FIELDS = [
  { key: 'business_name', label: 'Razón social o nombre del titular', placeholder: 'KOP STUDIO S.A.S. / Nombre Apellido' },
  { key: 'business_nit', label: 'NIT o cédula', placeholder: '900.123.456-7' },
  { key: 'business_address', label: 'Dirección', placeholder: 'Calle 1 #2-3, La Unión, Nariño' },
  { key: 'business_email', label: 'Correo de contacto', placeholder: 'contacto@tudominio.com' },
  { key: 'business_phone', label: 'Teléfono', placeholder: '+57 300 123 4567' },
  { key: 'business_hours', label: 'Horario de atención', placeholder: 'Lun-Sáb 9:00 AM - 6:00 PM' },
  { key: 'instagram_url', label: 'Instagram (URL)', placeholder: 'https://instagram.com/kopstudio' },
  { key: 'twitter_url', label: 'X / Twitter (URL)', placeholder: 'https://x.com/kopstudio' },
] as const;

type BusinessKey = (typeof BUSINESS_FIELDS)[number]['key'];

export default function AdminSettings() {
  const navigate = useNavigationStore((s) => s.navigate);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Section 1: Material Tags
  const [materialTags, setMaterialTags] = useState<string[]>([
    'Algodón Premium',
    '240gsm',
    'Made in Colombia',
  ]);

  // Section 2: Material & Care
  const [materialCare, setMaterialCare] = useState(
    '100% Algodón Premium de 240gsm. Lavar a máquina en ciclo frío. No usar blanqueador. Secar a temperatura baja. Planchar del revés.'
  );

  // Section 3: Garment Details
  const [garmentDetails, setGarmentDetails] = useState<string[]>([
    'Algodón premium 240gsm',
    'Corte oversize',
    'Impresión serigrafía',
    'Hecho en Colombia',
  ]);

  // Section 4: Wash Guide
  const [washGuide, setWashGuide] = useState<string[]>([
    'Lavar a mano con agua fría',
    'No usar blanqueador',
    'Secar a la sombra',
    'Planchar a baja temperatura',
  ]);

  // Store contact
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Business identification shown in footer and legal pages
  const [business, setBusiness] = useState<Record<BusinessKey, string>>(
    Object.fromEntries(BUSINESS_FIELDS.map((f) => [f.key, ''])) as Record<BusinessKey, string>
  );

  // Section 5: Social Proof
  const [socialProofEnabled, setSocialProofEnabled] = useState(false);
  const [initialDelay, setInitialDelay] = useState(5);
  const [intervalMin, setIntervalMin] = useState(15);
  const [intervalMax, setIntervalMax] = useState(30);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data: Record<string, string> = await res.json();

        if (data.material_tags) {
          try {
            setMaterialTags(JSON.parse(data.material_tags));
          } catch {
            /* keep defaults */
          }
        }

        if (data.material_care) {
          setMaterialCare(data.material_care);
        }

        if (data.garment_details) {
          try {
            setGarmentDetails(JSON.parse(data.garment_details));
          } catch {
            /* keep defaults */
          }
        }

        if (data.wash_guide) {
          try {
            setWashGuide(JSON.parse(data.wash_guide));
          } catch {
            /* keep defaults */
          }
        }

        if (data.whatsapp_number !== undefined) {
          setWhatsappNumber(data.whatsapp_number);
        }

        setBusiness(
          Object.fromEntries(BUSINESS_FIELDS.map((f) => [f.key, data[f.key] ?? ''])) as Record<BusinessKey, string>
        );

        if (data.social_proof_enabled !== undefined) {
          setSocialProofEnabled(data.social_proof_enabled === 'true');
        }

        if (data.social_proof_initial_delay !== undefined) {
          setInitialDelay(Number(data.social_proof_initial_delay) / 1000);
        }

        if (data.social_proof_interval_min !== undefined) {
          setIntervalMin(Number(data.social_proof_interval_min) / 1000);
        }

        if (data.social_proof_interval_max !== undefined) {
          setIntervalMax(Number(data.social_proof_interval_max) / 1000);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // --- Handlers for string array sections ---

  function handleStringArrayChange(
    setter: (val: string[]) => void,
    arr: string[],
    index: number,
    value: string
  ) {
    const next = [...arr];
    next[index] = value;
    setter(next);
  }

  function handleStringArrayRemove(
    setter: (val: string[]) => void,
    arr: string[],
    index: number
  ) {
    setter(arr.filter((_, i) => i !== index));
  }

  function handleStringArrayAdd(
    setter: (val: string[]) => void,
    arr: string[],
    defaultVal: string = ''
  ) {
    setter([...arr, defaultVal]);
  }

  // --- Handlers for social proof messages ---

  // --- Save ---

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        material_tags: JSON.stringify(materialTags),
        material_care: materialCare,
        garment_details: JSON.stringify(garmentDetails),
        wash_guide: JSON.stringify(washGuide),
        whatsapp_number: whatsappNumber.replace(/\D/g, ''),
        ...Object.fromEntries(BUSINESS_FIELDS.map((f) => [f.key, business[f.key].trim()])),
        social_proof_enabled: String(socialProofEnabled),
        social_proof_initial_delay: String(Number(initialDelay) * 1000),
        social_proof_interval_min: String(Number(intervalMin) * 1000),
        social_proof_interval_max: String(Number(intervalMax) * 1000),
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar');
      }

      toast.success('Configuración guardada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  // --- Reset ---

  async function handleReset() {
    if (!window.confirm('¿Restablecer toda la configuración a los valores por defecto?')) return;
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'reset' }),
      });
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al restablecer');
    }
  }

  // --- Render ---

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-neutral-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
            onClick={() => navigate('admin-dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold tracking-tight">
              Configuración del Sitio
            </h1>
          </div>
        </div>

        {/* ============================== */}
        {/* Datos del negocio */}
        {/* ============================== */}
        <Card className="mb-6 border-[#1a1a1a] bg-[#0a0a0a]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
              <Building2 className="h-4 w-4" />
              Datos del negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-neutral-400">
              La ley colombiana (Ley 1480 y Ley 1581) exige que las tiendas en línea muestren quién
              vende y cómo contactarlo. Estos datos aparecen en el pie de página, contacto y las
              políticas. Los campos vacíos no se muestran.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {BUSINESS_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label htmlFor={field.key} className="text-xs text-neutral-400">
                    {field.label}
                  </Label>
                  <Input
                    id={field.key}
                    value={business[field.key]}
                    onChange={(e) => setBusiness((b) => ({ ...b, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="border-[#1a1a1a] bg-[#111] text-white placeholder:text-neutral-500 focus:border-red-600"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ============================== */}
        {/* Contacto: WhatsApp */}
        {/* ============================== */}
        <Card className="mb-6 border-[#1a1a1a] bg-[#0a0a0a]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
              <MessageCircle className="h-4 w-4" />
              WhatsApp de la tienda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="whatsapp-number" className="text-xs text-neutral-500">
              Número con código de país, solo dígitos (ej. 573001234567). Vacío = ocultar botón.
            </Label>
            <Input
              id="whatsapp-number"
              inputMode="numeric"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="573001234567"
              className="border-[#1a1a1a] bg-[#111] text-white placeholder:text-neutral-500 focus:border-red-600"
            />
          </CardContent>
        </Card>

        {/* ============================== */}
        {/* SECTION 1: Etiquetas de Material */}
        {/* ============================== */}
        <Card className="mb-6 border-[#1a1a1a] bg-[#0a0a0a]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
              <Tag className="h-4 w-4" />
              Etiquetas de Material
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {materialTags.map((tag, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={tag}
                  onChange={(e) =>
                    handleStringArrayChange(setMaterialTags, materialTags, idx, e.target.value)
                  }
                  className="flex-1 border-[#1a1a1a] bg-[#111] text-white placeholder:text-neutral-500 focus:border-red-600"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-neutral-500 hover:text-red-500 hover:bg-[#1a1a1a]"
                  onClick={() =>
                    handleStringArrayRemove(setMaterialTags, materialTags, idx)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 gap-1 text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
              onClick={() => handleStringArrayAdd(setMaterialTags, materialTags)}
            >
              <Plus className="h-4 w-4" />
              Agregar etiqueta
            </Button>
          </CardContent>
        </Card>

        <Separator className="my-6 bg-[#1a1a1a]" />

        {/* ============================== */}
        {/* SECTION 2: Material y Cuidado */}
        {/* ============================== */}
        <Card className="mb-6 border-[#1a1a1a] bg-[#0a0a0a]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
              <Tag className="h-4 w-4" />
              Material y Cuidado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={materialCare}
              onChange={(e) => setMaterialCare(e.target.value)}
              rows={4}
              className="border-[#1a1a1a] bg-[#111] text-white placeholder:text-neutral-500 focus:border-red-600 resize-none"
            />
          </CardContent>
        </Card>

        <Separator className="my-6 bg-[#1a1a1a]" />

        {/* ============================== */}
        {/* SECTION 3: Detalles de la Prenda */}
        {/* ============================== */}
        <Card className="mb-6 border-[#1a1a1a] bg-[#0a0a0a]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
              <Tag className="h-4 w-4" />
              Detalles de la Prenda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {garmentDetails.map((detail, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={detail}
                  onChange={(e) =>
                    handleStringArrayChange(setGarmentDetails, garmentDetails, idx, e.target.value)
                  }
                  className="flex-1 border-[#1a1a1a] bg-[#111] text-white placeholder:text-neutral-500 focus:border-red-600"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-neutral-500 hover:text-red-500 hover:bg-[#1a1a1a]"
                  onClick={() =>
                    handleStringArrayRemove(setGarmentDetails, garmentDetails, idx)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 gap-1 text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
              onClick={() => handleStringArrayAdd(setGarmentDetails, garmentDetails)}
            >
              <Plus className="h-4 w-4" />
              Agregar detalle
            </Button>
          </CardContent>
        </Card>

        <Separator className="my-6 bg-[#1a1a1a]" />

        {/* ============================== */}
        {/* SECTION 4: Guía de Lavado */}
        {/* ============================== */}
        <Card className="mb-6 border-[#1a1a1a] bg-[#0a0a0a]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
              <Tag className="h-4 w-4" />
              Guía de Lavado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {washGuide.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={step}
                  onChange={(e) =>
                    handleStringArrayChange(setWashGuide, washGuide, idx, e.target.value)
                  }
                  className="flex-1 border-[#1a1a1a] bg-[#111] text-white placeholder:text-neutral-500 focus:border-red-600"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-neutral-500 hover:text-red-500 hover:bg-[#1a1a1a]"
                  onClick={() =>
                    handleStringArrayRemove(setWashGuide, washGuide, idx)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 gap-1 text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
              onClick={() => handleStringArrayAdd(setWashGuide, washGuide)}
            >
              <Plus className="h-4 w-4" />
              Agregar paso
            </Button>
          </CardContent>
        </Card>

        <Separator className="my-6 bg-[#1a1a1a]" />

        {/* ============================== */}
        {/* SECTION 5: Prueba Social */}
        {/* ============================== */}
        <Card className="mb-6 border-[#1a1a1a] bg-[#0a0a0a]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
              <MessageCircle className="h-4 w-4" />
              Prueba Social
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm text-neutral-300">Activar prueba social</Label>
              <Switch
                checked={socialProofEnabled}
                onCheckedChange={setSocialProofEnabled}
              />
            </div>

            {/* Timing inputs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Delay inicial (seg)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={initialDelay}
                  onChange={(e) => setInitialDelay(Number(e.target.value))}
                  className="border-[#1a1a1a] bg-[#111] text-white focus:border-red-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Intervalo mín (seg)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={intervalMin}
                  onChange={(e) => setIntervalMin(Number(e.target.value))}
                  className="border-[#1a1a1a] bg-[#111] text-white focus:border-red-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Intervalo máx (seg)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={intervalMax}
                  onChange={(e) => setIntervalMax(Number(e.target.value))}
                  className="border-[#1a1a1a] bg-[#111] text-white focus:border-red-600"
                />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-neutral-400">
              Las notificaciones muestran solo compras reales pagadas de los últimos 30 días
              (ciudad y producto, nunca nombres). Si no hay compras recientes, no se muestra nada.
            </p>
          </CardContent>
        </Card>

        {/* ============================== */}
        {/* Action Buttons */}
        {/* ============================== */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="gap-2 border-[#1a1a1a] bg-transparent text-neutral-300 hover:bg-[#1a1a1a] hover:text-white"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            Restablecer
          </Button>
          <Button
            className="gap-2 bg-red-600 text-white hover:bg-red-700"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>

        <div className="mt-10 flex flex-col gap-2 border border-[#1a1a1a] bg-[#0a0a0a] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-400">
            Suscriptores del newsletter (con fecha de autorización) para tus campañas.
          </p>
          <a
            href="/api/admin/newsletter"
            className="inline-flex items-center justify-center border border-[#333] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1a1a1a]"
          >
            Descargar CSV
          </a>
        </div>

        <ChangePasswordCard />
      </div>
    </div>
  );
}