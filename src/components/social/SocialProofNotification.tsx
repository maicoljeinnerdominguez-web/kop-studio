'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, ShoppingBag, X } from 'lucide-react'

const MESSAGES = [
  { text: 'alguien en La Unión', action: 'acaba de comprar', product: 'Sivere Hoodie - Mandala Sacred', time: 'hace 2 min' },
  { text: 'personas viendo', product: 'Ascensión Tee - Angel Wings', count: 12 },
  { text: 'alguien en Medellín', action: 'agregó al carrito', product: 'Puffer Bag Urban - Chain Edition', time: 'hace 5 min' },
  { text: 'personas viendo', product: '72+1 Cargo Pants - Tactical Black', count: 8 },
  { text: 'alguien en Cali', action: 'compró', product: 'Memento Tee - Gothic Cross', time: 'hace 1 min' },
  { text: 'personas viendo', product: 'Basic Essential Tee - Midnight', count: 15 },
  { text: 'alguien en Barranquilla', action: 'acaba de comprar', product: 'Fiat Lux Tee - Oración', time: 'hace 3 min' },
]

export default function SocialProofNotification() {
  const [visible, setVisible] = useState(false)
  const [currentMsg, setCurrentMsg] = useState<(typeof MESSAGES)[0] | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const show = useCallback(() => {
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
    setCurrentMsg(msg)
    setVisible(true)
    setTimeout(() => setVisible(false), 5000)
  }, [])

  useEffect(() => {
    if (dismissed) return

    const initial = setTimeout(show, 8000)

    let interval: ReturnType<typeof setTimeout>
    const scheduleNext = () => {
      const delay = 20000 + Math.random() * 15000
      interval = setTimeout(() => {
        show()
        scheduleNext()
      }, delay)
    }
    scheduleNext()

    return () => {
      clearTimeout(initial)
      clearTimeout(interval)
    }
  }, [dismissed, show])

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
            {/* Thumbnail placeholder */}
            <div className="w-10 h-10 rounded-md bg-[#1a1a1a] border border-[#222] flex items-center justify-center shrink-0">
              {isViewing ? (
                <Eye className="size-4 text-red-500" />
              ) : (
                <ShoppingBag className="size-4 text-red-500" />
              )}
            </div>

            {/* Content */}
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

            {/* Dismiss */}
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