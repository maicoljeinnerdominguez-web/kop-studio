'use client'

import { useReducer, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface ProductLightboxProps {
  images: { url: string; altText: string }[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface LightboxState {
  currentIndex: number
  scale: number
  translate: { x: number; y: number }
  isDragging: boolean
  dragStart: { x: number; y: number }
}

type LightboxAction =
  | { type: 'OPEN'; index: number }
  | { type: 'GO_PREV'; total: number }
  | { type: 'GO_NEXT'; total: number }
  | { type: 'SELECT_INDEX'; index: number }
  | { type: 'SET_SCALE'; scale: number; translate: { x: number; y: number } }
  | { type: 'START_DRAG'; x: number; y: number }
  | { type: 'DRAG'; x: number; y: number }
  | { type: 'END_DRAG' }
  | { type: 'RESET_ZOOM' }

function lightboxReducer(state: LightboxState, action: LightboxAction): LightboxState {
  switch (action.type) {
    case 'OPEN':
      return {
        currentIndex: action.index,
        scale: 1,
        translate: { x: 0, y: 0 },
        isDragging: false,
        dragStart: { x: 0, y: 0 },
      }
    case 'GO_PREV':
      return {
        ...state,
        currentIndex: state.currentIndex === 0 ? action.total - 1 : state.currentIndex - 1,
        scale: 1,
        translate: { x: 0, y: 0 },
      }
    case 'GO_NEXT':
      return {
        ...state,
        currentIndex: state.currentIndex === action.total - 1 ? 0 : state.currentIndex + 1,
        scale: 1,
        translate: { x: 0, y: 0 },
      }
    case 'SELECT_INDEX':
      return {
        ...state,
        currentIndex: action.index,
        scale: 1,
        translate: { x: 0, y: 0 },
      }
    case 'SET_SCALE':
      return { ...state, scale: action.scale, translate: action.translate }
    case 'START_DRAG':
      return {
        ...state,
        isDragging: true,
        dragStart: { x: action.x - state.translate.x, y: action.y - state.translate.y },
      }
    case 'DRAG':
      return {
        ...state,
        translate: { x: action.x - state.dragStart.x, y: action.y - state.dragStart.y },
      }
    case 'END_DRAG':
      return { ...state, isDragging: false }
    case 'RESET_ZOOM':
      return { ...state, scale: 1, translate: { x: 0, y: 0 } }
    default:
      return state
  }
}

const initialState: LightboxState = {
  currentIndex: 0,
  scale: 1,
  translate: { x: 0, y: 0 },
  isDragging: false,
  dragStart: { x: 0, y: 0 },
}

export default function ProductLightbox({
  images,
  initialIndex,
  open,
  onOpenChange,
}: ProductLightboxProps) {
  const [state, dispatch] = useReducer(lightboxReducer, initialState)
  const touchStartX = useRef<number | null>(null)
  const touchStartDist = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle open/close - sync initial index when opening
  useEffect(() => {
    if (open) {
      dispatch({ type: 'OPEN', index: initialIndex })
    }
  }, [open, initialIndex])

  const goPrev = useCallback(() => {
    dispatch({ type: 'GO_PREV', total: images.length })
  }, [images.length])

  const goNext = useCallback(() => {
    dispatch({ type: 'GO_NEXT', total: images.length })
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      } else if (e.key === 'ArrowLeft' && state.scale <= 1) {
        goPrev()
      } else if (e.key === 'ArrowRight' && state.scale <= 1) {
        goNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, goPrev, goNext, onOpenChange, state.scale])

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

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.15 : 0.15
      const newScale = Math.min(Math.max(state.scale + delta, 1), 3)
      const newTranslate = newScale <= 1 ? { x: 0, y: 0 } : state.translate
      dispatch({ type: 'SET_SCALE', scale: newScale, translate: newTranslate })
    },
    [state.scale, state.translate]
  )

  // Pinch-to-zoom handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      touchStartDist.current = dist
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist.current !== null) {
        e.preventDefault()
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const pinchScale = dist / touchStartDist.current
        const newScale = Math.min(Math.max(pinchScale, 1), 3)
        const newTranslate = newScale <= 1 ? { x: 0, y: 0 } : state.translate
        dispatch({ type: 'SET_SCALE', scale: newScale, translate: newTranslate })
      } else if (e.touches.length === 1 && state.scale > 1) {
        e.preventDefault()
      } else if (touchStartX.current !== null && state.scale <= 1) {
        e.preventDefault()
      }
    },
    [state.scale, state.translate]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 0) {
        touchStartDist.current = null
        if (touchStartX.current !== null && state.scale <= 1) {
          const deltaX = e.changedTouches[0].clientX - touchStartX.current
          touchStartX.current = null

          if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
              goPrev()
            } else {
              goNext()
            }
          }
        }
      }
    },
    [goPrev, goNext, state.scale]
  )

  // Drag to pan when zoomed
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (state.scale <= 1) return
      e.preventDefault()
      dispatch({ type: 'START_DRAG', x: e.clientX, y: e.clientY })
    },
    [state.scale]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!state.isDragging || state.scale <= 1) return
      dispatch({ type: 'DRAG', x: e.clientX, y: e.clientY })
    },
    [state.isDragging, state.scale]
  )

  const handleMouseUp = useCallback(() => {
    dispatch({ type: 'END_DRAG' })
  }, [])

  // Double-click to toggle zoom
  const handleDoubleClick = useCallback(() => {
    if (state.scale > 1) {
      dispatch({ type: 'RESET_ZOOM' })
    } else {
      dispatch({ type: 'SET_SCALE', scale: 2, translate: { x: 0, y: 0 } })
    }
  }, [state.scale])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && state.scale <= 1) {
        onOpenChange(false)
      }
    },
    [onOpenChange, state.scale]
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
              {state.currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Zoom level indicator */}
          {state.scale > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="text-xs font-medium text-neutral-500 bg-white/10 px-3 py-1 rounded-full">
                {Math.round(state.scale * 100)}%
              </span>
            </div>
          )}

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

          {/* Main image with zoom support */}
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center w-full px-16 py-16 sm:px-24 sm:py-20 overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: state.scale > 1 ? (state.isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={images[state.currentIndex]?.url}
                src={images[state.currentIndex]?.url}
                alt={images[state.currentIndex]?.altText || ''}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDoubleClick()
                }}
                style={{
                  transform: `scale(${state.scale}) translate(${state.translate.x / state.scale}px, ${state.translate.y / state.scale}px)`,
                  transition: state.isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
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
                      dispatch({ type: 'SELECT_INDEX', index: i })
                    }}
                    className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                      state.currentIndex === i
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