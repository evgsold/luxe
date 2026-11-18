import { NextRequest, NextResponse } from 'next/server'
import {
  deleteImagesByUrls,
  getSupabaseAdmin,
  getSupabasePublic,
  requireAdmin,
  uploadImages,
  type ProductSpecifications,
} from '@/lib/supabase'

function parseIds(raw: unknown): number[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const ids = raw
    .map((v) => Number(v))
    .filter((n) => Number.isSafeInteger(n) && n > 0)
  return ids.length === raw.length ? Array.from(new Set(ids)) : null
}

// GET /api/admin (статистика каталога или ?action=me)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (req.nextUrl.searchParams.get('action') === 'me') {
    return NextResponse.json({
      authenticated: true,
      user: auth.user ? { id: auth.user.id, email: auth.user.email, role: 'admin' } : { role: 'api-key' },
    })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .select('id, price, old_price, in_stock, category, specifications')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as Array<{
    id: number
    price: number | string
    old_price: number | string | null
    in_stock: boolean
    category: string
    specifications: ProductSpecifications | null
  }>

  const categories: Record<string, number> = {}
  const brands: Record<string, number> = {}
  let inStockCount = 0
  let discountedCount = 0
  let minPrice = Infinity
  let maxPrice = 0
  let sumPrice = 0

  for (const row of rows) {
    const price = Number(row.price)
    if (row.in_stock) inStockCount++
    if (row.old_price !== null && Number(row.old_price) > price) discountedCount++

    minPrice = Math.min(minPrice, price)
    maxPrice = Math.max(maxPrice, price)
    sumPrice += price

    categories[row.category] = (categories[row.category] ?? 0) + 1
    const brand = row.specifications?.brand
    if (brand) brands[brand] = (brands[brand] ?? 0) + 1
  }

  return NextResponse.json({
    stats: {
      totalProducts: rows.length,
      inStockCount,
      outOfStockCount: rows.length - inStockCount,
      discountedCount,
      priceRange: {
        min: rows.length ? minPrice : 0,
        max: rows.length ? maxPrice : 0,
        avg: rows.length ? Math.round((sumPrice / rows.length) * 100) / 100 : 0,
      },
      categories,
      brands,
    },
  })
}

// POST /api/admin — загрузка картинок (multipart/form-data) ИЛИ логин/логаут (JSON)
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''

  // 1. Отдельная загрузка картинок в Supabase Storage
  if (contentType.includes('multipart/form-data')) {
    const auth = await requireAdmin(req)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    try {
      const formData = await req.formData()
      const files: File[] = []
      for (const [key, value] of formData.entries()) {
        if ((key === 'files' || key === 'images' || key === 'file') && value instanceof File && value.size > 0) {
          files.push(value)
        }
      }

      if (files.length === 0) {
        return NextResponse.json({ error: 'No image files provided' }, { status: 400 })
      }

      const rawProductId = formData.get('productId')
      let productId: number | null = null
      let existingImages: string[] = []

      if (typeof rawProductId === 'string' && rawProductId.trim()) {
        const parsed = Number(rawProductId)
        if (!Number.isSafeInteger(parsed) || parsed <= 0) {
          return NextResponse.json({ error: 'Invalid productId' }, { status: 400 })
        }
        const { data: product, error } = await getSupabaseAdmin()
          .from('products')
          .select('images')
          .eq('id', parsed)
          .maybeSingle()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

        productId = parsed
        existingImages = (product as { images: string[] | null }).images ?? []
      }

      const folder = typeof formData.get('folder') === 'string' ? (formData.get('folder') as string) : 'catalog'
      const urls = await uploadImages(files, folder)

      if (productId) {
        const { error: updateErr } = await getSupabaseAdmin()
          .from('products')
          .update({ images: [...existingImages, ...urls] })
          .eq('id', productId)

        if (updateErr) {
          await deleteImagesByUrls(urls).catch(() => {})
          return NextResponse.json({ error: updateErr.message }, { status: 500 })
        }
      }

      return NextResponse.json({ urls, count: urls.length }, { status: 201 })
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Image upload failed' },
        { status: 400 }
      )
    }
  }

  // 2. Вход / выход администратора
  try {
    const body = (await req.json()) as { action?: string; email?: string; password?: string }

    if (body.action === 'logout') {
      const res = NextResponse.json({ ok: true })
      res.cookies.delete('sb-access-token')
      return res
    }

    if (body.action === 'login') {
      if (!body.email || !body.password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
      }

      const { data, error } = await getSupabasePublic().auth.signInWithPassword({
        email: body.email,
        password: body.password,
      })

      if (error || !data.session || !data.user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      if (data.user.app_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 })
      }

      const res = NextResponse.json({
        user: { id: data.user.id, email: data.user.email, role: 'admin' },
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at,
      })

      res.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: data.session.expires_in,
      })

      return res
    }

    return NextResponse.json({ error: 'Unknown action. Use "login" or "logout"' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}

// PATCH /api/admin — массовые операции над товарами (наличие, скидки, категория)
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = (await req.json()) as {
      action?: string
      ids?: unknown
      inStock?: unknown
      category?: unknown
      percent?: unknown
    }

    const ids = parseIds(body.ids)
    if (!ids) {
      return NextResponse.json({ error: 'Field "ids" must be a non-empty array of positive integers' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    if (body.action === 'bulk_stock') {
      if (typeof body.inStock !== 'boolean') {
        return NextResponse.json({ error: 'Field "inStock" must be a boolean' }, { status: 400 })
      }
      const { data, error } = await supabase
        .from('products')
        .update({ in_stock: body.inStock })
        .in('id', ids)
        .select('id')

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ updatedCount: data?.length ?? 0 })
    }

    if (body.action === 'bulk_category') {
      if (typeof body.category !== 'string' || !body.category.trim()) {
        return NextResponse.json({ error: 'Field "category" must be a non-empty string' }, { status: 400 })
      }
      const { data, error } = await supabase
        .from('products')
        .update({ category: body.category.trim() })
        .in('id', ids)
        .select('id')

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ updatedCount: data?.length ?? 0 })
    }

    if (body.action === 'bulk_discount') {
      const percent = Number(body.percent)
      if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
        return NextResponse.json({ error: 'Field "percent" must be between 1 and 99' }, { status: 400 })
      }

      const { data: rows, error } = await supabase
        .from('products')
        .select('id, price, old_price')
        .in('id', ids)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await Promise.all(
        (rows ?? []).map((row) => {
          const basePrice = row.old_price !== null ? Number(row.old_price) : Number(row.price)
          const discounted = Math.round(basePrice * (1 - percent / 100) * 100) / 100
          return supabase
            .from('products')
            .update({ old_price: basePrice, price: discounted })
            .eq('id', row.id)
        })
      )

      return NextResponse.json({ updatedCount: rows?.length ?? 0 })
    }

    if (body.action === 'bulk_reset_discount') {
      const { data: rows, error } = await supabase
        .from('products')
        .select('id, old_price')
        .in('id', ids)
        .not('old_price', 'is', null)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await Promise.all(
        (rows ?? []).map((row) =>
          supabase
            .from('products')
            .update({ price: Number(row.old_price), old_price: null })
            .eq('id', row.id)
        )
      )

      return NextResponse.json({ updatedCount: rows?.length ?? 0 })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}

// DELETE /api/admin — удаление картинок из Storage или массовое удаление товаров
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const queryImageUrl = req.nextUrl.searchParams.get('imageUrl')
  const body = (await req.json().catch(() => null)) as {
    imageUrls?: unknown
    productId?: unknown
    ids?: unknown
  } | null

  const imageUrls: string[] = []
  if (queryImageUrl) imageUrls.push(queryImageUrl)
  if (Array.isArray(body?.imageUrls)) {
    for (const u of body.imageUrls) {
      if (typeof u === 'string' && u.trim()) imageUrls.push(u.trim())
    }
  }

  // 1. Удаление картинок из Storage (+ отвязка от товара, если передан productId)
  if (imageUrls.length > 0) {
    await deleteImagesByUrls(imageUrls)

    const productId = Number(body?.productId)
    if (Number.isSafeInteger(productId) && productId > 0) {
      const supabase = getSupabaseAdmin()
      const { data: product } = await supabase
        .from('products')
        .select('images')
        .eq('id', productId)
        .maybeSingle()

      if (product) {
        const removeSet = new Set(imageUrls)
        const nextImages = ((product as { images: string[] | null }).images ?? []).filter(
          (url) => !removeSet.has(url)
        )
        await supabase.from('products').update({ images: nextImages }).eq('id', productId)
      }
    }

    return NextResponse.json({ deletedImages: imageUrls })
  }

  // 2. Массовое удаление товаров вместе с их картинками
  const ids = parseIds(body?.ids)
  if (!ids) {
    return NextResponse.json(
      { error: 'Provide either "imageUrls" (or ?imageUrl=...) or "ids"' },
      { status: 400 }
    )
  }

  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .delete()
    .in('id', ids)
    .select('id, images')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const allImages = (data ?? []).flatMap((r) => (r as { images: string[] | null }).images ?? [])
  if (allImages.length > 0) {
    await deleteImagesByUrls(allImages).catch(() => {})
  }

  return NextResponse.json({ deletedIds: (data ?? []).map((r) => Number(r.id)) })
}