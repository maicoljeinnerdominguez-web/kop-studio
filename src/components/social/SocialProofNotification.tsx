'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'

// Shows REAL recent purchases only (from /api/social-proof). If there are no
// real purchases, nothing is shown — invented activity would be misleading
// advertising under Colombian consumer law (Ley 1480).

interface RecentPurchase {
  city: string
  product: string
  at: string
}

const FALLBACK_CONFIG = {
  enabled: true,
  initialDelay: 15000,
  intervalMin: 35000,
  intervalMax: 60000,
}

function timeAgo(iso: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.round(hours / 24)
  return days === 1 ? 'hace 1 día' : `hace ${days} días`
}

export default function SocialProofNotification() {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<RecentPurchase | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [config, setConfig] = useState(FALLBACK_CONFIG)
  const [purchases, setPurchases] = useState<RecentPurchase[]>([])
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const indexRef = useRef(0)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        setConfig({
          enabled: data.social_proof_enabled !== 'false',
          initialDelay: Number(data.social_proof_initial_delay) || 15000,
          intervalMin: Number(data.social_proof_interval_min) || 35000,
          intervalMax: Number(data.social_proof_interval_max) || 60000,
        })
      })
      .catch(() => { /* keep fallback */ })

    fetch('/api/social-proof')
      .then(r => r.json())
      .then((data: { items?: RecentPurchase[] }) => setPurchases(Array.isArray(data.items) ? data.items : []))
      .catch(() => setPurchases([]))
  }, [])

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }, [])

  // Cycle through real purchases in order, each shown once per visit
  const show = useCallback(() => {
    if (indexRef.current >= purchases.length) return false
    setCurrent(purchases[indexRef.current++])
    setVisible(true)
    timersRef.current.push(setTimeout(() => setVisible(false), 5000))
    return true
  }, [purchases])

  useEffect(() => {
    if (dismissed || !config.enabled || purchases.length === 0) return

    clearAllTimers()

    const scheduleNext = (delay: number) => {
      timersRef.current.push(
        setTimeout(() => {
          if (show()) {
            scheduleNext(config.intervalMin + Math.random() * (config.intervalMax - config.intervalMin))
          }
        }, delay)
      )
    }
    scheduleNext(config.initialDelay)

    return clearAllTimers
  }, [dismissed, config, purchases, show, clearAllTimers])

  if (!current) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-20 left-4 sm:left-6 z-40 w-[calc(100%-2rem)] sm:w-auto max-w-xs"
          role="status"
        >
          <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3 shadow-2xl shadow-black/50 flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-[#1a1a1a] border border-[#222] flex items-center justify-center shrink-0">
              <ShoppingBag className="size-4 text-red-500" aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-neutral-400 leading-tight">
                Alguien en {current.city} <span className="text-white">compró</span>
              </p>
              <p className="text-[11px] text-white font-medium mt-0.5 truncate">
                {current.product}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{timeAgo(current.at)}</p>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="text-neutral-400 hover:text-white transition-colors shrink-0 -mt-0.5 -mr-1"
              aria-label="Cerrar notificación"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
