'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const ANNOUNCEMENT_ITEMS = [
  '🔥 ENVIO GRATIS X COMPRAS SUPERIORES A $250.000',
  '🔥 APLICAN TYC',
];

function useAnnouncementDismissed() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('announcement-dismissed') === 'true';
  });

  const dismiss = () => {
    sessionStorage.setItem('announcement-dismissed', 'true');
    setDismissed(true);
  };

  return { dismissed, dismiss };
}

export default function AnnouncementBar() {
  const { dismissed, dismiss } = useAnnouncementDismissed();

  if (dismissed) return null;

  const renderItem = (key: string) => (
    <span key={key} className="inline-flex items-center">
      {ANNOUNCEMENT_ITEMS.map((item, i) => (
        <span key={`${key}-${i}`} className="inline-flex items-center">
          <span className="shimmer-text hover:text-white transition-colors cursor-pointer uppercase font-bold text-xs tracking-wider px-4">
            {item}
          </span>
          <span className="text-white/30 text-xs">•</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="announcement-gradient overflow-hidden w-full h-8 flex items-center relative">
      <div className="animate-marquee flex whitespace-nowrap">
        {renderItem('a')}
        {renderItem('b')}
        {renderItem('c')}
        {renderItem('d')}
      </div>
      <button
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-10 touch-target flex items-center justify-center p-1"
        aria-label="Cerrar anuncio"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}