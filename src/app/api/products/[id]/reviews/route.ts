import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const reviews = await db.review.findMany({
    where: { productId: id },
    orderBy: { createdAt: 'desc' },
  })

  const totalReviews = reviews.length
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

  return NextResponse.json({
    reviews,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = rateLimit(request, 'reviews', 5, 60 * 60 * 1000)
  if (limited) return limited

  const { id } = await params

  try {
    const body = await request.json()
    const { authorName, rating, title, comment } = body

    // Validate
    const errors: string[] = []

    if (!authorName || typeof authorName !== 'string' || authorName.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres')
    } else if (authorName.trim().length > 60) {
      errors.push('El nombre no puede superar los 60 caracteres')
    }

    if (title !== undefined && title !== null && (typeof title !== 'string' || title.length > 120)) {
      errors.push('El título no puede superar los 120 caracteres')
    }

    if (
      rating === undefined ||
      typeof rating !== 'number' ||
      rating < 1 ||
      rating > 5
    ) {
      errors.push('La calificación debe ser entre 1 y 5')
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 10) {
      errors.push('El comentario debe tener al menos 10 caracteres')
    } else if (comment.trim().length > 2000) {
      errors.push('El comentario no puede superar los 2000 caracteres')
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    // Verify product exists
    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json(
        { errors: ['Producto no encontrado'] },
        { status: 404 }
      )
    }

    const review = await db.review.create({
      data: {
        productId: id,
        authorName: authorName.trim(),
        rating: Math.round(rating),
        title: typeof title === 'string' && title.trim() ? title.trim() : null,
        comment: comment.trim(),
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (err) {
    console.error('Review creation error:', err)
    return NextResponse.json(
      { errors: ['Error al crear la reseña'] },
      { status: 500 }
    )
  }
}
// DELETE /api/products/:id/reviews?reviewId=... — admin moderation (fake/abusive reviews)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await params
  const reviewId = new URL(request.url).searchParams.get('reviewId')
  if (!reviewId) {
    return NextResponse.json({ errors: ['reviewId requerido'] }, { status: 400 })
  }

  const deleted = await db.review.deleteMany({ where: { id: reviewId, productId: id } })
  if (deleted.count === 0) {
    return NextResponse.json({ errors: ['Reseña no encontrada'] }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
