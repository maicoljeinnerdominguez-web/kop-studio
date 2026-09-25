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
  Settings,
  Save,
  RotateCcw,
  ArrowLeft,
  Plus,
  Trash2,
  Tag,
  MessageCircle,
  Eye,
} from 'lucide-react';

interface ViewingMessage {
  text: string;
  product: string;
  count: number;
  type: 'viewing';
}

interface ActionMessage {
  text: string;
  action: string;
  product: string;
  time: string;
  type: 'action';
}

type SocialProofMessage = ViewingMessage | ActionMessage;

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

  // Section 5: Social Proof
  const [socialProofEnabled, setSocialProofEnabled] = useState(false);
  const [initialDelay, setInitialDelay] = useState(5);
  const [intervalMin, setIntervalMin] = useState(15);
  const [intervalMax, setIntervalMax] = useState(30);
  const [socialProofMessages, setSocialProofMessages] = useState<SocialProofMessage[]>(
    []
  );

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

        if (data.social_proof_messages) {
          try {
            setSocialProofMessages(JSON.parse(data.social_proof_messages));
          } catch {
            /* keep defaults */
          }
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

  function handleMessageFieldChange(
    index: number,
    field: string,
    value: string | number
  ) {
    setSocialProofMessages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function handleMessageToggleType(index: number) {
    setSocialProofMessages((prev) => {
      const next = [...prev];
      const current = next[index];
      if (current.type === 'viewing') {
        next[index] = {
          type: 'action',
          text: 'alguien en Bogotá',
          action: 'compró',
          product: '',
          time: 'hace 2 min',
        } as ActionMessage;
      } else {
        next[index] = {
          type: 'viewing',
          text: 'personas viendo',
          product: '',
          count: 3,
        } as ViewingMessage;
      }
      return next;
    });
  }

  function handleAddMessage() {
    setSocialProofMessages((prev) => [
      ...prev,
      {
        type: 'viewing',
        text: 'personas viendo',
        product: '',
        count: 3,
      } as ViewingMessage,
    ]);
  }

  function handleRemoveMessage(index: number) {
    setSocialProofMessages((prev) => prev.filter((_, i) => i !== index));
  }

  // --- Save ---

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        material_tags: JSON.stringify(materialTags),
        material_care: materialCare,
        garment_details: JSON.stringify(garmentDetails),
        wash_guide: JSON.stringify(washGuide),
        social_proof_enabled: String(socialProofEnabled),
        social_proof_initial_delay: String(Number(initialDelay) * 1000),
        social_proof_interval_min: String(Number(intervalMin) * 1000),
        social_proof_interval_max: String(Number(intervalMax) * 1000),
        social_proof_messages: JSON.stringify(socialProofMessages),
      };

      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      toast.success('Configuración guardada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  // --- Reset ---

  async function handleReset() {
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
            <Settings className="h-6 w-6 text-red-600" />
            <h1 className="text-2xl font-bold tracking-tight">
              Configuración del Sitio
            </h1>
          </div>
        </div>

        {/* ============================== */}
        {/* SECTION 1: Etiquetas de Material */}
        {/* ============================== */}
        <Card className="mb-6 border-[#1a1a1a] bg-[#0a0a0a]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
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
                  className="shrink-0 text-neutral-500 hover:text-red-600 hover:bg-[#1a1a1a]"
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
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
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
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
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
                  className="shrink-0 text-neutral-500 hover:text-red-600 hover:bg-[#1a1a1a]"
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
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
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
                  className="shrink-0 text-neutral-500 hover:text-red-600 hover:bg-[#1a1a1a]"
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
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
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

            {/* Messages */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Mensajes
              </Label>
              {socialProofMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#1a1a1a] bg-[#111] p-4 space-y-3"
                >
                  {/* Type toggle row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {msg.type === 'viewing' ? (
                        <Eye className="h-4 w-4 text-red-600" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        {msg.type === 'viewing' ? 'Viendo' : 'Acción'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
                        onClick={() => handleMessageToggleType(idx)}
                      >
                        Cambiar tipo
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-500 hover:text-red-600 hover:bg-[#1a1a1a]"
                        onClick={() => handleRemoveMessage(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Viewing type fields */}
                  {msg.type === 'viewing' && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-neutral-500">Texto</Label>
                        <Input
                          value={msg.text}
                          onChange={(e) =>
                            handleMessageFieldChange(idx, 'text', e.target.value)
                          }
                          className="border-[#1a1a1a] bg-[#0a0a0a] text-white focus:border-red-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-neutral-500">Producto</Label>
                        <Input
                          value={msg.product}
                          onChange={(e) =>
                            handleMessageFieldChange(idx, 'product', e.target.value)
                          }
                          className="border-[#1a1a1a] bg-[#0a0a0a] text-white focus:border-red-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-neutral-500">Cantidad</Label>
                        <Input
                          type="number"
                          min={1}
                          value={msg.count}
                          onChange={(e) =>
                            handleMessageFieldChange(idx, 'count', Number(e.target.value))
                          }
                          className="border-[#1a1a1a] bg-[#0a0a0a] text-white focus:border-red-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action type fields */}
                  {msg.type === 'action' && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-neutral-500">Texto</Label>
                        <Input
                          value={msg.text}
                          onChange={(e) =>
                            handleMessageFieldChange(idx, 'text', e.target.value)
                          }
                          className="border-[#1a1a1a] bg-[#0a0a0a] text-white focus:border-red-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-neutral-500">Acción</Label>
                        <Input
                          value={(msg as ActionMessage).action}
                          onChange={(e) =>
                            handleMessageFieldChange(idx, 'action', e.target.value)
                          }
                          className="border-[#1a1a1a] bg-[#0a0a0a] text-white focus:border-red-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-neutral-500">Producto</Label>
                        <Input
                          value={msg.product}
                          onChange={(e) =>
                            handleMessageFieldChange(idx, 'product', e.target.value)
                          }
                          className="border-[#1a1a1a] bg-[#0a0a0a] text-white focus:border-red-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-neutral-500">Tiempo</Label>
                        <Input
                          value={(msg as ActionMessage).time}
                          onChange={(e) =>
                            handleMessageFieldChange(idx, 'time', e.target.value)
                          }
                          className="border-[#1a1a1a] bg-[#0a0a0a] text-white focus:border-red-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="mt-1 gap-1 text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
                onClick={handleAddMessage}
              >
                <Plus className="h-4 w-4" />
                Agregar mensaje
              </Button>
            </div>
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

        <ChangePasswordCard />
      </div>
    </div>
  );
}