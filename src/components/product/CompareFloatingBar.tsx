'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GitCompareArrows } from 'lucide-react'
import { useCompareStore } from '@/stores/useCompareStore'
import { useNavigationStore } from '@/stores/useNavigationStore'

export default function CompareFloatingBar() {
  const productIds = useCompareStore((s) => s.productIds)
  const removeProduct = useCompareStore((s) => s.removeProduct)
  const clearComparison = useCompareStore((s) => s.clearComparison)
  const navigate = useNavigationStore((s) => s.navigate)
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState(false)

  const count = productIds.length
  const show = count >= 2

  // Fetch thumbnails for each product
  useEffect(() => {
    productIds.forEach(async (id) => {
      if (thumbnails[id]) return
      try {
        const res = await fetch(`/api/products/${id}`)
        if (res.ok) {
          const data = await res.json()
          const primaryImg = data.images?.find((img: { isPrimary: boolean }) => img.isPrimary) || data.images?.[0]
          if (primaryImg) {
            setThumbnails((prev) => ({ ...prev, [id]: primaryImg.url }))
          }
        }
      } catch {
        // silent
      }
    })
  }, [productIds, thumbnails])

  // Animate in/out
  useEffect(() => {
    setVisible(show)
  }, [show])

  const handleCompare = () => {
    if (count >= 2) {
      navigate('product-comparison', { compare: productIds.join(',') })
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-[#1a1a1a]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
            {/* Thumbnails */}
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
              {productIds.map((id) => (
                <div key={id} className="relative group shrink-0">
                  <div className="w-12 h-12 rounded-md bg-[#111] border border-[#222] overflow-hidden">
                    {thumbnails[id] ? (
                      <img
                        src={thumbnails[id]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full animate-pulse bg-[#1a1a1a]" />
                    )}
                  </div>
                  <button
                    onClick={() => removeProduct(id)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Quitar de comparación"
                  >
                    <X className="size-2.5 text-white" />
                  </button>
                </div>
              ))}
              {count < 3 && (
                <span className="text-[10px] text-neutral-600 shrink-0">
                  Agrega {3 - count} más
                </span>
              )}
            </div>

            {/* Compare Button */}
            <button
              onClick={handleCompare}
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-sm transition-colors flex items-center gap-2"
            >
              <GitCompareArrows className="size-4" />
              COMPARAR ({count})
            </button>

            {/* Clear All */}
            <button
              onClick={clearComparison}
              className="shrink-0 text-neutral-500 hover:text-white transition-colors"
              aria-label="Limpiar comparación"
            >
              <X className="size-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}