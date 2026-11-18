'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import type { Product } from '@/types/data'
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  deleteImagesByUrls,
  extractFeatures,
  extractInStock,
  extractSpecifications,
  getAdminUser,
  getSupabaseAdmin,
  getSupabasePublic,
  requireAdmin,
  toProduct,
  uploadImages,
  type ProductRow,
  checkReviewRateLimit,
  recordReviewSubmission,
  toProductReview,
  verifySameOrigin,
  type ProductReview,
  type ProductReviewRow,
  type ReviewStatus,
} from '@/lib/supabase'

export interface ProductFilters {
  category?: string
  inStock?: boolean
  brand?: string
  room?: string
  style?: string
  search?: string
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
}

function safeRevalidate(productId?: number | string) {
  try {
    revalidatePath('/')
    revalidatePath('/products')
    revalidatePath('/admin')
    if (productId !== undefined) {
      revalidatePath(`/products/${productId}`)
    }
  } catch {
    // Игнорируем вне контекста запроса
  }
}

// --- Публичное чтение для Server Components ---

export async function getAllProducts(filters?: ProductFilters): Promise<Product[]> {
  let query = getSupabasePublic().from('products').select('*')

  if (filters?.category) query = query.eq('category', filters.category)
  if (typeof filters?.inStock === 'boolean') query = query.eq('in_stock', filters.inStock)
  if (filters?.brand) query = query.ilike('specifications->>brand', filters.brand)
  if (filters?.room) query = query.ilike('specifications->>room', filters.room)
  if (filters?.style) query = query.ilike('specifications->>style', filters.style)

  if (filters?.search) {
    const safe = filters.search.replace(/[,().%]/g, ' ').trim()
    if (safe) {
      query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%,category.ilike.%${safe}%`)
    }
  }

  switch (filters?.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true }).order('id', { ascending: false })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false }).order('id', { ascending: false })
      break
    case 'oldest':
      query = query.order('created_at', { ascending: true }).order('id', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false }).order('id', { ascending: false })
  }

  const { data, error } = await query
  if (error) {
    console.error('Could not fetch products from Supabase:', error.message)
    return []
  }
  return (data ?? []).map((row) => toProduct(row as ProductRow))
}

export async function getProductById(id: string | number): Promise<Product | undefined> {
  const numId = Number(id)
  if (!Number.isSafeInteger(numId) || numId <= 0) return undefined

  const { data, error } = await getSupabasePublic()
    .from('products')
    .select('*')
    .eq('id', numId)
    .maybeSingle()

  if (error || !data) return undefined
  return toProduct(data as ProductRow)
}

// --- CRUD товаров (защищены requireAdmin) ---

export async function createProduct(formData: FormData): Promise<Product> {
  await requireAdmin()

  const name = String(formData.get('name') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const price = Number(formData.get('price'))

  if (!name) throw new Error('Название товара обязательно')
  if (!category) throw new Error('Категория обязательна')
  if (!Number.isFinite(price) || price < 0) throw new Error('Некорректная цена')

  const rawOldPrice = String(formData.get('oldPrice') ?? '').trim()
  const oldPrice = rawOldPrice !== '' ? Number(rawOldPrice) : null
  if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < 0)) {
    throw new Error('Некорректная старая цена')
  }

  const imageFiles = formData
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.size > 0)
  const uploadedUrls = await uploadImages(imageFiles)

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .insert({
        name,
        price: Math.round(price * 100) / 100,
        old_price: oldPrice !== null ? Math.round(oldPrice * 100) / 100 : null,
        description,
        category,
        in_stock: extractInStock(formData) ?? false,
        images: uploadedUrls,
        features: extractFeatures(formData) ?? [],
        specifications: extractSpecifications(formData),
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    const product = toProduct(data as ProductRow)
    safeRevalidate(product.id)
    return product
  } catch (err) {
    if (uploadedUrls.length > 0) await deleteImagesByUrls(uploadedUrls).catch(() => {})
    throw err
  }
}

export async function updateProduct(
  id: string | number,
  formData: FormData
): Promise<Product | null> {
  await requireAdmin()

  const numId = Number(id)
  if (!Number.isSafeInteger(numId) || numId <= 0) return null

  const supabase = getSupabaseAdmin()
  const { data: existingData } = await supabase
    .from('products')
    .select('*')
    .eq('id', numId)
    .maybeSingle()

  if (!existingData) return null
  const existing = existingData as ProductRow

  const newImageFiles = formData
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.size > 0)
  const appendImages = formData.get('imageMode') === 'append'

  let uploadedUrls: string[] = []
  let nextImages = existing.images ?? []
  let imagesToDelete: string[] = []

  if (newImageFiles.length > 0) {
    uploadedUrls = await uploadImages(newImageFiles)
    if (appendImages) {
      nextImages = [...nextImages, ...uploadedUrls]
    } else {
      imagesToDelete = [...nextImages]
      nextImages = uploadedUrls
    }
  }

  try {
    const updatePayload: Record<string, unknown> = {
      specifications: extractSpecifications(formData, existing.specifications ?? {}),
    }

    if (formData.has('name')) {
      const name = String(formData.get('name') ?? '').trim()
      if (!name) throw new Error('Название не может быть пустым')
      updatePayload.name = name
    }
    if (formData.has('category')) {
      const category = String(formData.get('category') ?? '').trim()
      if (!category) throw new Error('Категория не может быть пустой')
      updatePayload.category = category
    }
    if (formData.has('description')) {
      updatePayload.description = String(formData.get('description') ?? '').trim()
    }
    if (formData.has('price')) {
      const price = Number(formData.get('price'))
      if (!Number.isFinite(price) || price < 0) throw new Error('Некорректная цена')
      updatePayload.price = Math.round(price * 100) / 100
    }
    if (formData.has('oldPrice')) {
      const rawOldPrice = String(formData.get('oldPrice') ?? '').trim()
      if (rawOldPrice === '') {
        updatePayload.old_price = null
      } else {
        const oldPrice = Number(rawOldPrice)
        if (!Number.isFinite(oldPrice) || oldPrice < 0) throw new Error('Некорректная старая цена')
        updatePayload.old_price = Math.round(oldPrice * 100) / 100
      }
    }

    const inStock = extractInStock(formData)
    if (inStock !== undefined) updatePayload.in_stock = inStock

    const features = extractFeatures(formData)
    if (features !== undefined) updatePayload.features = features

    if (newImageFiles.length > 0) updatePayload.images = nextImages

    const { data: updated, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', numId)
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    if (imagesToDelete.length > 0) {
      await deleteImagesByUrls(imagesToDelete).catch(() => {})
    }

    const product = toProduct(updated as ProductRow)
    safeRevalidate(product.id)
    return product
  } catch (err) {
    if (uploadedUrls.length > 0) await deleteImagesByUrls(uploadedUrls).catch(() => {})
    throw err
  }
}

export async function deleteProduct(id: string | number): Promise<boolean> {
  await requireAdmin()

  const numId = Number(id)
  if (!Number.isSafeInteger(numId) || numId <= 0) return false

  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .delete()
    .eq('id', numId)
    .select('images')
    .maybeSingle()

  if (error || !data) return false

  const images = (data as { images: string[] | null }).images
  if (images?.length) {
    await deleteImagesByUrls(images).catch(() => {})
  }

  safeRevalidate(numId)
  return true
}

export async function deleteProductImage(
  id: string | number,
  imageUrl: string
): Promise<Product | null> {
  await requireAdmin()

  const numId = Number(id)
  if (!Number.isSafeInteger(numId) || numId <= 0) return null

  const supabase = getSupabaseAdmin()
  const { data: row } = await supabase
    .from('products')
    .select('images')
    .eq('id', numId)
    .maybeSingle()

  if (!row) return null

  const currentImages = (row as { images: string[] | null }).images ?? []
  const nextImages = currentImages.filter((url) => url !== imageUrl)

  const { data: updated, error } = await supabase
    .from('products')
    .update({ images: nextImages })
    .eq('id', numId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await deleteImagesByUrls([imageUrl]).catch(() => {})
  safeRevalidate(numId)
  return toProduct(updated as ProductRow)
}

// --- Админские функции: сессия, статистика и массовые операции ---

export async function getAdminSession(): Promise<{ id: string; email?: string } | null> {
  const user = await getAdminUser(false)
  return user ? { id: user.id, email: user.email } : null
}

export async function loginAdmin(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { ok: false, error: 'Введите email и пароль' }
  }

  const { data, error } = await getSupabasePublic().auth.signInWithPassword({ email, password })
  if (error || !data.session || !data.user) {
    return { ok: false, error: 'Неверный email или пароль' }
  }

  if (data.user.app_metadata?.role !== 'admin') {
    return { ok: false, error: 'Недостаточно прав (нужна роль admin)' }
  }

  const cookieStore = await cookies()
  cookieStore.set(ACCESS_COOKIE, data.session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: data.session.expires_in,
  })
  cookieStore.set(REFRESH_COOKIE, data.session.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  safeRevalidate()
  return { ok: true }
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_COOKIE)
  cookieStore.delete(REFRESH_COOKIE)
  safeRevalidate()
}

export async function getCatalogStats() {
  await requireAdmin()
  const products = await getAllProducts()

  const categories: Record<string, number> = {}
  let inStockCount = 0
  let discountedCount = 0
  let sumPrice = 0

  for (const p of products) {
    if (p.inStock) inStockCount++
    if (p.oldPrice && p.oldPrice > p.price) discountedCount++
    sumPrice += p.price
    categories[p.category] = (categories[p.category] ?? 0) + 1
  }

  return {
    total: products.length,
    inStock: inStockCount,
    outOfStock: products.length - inStockCount,
    discounted: discountedCount,
    avgPrice: products.length ? Math.round((sumPrice / products.length) * 100) / 100 : 0,
    categories,
  }
}

export async function bulkUpdateStock(ids: number[], inStock: boolean): Promise<void> {
  await requireAdmin()
  if (!ids.length) return
  const { error } = await getSupabaseAdmin()
    .from('products')
    .update({ in_stock: inStock })
    .in('id', ids)
  if (error) throw new Error(error.message)
  safeRevalidate()
}

export async function bulkApplyDiscount(ids: number[], percent: number): Promise<void> {
  await requireAdmin()
  if (!ids.length) return
  if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
    throw new Error('Скидка должна быть от 1 до 99%')
  }

  const supabase = getSupabaseAdmin()
  const { data: rows, error } = await supabase
    .from('products')
    .select('id, price, old_price')
    .in('id', ids)

  if (error) throw new Error(error.message)

  await Promise.all(
    (rows ?? []).map((row) => {
      const base = row.old_price !== null ? Number(row.old_price) : Number(row.price)
      const discounted = Math.round(base * (1 - percent / 100) * 100) / 100
      return supabase.from('products').update({ old_price: base, price: discounted }).eq('id', row.id)
    })
  )
  safeRevalidate()
}

export async function bulkResetDiscount(ids: number[]): Promise<void> {
  await requireAdmin()
  if (!ids.length) return

  const supabase = getSupabaseAdmin()
  const { data: rows, error } = await supabase
    .from('products')
    .select('id, old_price')
    .in('id', ids)
    .not('old_price', 'is', null)

  if (error) throw new Error(error.message)

  await Promise.all(
    (rows ?? []).map((row) =>
      supabase
        .from('products')
        .update({ price: Number(row.old_price), old_price: null })
        .eq('id', row.id)
    )
  )
  safeRevalidate()
}

export async function bulkDeleteProducts(ids: number[]): Promise<void> {
  await requireAdmin()
  if (!ids.length) return

  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .delete()
    .in('id', ids)
    .select('images')

  if (error) throw new Error(error.message)

  const allImages = (data ?? []).flatMap((r) => (r as { images: string[] | null }).images ?? [])
  if (allImages.length > 0) {
    await deleteImagesByUrls(allImages).catch(() => {})
  }
  safeRevalidate()
}

export interface ProductRatingSummary {
  average: number
  count: number
}

// Публичное чтение одобренных отзывов и средней оценки
export async function getApprovedReviews(
  productId: string | number
): Promise<{ reviews: ProductReview[]; summary: ProductRatingSummary }> {
  const numId = Number(productId)
  if (!Number.isSafeInteger(numId) || numId <= 0) {
    return { reviews: [], summary: { average: 0, count: 0 } }
  }

  const { data, error } = await getSupabasePublic()
    .from('product_reviews')
    .select('id, product_id, author_name, rating, comment, status, created_at')
    .eq('product_id', numId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error || !data) {
    return { reviews: [], summary: { average: 0, count: 0 } }
  }

  const reviews = (data as ProductReviewRow[]).map(toProductReview)
  const count = reviews.length
  const average =
    count > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0

  return { reviews, summary: { average, count } }
}

// Публичная отправка отзыва (всегда уходит в status = 'pending')
export async function submitProductReview(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await verifySameOrigin()
  } catch {
    return { ok: false, error: 'Недопустимый источник запроса' }
  }

  // Honeypot против ботов: скрытое поле должно оставаться пустым
  if (String(formData.get('website') ?? '').trim() !== '') {
    return { ok: true }
  }

  const productId = Number(formData.get('productId'))
  const authorName = String(formData.get('authorName') ?? '').trim().slice(0, 80)
  const rating = Number(formData.get('rating'))
  const comment = String(formData.get('comment') ?? '').trim().slice(0, 1500)

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return { ok: false, error: 'Некорректный товар' }
  }
  if (authorName.length < 2) {
    return { ok: false, error: 'Введите имя (минимум 2 символа)' }
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: 'Выберите оценку от 1 до 5' }
  }

  const rateError = await checkReviewRateLimit(productId)
  if (rateError) {
    return { ok: false, error: rateError }
  }

  const supabase = getSupabaseAdmin()
  const { data: productExists } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .maybeSingle()

  if (!productExists) {
    return { ok: false, error: 'Товар не найден' }
  }

  const { error } = await supabase.from('product_reviews').insert({
    product_id: productId,
    author_name: authorName,
    rating,
    comment,
    status: 'pending',
  })

  if (error) {
    return { ok: false, error: 'Не удалось сохранить отзыв' }
  }

  await recordReviewSubmission(productId)
  safeRevalidate()
  return { ok: true }
}

// --- Модерация отзывов в админке ---

export async function getAdminReviews(
  statusFilter: ReviewStatus | 'all' = 'all'
): Promise<{
  reviews: ProductReview[]
  counts: { pending: number; approved: number; rejected: number; total: number }
}> {
  await requireAdmin()

  const { data, error } = await getSupabaseAdmin()
    .from('product_reviews')
    .select('id, product_id, author_name, rating, comment, status, created_at, products(name)')
    .order('created_at', { ascending: false })

  if (error || !data) {
    return { reviews: [], counts: { pending: 0, approved: 0, rejected: 0, total: 0 } }
  }

  const all = (data as ProductReviewRow[]).map(toProductReview)
  const counts = { pending: 0, approved: 0, rejected: 0, total: all.length }
  for (const r of all) {
    counts[r.status] += 1
  }

  const reviews = statusFilter === 'all' ? all : all.filter((r) => r.status === statusFilter)
  return { reviews, counts }
}

export async function moderateReview(
  reviewId: string | number,
  status: ReviewStatus
): Promise<void> {
  await requireAdmin()
  const numId = Number(reviewId)
  if (!Number.isSafeInteger(numId) || numId <= 0) throw new Error('Некорректный ID отзыва')
  if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
    throw new Error('Некорректный статус')
  }

  const { data, error } = await getSupabaseAdmin()
    .from('product_reviews')
    .update({ status, moderated_at: new Date().toISOString() })
    .eq('id', numId)
    .select('product_id')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Отзыв не найден')

  safeRevalidate((data as { product_id: number }).product_id)
}

export async function approveAllPendingReviews(): Promise<number> {
  await requireAdmin()

  const { data, error } = await getSupabaseAdmin()
    .from('product_reviews')
    .update({ status: 'approved', moderated_at: new Date().toISOString() })
    .eq('status', 'pending')
    .select('product_id')

  if (error) throw new Error(error.message)

  const affectedProductIds = Array.from(
    new Set((data ?? []).map((r) => (r as { product_id: number }).product_id))
  )
  safeRevalidate()
  for (const pid of affectedProductIds) safeRevalidate(pid)
  return data?.length ?? 0
}

export async function deleteReview(reviewId: string | number): Promise<void> {
  await requireAdmin()
  const numId = Number(reviewId)
  if (!Number.isSafeInteger(numId) || numId <= 0) throw new Error('Некорректный ID отзыва')

  const { data, error } = await getSupabaseAdmin()
    .from('product_reviews')
    .delete()
    .eq('id', numId)
    .select('product_id')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (data) safeRevalidate((data as { product_id: number }).product_id)
}