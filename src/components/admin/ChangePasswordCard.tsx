'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';

export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al cambiar la contraseña');

      toast.success('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'border-[#1a1a1a] bg-[#111] text-white placeholder:text-neutral-500 focus:border-red-600';

  return (
    <Card className="mt-10 border-[#1a1a1a] bg-[#0a0a0a]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
          <KeyRound className="h-4 w-4" />
          Cambiar contraseña de administrador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="current-password" className="text-xs text-neutral-500">
              Contraseña actual
            </Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-password" className="text-xs text-neutral-500">
              Nueva contraseña (mín. 8)
            </Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm-password" className="text-xs text-neutral-500">
              Confirmar
            </Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 bg-red-600 text-white hover:bg-red-700"
            >
              {saving ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
