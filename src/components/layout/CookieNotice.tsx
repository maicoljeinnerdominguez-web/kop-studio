'use client';

import { useState } from 'react';
import { useHydrated } from '@/hooks/use-hydrated';
import { useNavigationStore } from '@/stores/useNavigationStore';

const STORAGE_KEY = 'kop-cookie-notice';

// The store only uses strictly necessary cookies/storage (session, cart), so
// this is an informative notice, not a tracking-consent prompt. If analytics
// or ads are ever added, they must wait for explicit consent here.
export default function CookieNotice() {
  const navigate = useNavigationStore((s) => s.navigate);
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);

  const alreadySeen = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'ok';
    } catch {
      return false;
    }
  };
  const visible = hydrated && !dismissed && !alreadySeen();

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'ok');
    } catch {
      /* private mode: just hide */
    }
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#262626] bg-[#0a0a0a]/95 backdrop-blur px-4 py-3"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-neutral-300">
          Usamos solo cookies y almacenamiento <span className="text-white">necesarios</span> para tu
          sesión y tu carrito. No usamos cookies de publicidad ni de rastreo.{' '}
          <button
            onClick={() => navigate('info-page', { slug: 'privacidad' })}
            className="underline underline-offset-2 hover:text-white"
          >
            Política de privacidad y cookies
          </button>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-neutral-200"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
