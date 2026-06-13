'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { ProductReview } from '@/types'

interface ReviewsData {
  reviews: ProductReview[]
  averageRating: number
  totalReviews: number
}

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  const cls = size === 'xs' ? 'size-3' : 'size-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${
            star <= rating
              ? 'fill-yellow-500 text-yellow-500'
              : 'fill-[#333] text-[#333]'
          }`}
        />
      ))}
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [data, setData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [authorName, setAuthorName] = useState('')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, rating, title: title || undefined, comment }),
      })
      const json = await res.json()

      if (res.ok) {
        toast.success('¡Reseña publicada!')
        setAuthorName('')
        setRating(0)
        setTitle('')
        setComment('')
        fetchReviews()
      } else {
        const errors = json.errors || ['Error al publicar']
        toast.error(errors[0])
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = data?.reviews.filter((r) => r.rating === star).length || 0
    const pct = data?.totalReviews ? (count / data.totalReviews) * 100 : 0
    return { star, count, pct }
  })

  if (loading) {
    return (
      <section className="mt-20 pb-12">
        <div className="flex items-center mb-8">
          <div>
            <div className="h-4 w-48 bg-[#222] animate-pulse rounded" />
            <div className="h-0.5 w-12 bg-[#333] mt-2" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-[#111] rounded-md animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mt-20 pb-12">
      {/* Heading */}
      <div className="flex items-center mb-8">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            Reseñas
          </h2>
          <div className="h-0.5 w-12 bg-red-600 mt-2" />
        </div>
      </div>

      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        {/* Left: Average */}
        <div className="flex flex-col items-center sm:items-start gap-1 shrink-0">
          <span className="text-4xl font-bold text-white">
            {data?.averageRating || 0}
          </span>
          <StarRating rating={Math.round(data?.averageRating || 0)} />
          <span className="text-sm text-neutral-500 mt-1">
            {data?.totalReviews || 0} reseña{((data?.totalReviews || 0) !== 1) ? 's' : ''}
          </span>
        </div>

        {/* Right: Bars */}
        <div className="flex-1 flex flex-col gap-1.5 justify-center">
          {distribution.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 w-4 text-right">
                {star}
              </span>
              <div className="flex-1 bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-red-600 rounded-full"
                />
              </div>
              <span className="text-xs text-neutral-500 w-8 text-right">
                {Math.round(pct)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {data && data.reviews.length > 0 && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="divide-y divide-[#1a1a1a]"
        >
          {data.reviews.map((review) => (
            <motion.div
              key={review.id}
              variants={fadeUp}
              className="py-6 first:pt-0 last:pb-0"
            >
              {/* Top row */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {review.authorName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white font-medium">
                  {review.authorName}
                </span>
                <StarRating rating={review.rating} size="xs" />
                <span className="text-xs text-neutral-500 ml-auto hidden sm:block">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Mobile date */}
              <span className="text-xs text-neutral-500 sm:hidden mt-1 block">
                {formatDate(review.createdAt)}
              </span>

              {/* Title */}
              {review.title && (
                <p className="text-sm text-white font-medium mt-2">
                  {review.title}
                </p>
              )}

              {/* Comment */}
              <p className="text-sm text-neutral-300 leading-relaxed mt-1">
                {review.comment}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {data && data.reviews.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          Aún no hay reseñas para este producto. ¡Sé el primero!
        </p>
      )}

      {/* Write Review Form */}
      <div className="mt-12 border-t border-[#1a1a1a] pt-8">
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            Escribir una Reseña
          </h3>
          <div className="h-0.5 w-16 bg-red-600 mt-2" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
          {/* Name */}
          <div>
            <label className="text-xs text-neutral-400 uppercase tracking-wider block mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-[#111] border border-[#333] text-sm text-white placeholder:text-[#555] px-4 py-2.5 focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="text-xs text-neutral-400 uppercase tracking-wider block mb-2">
              Calificación
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5 transition-transform hover:scale-110"
                  aria-label={`${star} estrellas`}
                >
                  <Star
                    className={`size-6 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-[#333]'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-xs text-neutral-500 ml-2">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Title (optional) */}
          <div>
            <label className="text-xs text-neutral-400 uppercase tracking-wider block mb-2">
              Título <span className="normal-case text-[#555]">(opcional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resumen de tu experiencia"
              className="w-full bg-[#111] border border-[#333] text-sm text-white placeholder:text-[#555] px-4 py-2.5 focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs text-neutral-400 uppercase tracking-wider block mb-2">
              Comentario
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia con este producto..."
              rows={3}
              className="w-full bg-[#111] border border-[#333] text-sm text-white placeholder:text-[#555] px-4 py-2.5 focus:outline-none focus:border-white/50 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider h-10 px-6 rounded-none disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Publicar Reseña
          </Button>
        </form>
      </div>
    </section>
  )
}