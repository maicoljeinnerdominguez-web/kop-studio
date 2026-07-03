'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, ShoppingBag, X } from 'lucide-react'

interface SocialMessage {
  text: string
  product: string
  count?: number
  action?: string
  time?: string
}

// Fallback messages with lower, more believable numbers
const FALLBACK_MESSAGES: SocialMessage[] = [
  { text: 'alguien en La Unión', action: 'acaba de comprar', product: 'Sivere Hoodie - Mandala Sacred', time: 'hace 2 min' },
  { text: 'personas viendo', product: 'Ascensión Tee - Angel Wings', count: 3 },
  { text: 'alguien en Medellín', action: 'agregó al carrito', product: 'Puffer Bag Urban - Chain Edition', time: 'hace 5 min' },
  { text: 'personas viendo', product: '72+1 Cargo Pants - Tactical Black', count: 2 },
  { text: 'alguien en Cali', action: 'compró', product: 'Memento Tee - Gothic Cross', time: 'hace 1 min' },
  { text: 'personas viendo', product: 'Basic Essential Tee - Midnight', count: 4 },
  { text: 'alguien en Barranquilla', action: 'acaba de comprar', product: 'Fiat Lux Tee - Oración', time: 'hace 3 min' },
]

const FALLBACK_CONFIG = {
  enabled: true,
  initialDelay: 15000,
  intervalMin: 35000,
  intervalMax: 60000,
}

export default function SocialProofNotification() {
  const [visible, setVisible] = useState(false)
  const [currentMsg, setCurrentMsg] = useState<SocialMessage | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [config, setConfig] = useState(FALLBACK_CONFIG)
  const [messages, setMessages] = useState<SocialMessage[]>(FALLBACK_MESSAGES)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Fetch settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        // Parse messages
        try {
          const parsed = JSON.parse(data.social_proof_messages)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
          }
        } catch { /* keep fallback */ }

        // Parse config
        setConfig({
          enabled: data.social_proof_enabled !== 'false',
          initialDelay: Number(data.social_proof_initial_delay) || 15000,
          intervalMin: Number(data.social_proof_interval_min) || 35000,
          intervalMax: Number(data.social_proof_interval_max) || 60000,
        })
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  // Clear all timers helper
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }, [])

  const show = useCallback(() => {
    if (messages.length === 0) return
    const msg = messages[Math.floor(Math.random() * messages.length)]
    setCurrentMsg(msg)
    setVisible(true)
    const hideTimer = setTimeout(() => setVisible(false), 5000)
    timersRef.current.push(hideTimer)
  }, [messages])

  useEffect(() => {
    if (dismissed || !config.enabled) return

    clearAllTimers()

    const initial = setTimeout(show, config.initialDelay)
    timersRef.current.push(initial)

    const scheduleNext = () => {
      const delay = config.intervalMin + Math.random() * (config.intervalMax - config.intervalMin)
      const next = setTimeout(() => {
        show()
        scheduleNext()
      }, delay)
      timersRef.current.push(next)
    }
    scheduleNext()

    return clearAllTimers
  }, [dismissed, config, show, clearAllTimers])

  if (!currentMsg) return null

  const isViewing = !currentMsg.action

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-20 left-4 sm:left-6 z-40 w-[calc(100%-2rem)] sm:w-auto max-w-xs"
        >
          <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3 shadow-2xl shadow-black/50 flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-[#1a1a1a] border border-[#222] flex items-center justify-center shrink-0">
              {isViewing ? (
                <Eye className="size-4 text-red-500" />
              ) : (
                <ShoppingBag className="size-4 text-red-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-neutral-400 leading-tight">
                {isViewing ? (
                  <>
                    <span className="text-white font-semibold">{currentMsg.count}</span>{' '}
                    {currentMsg.text}
                  </>
                ) : (
                  <>
                    {currentMsg.text}{' '}
                    <span className="text-white">{currentMsg.action}</span>
                  </>
                )}
              </p>
              <p className="text-[11px] text-white font-medium mt-0.5 truncate">
                {currentMsg.product}
              </p>
              {currentMsg.time && (
                <p className="text-[10px] text-neutral-600 mt-0.5">{currentMsg.time}</p>
              )}
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="text-neutral-600 hover:text-white transition-colors shrink-0 -mt-0.5 -mr-1"
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