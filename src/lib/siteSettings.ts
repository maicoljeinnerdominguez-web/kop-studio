'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

export interface SiteSettingsData {
  materialTags: string[];
  materialCare: string;
  garmentDetails: string[];
  washGuide: string[];
}

const FALLBACK: SiteSettingsData = {
  materialTags: ['Algodón Premium', '240gsm', 'Made in Colombia'],
  materialCare:
    '100% Algodón Premium de 240gsm. Lavar a máquina en ciclo frío. No usar blanqueador. Secar a temperatura baja. Planchar del revés.',
  garmentDetails: [
    'Algodón premium 240gsm',
    'Corte oversize',
    'Impresión serigrafía',
    'Hecho en Colombia',
  ],
  washGuide: [
    'Lavar a mano con agua fría',
    'No usar blanqueador',
    'Secar a la sombra',
    'Planchar a baja temperatura',
  ],
};

function parse(data: Record<string, string>): SiteSettingsData {
  return {
    materialTags: safeJsonParse(data.material_tags, FALLBACK.materialTags),
    materialCare: data.material_care || FALLBACK.materialCare,
    garmentDetails: safeJsonParse(data.garment_details, FALLBACK.garmentDetails),
    washGuide: safeJsonParse(data.wash_guide, FALLBACK.washGuide),
  };
}

function safeJsonParse<T>(str: string | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// Simple in-memory cache shared across all hook instances
let cachedData: SiteSettingsData | null = null;
let cacheTimestamp = 0;
const CACHE_MS = 60_000;

export function useSiteSettings(): SiteSettingsData {
  const [settings, setSettings] = useState<SiteSettingsData>(cachedData || FALLBACK);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const now = Date.now();
    if (cachedData && now - cacheTimestamp < CACHE_MS) {
      return;
    }

    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        const parsed = parse(data);
        cachedData = parsed;
        cacheTimestamp = Date.now();
        setSettings(parsed);
      })
      .catch(() => {
        // Keep fallback
      });
  }, []);

  return settings;
}