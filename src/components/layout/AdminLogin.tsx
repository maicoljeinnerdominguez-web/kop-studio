'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigationStore } from '@/stores/useNavigationStore';

interface AdminLoginProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminLogin({ open, onOpenChange }: AdminLoginProps) {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigationStore((s) => s.navigate);

  const [email, setEmail] = useState('admin@kopstudio.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Todos los campos son requeridos');
      setLoading(false);
      return;
    }

    const success = await login(email, password);

    if (success) {
      onOpenChange(false);
      navigate('admin-dashboard');
    } else {
      setError('Credenciales inválidas. Intenta de nuevo.');
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-[#262626] sm:max-w-sm">
        <DialogHeader className="text-left">
          <DialogTitle className="text-white text-lg uppercase tracking-wider font-bold">
            Acceso Admin
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-sm">
            Ingresa tus credenciales para acceder al panel de administración.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-email"
              className="text-neutral-400 text-xs uppercase tracking-wider font-medium"
            >
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-neutral-600 text-sm h-10 rounded-none focus-visible:border-red-600"
              placeholder="admin@email.com"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="text-neutral-400 text-xs uppercase tracking-wider font-medium"
            >
              Contraseña
            </label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-neutral-600 text-sm h-10 rounded-none focus-visible:border-red-600"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-wider font-bold h-10 rounded-none disabled:opacity-50"
          >
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </Button>

          {/* Demo Credentials Hint */}
          <p className="text-neutral-600 text-[11px] text-center leading-relaxed">
            Demo: admin@kopstudio.com / admin123
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}