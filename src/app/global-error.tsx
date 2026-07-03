'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-black text-white min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold uppercase tracking-wider">
              Error inesperado
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Ocurrió un error al cargar la página. Esto no afecta tus datos.
            </p>
          </div>
          {error.message && (
            <p className="text-xs text-neutral-600 font-mono break-all max-h-20 overflow-y-auto">
              {error.message}
            </p>
          )}
          <Button
            onClick={reset}
            className="bg-white text-black hover:bg-neutral-200 rounded-none uppercase tracking-wider text-sm font-bold px-8 py-3"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </body>
    </html>
  );
}