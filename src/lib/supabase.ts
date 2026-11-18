import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import type { Product } from '@/types/data'

export interface ProductRow {
  id: number
  name: string
  price: number | string
  old_price: number | string | null
  description: string
  category: string
  in_stock: boolean
  images: string[] | null
  features: string[] | null
  specifications: Product['specifications'] | null
  created_at?: string
  updated_at?: string
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface ProductReview {
  id: number
  productId: number
  productName?: string
  authorName: string
  rating: number
  comment: string
  status: ReviewStatus
  createdAt: string
}

export interface ProductReviewRow {
  id: number
  product_id: number
  author_name: string
  rating: number
  comment: string
  status: ReviewStatus
  created_at: string
  products?: { name: string } | Array<{ name: string }> | null
}

export interface ProductSpecifications {
  brand?: string
  collection?: string
  style?: string
  room?: string
  warranty?: string
  country?: string
}

export const STORAGE_BUCKET = 'products'
export const ACCESS_COOKIE = 'sb-access-token'
export const REFRESH_COOKIE = 'sb-refresh-token'

const SPEC_KEYS = ['brand', 'collection', 'style', 'room', 'warranty', 'country'] as const
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 МБ
const MAX_FILES = 10

interface RateLimitEntry {
  count: number
  resetAt: number
}

// --- Rate Limiter: логин ---
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS_PER_PAIR = 5
const MAX_ATTEMPTS_PER_IP = 10
const loginAttempts = new Map<string, RateLimitEntry>()

// --- Rate Limiter: отзывы ---
const REVIEW_PAIR_WINDOW_MS = 5 * 60 * 1000
const REVIEW_IP_WINDOW_MS = 15 * 60 * 1000
const reviewAttempts = new Map<string, RateLimitEntry>()

function pruneMap(map: Map<string, RateLimitEntry>, maxSize: number, now: number) {
  if (map.size <= maxSize) return
  for (const [k, v] of map) {
    if (v.resetAt <= now) map.delete(k)
  }
}

export async function getClientIp(): Promise<string> {
  const hdrs = await headers()
  const forwarded = hdrs.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return hdrs.get('x-real-ip')?.trim() || 'unknown'
}

export async function checkLoginRateLimit(
  email: string
): Promise<{ allowed: boolean; retryMin?: number }> {
  const now = Date.now()
  pruneMap(loginAttempts, 500, now)
  const ip = await getClientIp()

  const pair = loginAttempts.get(`pair:${ip}:${email.toLowerCase()}`)
  if (pair && pair.resetAt > now && pair.count >= MAX_ATTEMPTS_PER_PAIR) {
    return { allowed: false, retryMin: Math.ceil((pair.resetAt - now) / 60000) }
  }

  const byIp = loginAttempts.get(`ip:${ip}`)
  if (byIp && byIp.resetAt > now && byIp.count >= MAX_ATTEMPTS_PER_IP) {
    return { allowed: false, retryMin: Math.ceil((byIp.resetAt - now) / 60000) }
  }

  return { allowed: true }
}

export async function recordFailedLogin(email: string): Promise<void> {
  const now = Date.now()
  const ip = await getClientIp()
  for (const key of [`pair:${ip}:${email.toLowerCase()}`, `ip:${ip}`]) {
    const cur = loginAttempts.get(key)
    if (!cur || cur.resetAt <= now) {
      loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    } else {
      cur.count += 1
    }
  }
}

export async function clearLoginRateLimit(email: string): Promise<void> {
  const ip = await getClientIp()
  loginAttempts.delete(`pair:${ip}:${email.toLowerCase()}`)
}

export async function checkReviewRateLimit(productId: number): Promise<string | null> {
  const now = Date.now()
  pruneMap(reviewAttempts, 1000, now)
  const ip = await getClientIp()

  const pair = reviewAttempts.get(`rev-pair:${ip}:${productId}`)
  if (pair && pair.resetAt > now) {
    return 'Вы недавно уже оставляли оценку для этого товара. Попробуйте позже.'
  }

  const byIp = reviewAttempts.get(`rev-ip:${ip}`)
  if (byIp && byIp.resetAt > now && byIp.count >= 5) {
    return 'Слишком много отправок за короткое время. Попробуйте позже.'
  }

  return null
}

export async function recordReviewSubmission(productId: number): Promise<void> {
  const now = Date.now()
  const ip = await getClientIp()

  reviewAttempts.set(`rev-pair:${ip}:${productId}`, {
    count: 1,
    resetAt: now + REVIEW_PAIR_WINDOW_MS,
  })

  const ipKey = `rev-ip:${ip}`
  const cur = reviewAttempts.get(ipKey)
  if (!cur || cur.resetAt <= now) {
    reviewAttempts.set(ipKey, { count: 1, resetAt: now + REVIEW_IP_WINDOW_MS })
  } else {
    cur.count += 1
  }
}

// --- Клиенты Supabase ---

function getEnv(name: string, fallback?: string): string {
  const raw = process.env[name] ?? (fallback ? process.env[fallback] : undefined)
  const value = raw?.trim().replace(/^["']|["']$/g, '')
  if (!value) throw new Error(`Missing env variable: ${name}`)
  return value
}

export function getSupabasePublic(): SupabaseClient {
  return createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export function toProduct(row: ProductRow): Product {
  return {
    id: Number(row.id),
    name: row.name,
    price: Number(row.price),
    ...(row.old_price !== null && row.old_price !== undefined
      ? { oldPrice: Number(row.old_price) }
      : {}),
    description: row.description ?? '',
    category: row.category,
    inStock: Boolean(row.in_stock),
    images: Array.isArray(row.images) ? row.images : [],
    features: Array.isArray(row.features) ? row.features : [],
    specifications: row.specifications ?? {},
  }
}

export function toProductReview(row: ProductReviewRow): ProductReview {
  const productName = Array.isArray(row.products)
    ? row.products[0]?.name
    : row.products?.name

  return {
    id: Number(row.id),
    productId: Number(row.product_id),
    ...(productName ? { productName } : {}),
    authorName: row.author_name,
    rating: Number(row.rating),
    comment: row.comment ?? '',
    status: row.status,
    createdAt: row.created_at,
  }
}

// --- CSRF (Origin) + Auth + RBAC ---

export async function verifySameOrigin(): Promise<void> {
  const hdrs = await headers()
  const origin = hdrs.get('origin')
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host')
  if (!origin || !host) return

  let originHost = ''
  try {
    originHost = new URL(origin).host
  } catch {
    throw new Error('Forbidden: invalid origin')
  }
  if (originHost !== host) {
    throw new Error('Forbidden: cross-origin request rejected')
  }
}

export async function getAdminUser(allowCookieRefresh = false): Promise<User | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value

  if (accessToken) {
    const { data, error } = await getSupabaseAdmin().auth.getUser(accessToken)
    if (!error && data.user?.app_metadata?.role === 'admin') {
      return data.user
    }
  }

  if (refreshToken) {
    const { data, error } = await getSupabasePublic().auth.refreshSession({
      refresh_token: refreshToken,
    })
    if (!error && data.session && data.user?.app_metadata?.role === 'admin') {
      if (allowCookieRefresh) {
        try {
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
        } catch {
          // Запись куки внутри Server Component недоступна
        }
      }
      return data.user
    }
  }

  return null
}

export async function requireAdmin(): Promise<User> {
  await verifySameOrigin()
  const user = await getAdminUser(true)
  if (!user) {
    throw new Error('Требуется авторизация администратора')
  }
  return user
}

// --- Работа со Storage ---

function detectImageType(bytes: Uint8Array): { ext: string; contentType: string } | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: 'jpg', contentType: 'image/jpeg' }
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { ext: 'png', contentType: 'image/png' }
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { ext: 'gif', contentType: 'image/gif' }
  }
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { ext: 'webp', contentType: 'image/webp' }
  }
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11])
    if (brand === 'avif' || brand === 'avis') {
      return { ext: 'avif', contentType: 'image/avif' }
    }
  }
  return null
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const validFiles = files.filter((f) => f && f.size > 0)
  if (validFiles.length === 0) return []
  if (validFiles.length > MAX_FILES) {
    throw new Error(`Максимум ${MAX_FILES} изображений за один запрос`)
  }

  const supabase = getSupabaseAdmin()
  const uploadedPaths: string[] = []
  const publicUrls: string[] = []

  try {
    for (const file of validFiles) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Файл "${file.name}" превышает лимит 5 МБ`)
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      const detected = detectImageType(new Uint8Array(buffer))
      if (!detected) {
        throw new Error(`Файл "${file.name}" не является корректным JPEG, PNG, WebP, AVIF или GIF`)
      }

      const filePath = `catalog/${Date.now()}-${randomUUID()}.${detected.ext}`
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, buffer, {
        contentType: detected.contentType,
        cacheControl: '31536000',
        upsert: false,
      })
      if (error) throw new Error(error.message)

      uploadedPaths.push(filePath)
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
      publicUrls.push(data.publicUrl)
    }
    return publicUrls
  } catch (err) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(STORAGE_BUCKET).remove(uploadedPaths).catch(() => undefined)
    }
    throw err
  }
}

export async function deleteImagesByUrls(urls: string[]): Promise<void> {
  if (!urls.length) return
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL').replace(/\/+$/, '')
  const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/`

  const paths = urls
    .map((url) => {
      if (!url.startsWith(expectedPrefix)) return null
      const rawPath = decodeURIComponent(url.slice(expectedPrefix.length).split('?')[0])
      if (!rawPath || rawPath.includes('..') || rawPath.startsWith('/')) return null
      return rawPath
    })
    .filter((p): p is string => Boolean(p))

  if (paths.length > 0) {
    await getSupabaseAdmin().storage.from(STORAGE_BUCKET).remove(paths)
  }
}

// --- Парсеры FormData ---

export function extractFeatures(formData: FormData): string[] | undefined {
  if (!formData.has('features')) return undefined
  const rawList = formData.getAll('features').filter((v): v is string => typeof v === 'string')
  const result: string[] = []
  for (const item of rawList) {
    for (const line of item.split(/\r?\n/)) {
      const trimmed = line.trim().slice(0, 300)
      if (trimmed) result.push(trimmed)
      if (result.length >= 50) return result
    }
  }
  return result
}

export function extractSpecifications(
  formData: FormData,
  baseSpecs: Product['specifications'] = {}
): Product['specifications'] {
  const next: Record<string, string> = { ...baseSpecs }

  for (const key of SPEC_KEYS) {
    const fieldName = `specifications.${key}`
    if (formData.has(fieldName)) {
      const val = String(formData.get(fieldName) ?? '').trim().slice(0, 200)
      if (val) {
        next[key] = val
      } else {
        delete next[key]
      }
    }
  }

  return next as Product['specifications']
}

export function extractInStock(formData: FormData): boolean | undefined {
  if (!formData.has('inStock')) return undefined
  const vals = formData.getAll('inStock')
  const last = String(vals[vals.length - 1] ?? '').toLowerCase().trim()
  return last === 'true' || last === 'on' || last === '1'
}