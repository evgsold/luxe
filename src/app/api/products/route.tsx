import { NextRequest, NextResponse } from 'next/server'
import {
  deleteImagesByUrls,
  getSupabaseAdmin,
  getSupabasePublic,
  parseProductRequest,
  requireAdmin,
  toProduct,
  uploadImages,
  type ProductRow,
} from '@/lib/supabase'

// GET /api/products?category=...&inStock=true&brand=...&room=...&style=...&minPrice=...&maxPrice=...&search=...&sort=newest&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const category = sp.get('category')?.trim()
    const inStock = sp.get('inStock')
    const brand = sp.get('brand')?.trim()
    const room = sp.get('room')?.trim()
    const style = sp.get('style')?.trim()
    const search = sp.get('search')?.trim()
    const minPrice = sp.get('minPrice')
    const maxPrice = sp.get('maxPrice')
    const sort = sp.get('sort') ?? 'newest'

    const page = Math.max(1, Number.parseInt(sp.get('page') ?? '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, Number.parseInt(sp.get('limit') ?? '20', 10) || 20))
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = getSupabasePublic().from('products').select('*', { count: 'exact' })

    if (category) query = query.eq('category', category)
    if (inStock === 'true' || inStock === 'false') {
      query = query.eq('in_stock', inStock === 'true')
    }
    if (brand) query = query.ilike('specifications->>brand', brand.replace(/[%_]/g, '\\$&'))
    if (room) query = query.ilike('specifications->>room', room.replace(/[%_]/g, '\\$&'))
    if (style) query = query.ilike('specifications->>style', style.replace(/[%_]/g, '\\$&'))

    if (minPrice !== null && minPrice !== '' && Number.isFinite(Number(minPrice))) {
      query = query.gte('price', Number(minPrice))
    }
    if (maxPrice !== null && maxPrice !== '' && Number.isFinite(Number(maxPrice))) {
      query = query.lte('price', Number(maxPrice))
    }

    if (search) {
      const safe = search.replace(/[,().%]/g, ' ').trim()
      if (safe) {
        query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%,category.ilike.%${safe}%`)
      }
    }

    switch (sort) {
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

    const { data, error, count } = await query.range(from, to)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const total = count ?? 0
    return NextResponse.json({
      items: (data ?? []).map((row) => toProduct(row as ProductRow)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products (Admin) — поддерживает JSON и multipart/form-data (с файлами)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const parsed = await parseProductRequest(req, 'create')
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  let uploadedUrls: string[] = []

  try {
    if (parsed.files.length > 0) {
      uploadedUrls = await uploadImages(parsed.files, 'catalog')
    }

    const cleanSpecs: Record<string, string> = {}
    if (parsed.data.specifications) {
      for (const [k, v] of Object.entries(parsed.data.specifications)) {
        if (typeof v === 'string' && v) cleanSpecs[k] = v
      }
    }

    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .insert({
        name: parsed.data.name,
        price: parsed.data.price,
        old_price: parsed.data.oldPrice ?? null,
        description: parsed.data.description ?? '',
        category: parsed.data.category,
        in_stock: parsed.data.inStock ?? true,
        images: [...(parsed.data.images ?? []), ...uploadedUrls],
        features: parsed.data.features ?? [],
        specifications: cleanSpecs,
      })
      .select('*')
      .single()

    if (error) {
      if (uploadedUrls.length > 0) await deleteImagesByUrls(uploadedUrls).catch(() => {})
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: toProduct(data as ProductRow) }, { status: 201 })
  } catch (err) {
    if (uploadedUrls.length > 0) await deleteImagesByUrls(uploadedUrls).catch(() => {})
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create product' },
      { status: 400 }
    )
  }
}