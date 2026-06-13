'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/useCartStore'
import { useNavigationStore } from '@/stores/useNavigationStore'

const ABANDONED_DELAY_MS = 60_000 // 60 seconds for demo
const SESSION_DISMISSED_KEY = 'kop-cart-abandoned-dismissed'
const SESSION_FIRST_ITEM_KEY = 'kop-cart-first-item-ts'

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getSessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

function setSessionFlag(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // sessionStorage may not be available
  }
}

export default function AbandonedCartNotification() {
  const items = useCartStore((s) => s.items)
  const getItemCount = useCartStore((s) => s.getItemCount)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const navigate = useNavigationStore()
  const [visible, setVisible] = useState(false)
  const dismissedRef = useRef(getSessionFlag(SESSION_DISMISSED_KEY))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showNotification = useCallback(() => {
    if (!dismissedRef.current) {
      setVisible(true)
    }
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    dismissedRef.current = true
    setSessionFlag(SESSION_DISMISSED_KEY, 'true')
  }, [])

  // Set up the abandoned cart timer
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const hasItems = items.length > 0
    if (!hasItems || dismissedRef.current) return

    // Record timestamp when items are first detected
    const existingTs = sessionStorage.getItem(SESSION_FIRST_ITEM_KEY)
    if (!existingTs) {
      setSessionFlag(SESSION_FIRST_ITEM_KEY, Date.now().toString())
    }

    const firstItemTs = Number(sessionStorage.getItem(SESSION_FIRST_ITEM_KEY)) || Date.now()
    const elapsed = Date.now() - firstItemTs

    if (elapsed >= ABANDONED_DELAY_MS) {
      // Use queueMicrotask to avoid synchronous setState in effect
      queueMicrotask(showNotification)
    } else {
      const remaining = ABANDONED_DELAY_MS - elapsed
      timerRef.current = setTimeout(() => {
        const stillDismissed = getSessionFlag(SESSION_DISMISSED_KEY)
        const currentItems = useCartStore.getState().items
        if (currentItems.length > 0 && !stillDismissed) {
          showNotification()
        }
      }, remaining)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [items.length, showNotification])

  // Hide notification when navigating to checkout
  useEffect(() => {
    const unsub = useNavigationStore.subscribe((state) => {
      if (state.currentView === 'checkout') {
        setVisible(false)
      }
    })
    return unsub
  }, [])

  const count = getItemCount()
  const subtotal = getSubtotal()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 right-6 left-6 sm:left-auto sm:max-w-md z-[60]"
        >
          <div className="bg-[#111] border border-[#1a1a1a] p-4 flex items-center gap-4 shadow-2xl shadow-black/50">
            <div className="flex-shrink-0 w-10 h-10 bg-red-600/10 flex items-center justify-center">
              <ShoppingBag className="size-5 text-red-500" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white tracking-wide">
                ¿Olvidaste algo?
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {count} {count === 1 ? 'artículo' : 'artículos'} en tu carrito —{' '}
                <span className="text-white font-medium">{formatCOP(subtotal)}</span>
              </p>
            </div>

            <Button
              onClick={() => {
                dismiss()
                navigate('checkout')
              }}
              className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 h-auto rounded-none"
            >
              IR A PAGAR →
            </Button>

            <button
              onClick={dismiss}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}