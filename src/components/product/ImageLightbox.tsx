'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface ImageLightboxProps {
  images: { url: string; altText: string }[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ImageLightbox({
  images,
  initialIndex,
  open,
  onOpenChange,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)

  // Sync current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      } else if (e.key === 'ArrowLeft') {
        goPrev()
      } else if (e.key === 'ArrowRight') {
        goNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, goPrev, goNext, onOpenChange])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent default to stop page scroll while swiping
    if (touchStartX.current !== null) {
      e.preventDefault()
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      touchStartX.current = null

      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          goPrev()
        } else {
          goNext()
        }
      }
    },
    [goPrev, goNext]
  )

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onOpenChange(false)
      }
    },
    [onOpenChange]
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={handleOverlayClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Image counter - top left */}
          <div className="absolute top-4 left-4 z-10">
            <span className="text-sm font-medium text-neutral-400">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Close button - top right */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 rounded-full p-2.5 text-white/80 hover:text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="size-5" />
          </button>

          {/* Previous arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 rounded-full p-2.5 text-white/80 hover:text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 rounded-full p-2.5 text-white/80 hover:text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="size-6" />
            </button>
          )}

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center w-full px-16 py-16 sm:px-24 sm:py-20">
            <AnimatePresence mode="wait">
              <motion.img
                key={images[currentIndex]?.url}
                src={images[currentIndex]?.url}
                alt={images[currentIndex]?.altText || ''}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="w-full px-4 pb-6 pt-2">
              <div className="flex gap-2 overflow-x-auto justify-center max-w-2xl mx-auto">
                {images.map((image, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentIndex(i)
                    }}
                    className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                      currentIndex === i
                        ? 'border-red-600 opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}