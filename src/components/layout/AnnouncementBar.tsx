'use client';

export default function AnnouncementBar() {
  const text =
    '🔥 ENVIO GRATIS X COMPRAS SUPERIORES A $250.000 🔥 APLICAN TYC';

  return (
    <div className="announcement-gradient overflow-hidden w-full h-8 flex items-center relative">
      <div className="animate-marquee flex whitespace-nowrap">
        {/* Duplicate the text for seamless infinite loop */}
        <span className="text-white uppercase font-bold text-xs tracking-wider px-4">
          {text}
        </span>
        <span className="text-white uppercase font-bold text-xs tracking-wider px-4">
          {text}
        </span>
        <span className="text-white uppercase font-bold text-xs tracking-wider px-4">
          {text}
        </span>
        <span className="text-white uppercase font-bold text-xs tracking-wider px-4">
          {text}
        </span>
      </div>
    </div>
  );
}