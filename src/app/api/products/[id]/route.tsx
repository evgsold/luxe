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

type RouteContext = { params: Promise<{ id: string }> }

function parseId(rawId: string): number | null {
  if (!/^\d+$/.test(rawId)) return null
  const num = Number(rawId)
  return Number.isSafeInteger(num) && num > 0 ? num : null
}

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const productId = parseId(id)
  if (!productId) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

  const { data, error } = await getSupabasePublic()
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ product: toProduct(data as ProductRow) })
}

// PATCH /api/products/[id] (Admin) — частичное обновление + добавление/удаление фото
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  const productId = parseId(id)
  if (!productId) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: existingData, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!existingData) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const existing = existingData as ProductRow
  const parsed = await parseProductRequest(req, 'update')
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  let uploadedUrls: string[] = []

  try {
    if (parsed.files.length > 0) {
      uploadedUrls = await uploadImages(parsed.files, 'catalog')
    }

    const oldImages = existing.images ?? []
    const imagesToDeleteFromStorage: string[] = []
    let nextImages = parsed.data.images !== undefined ? [...parsed.data.images] : [...oldImages]

    if (parsed.data.replaceImages) {
      imagesToDeleteFromStorage.push(...oldImages.filter((url) => !nextImages.includes(url)))
      nextImages = [...(parsed.data.images ?? []), ...uploadedUrls]
    } else {
      if (parsed.data.removeImages?.length) {
        const removeSet = new Set(parsed.data.removeImages)
        imagesToDeleteFromStorage.push(...oldImages.filter((url) => removeSet.has(url)))
        nextImages = nextImages.filter((url) => !removeSet.has(url))
      }
      if (uploadedUrls.length > 0) {
        nextImages.push(...uploadedUrls)
      }
    }

    // При обновлении спецификаций делаем аккуратный merge с текущими
    let nextSpecs = existing.specifications ?? {}
    if (parsed.data.specifications) {
      const merged: Record<string, string> = { ...nextSpecs }
      for (const [k, v] of Object.entries(parsed.data.specifications)) {
        if (v === null) {
          delete merged[k]
        } else {
          merged[k] = v
        }
      }
      nextSpecs = merged
    }

    const updatePayload: Record<string, unknown> = {}
    if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name
    if (parsed.data.price !== undefined) updatePayload.price = parsed.data.price
    if (parsed.data.oldPrice !== undefined) updatePayload.old_price = parsed.data.oldPrice
    if (parsed.data.description !== undefined) updatePayload.description = parsed.data.description
    if (parsed.data.category !== undefined) updatePayload.category = parsed.data.category
    if (parsed.data.inStock !== undefined) updatePayload.in_stock = parsed.data.inStock
    if (parsed.data.features !== undefined) updatePayload.features = parsed.data.features
    if (parsed.data.specifications !== undefined) updatePayload.specifications = nextSpecs
    if (
      parsed.data.images !== undefined ||
      parsed.data.removeImages?.length ||
      parsed.data.replaceImages ||
      uploadedUrls.length > 0
    ) {
      updatePayload.images = nextImages
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId)
      .select('*')
      .single()

    if (updateError) {
      if (uploadedUrls.length > 0) await deleteImagesByUrls(uploadedUrls).catch(() => {})
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Чистим удалённые фото из Storage только после успешного обновления БД
    if (imagesToDeleteFromStorage.length > 0) {
      await deleteImagesByUrls(imagesToDeleteFromStorage).catch(() => {})
    }

    return NextResponse.json({ product: toProduct(updated as ProductRow) })
  } catch (err) {
    if (uploadedUrls.length > 0) await deleteImagesByUrls(uploadedUrls).catch(() => {})
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update product' },
      { status: 400 }
    )
  }
}

// DELETE /api/products/[id] (Admin) — удаляет товар и все его картинки из Storage
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  const productId = parseId(id)
  if (!productId) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .delete()
    .eq('id', productId)
    .select('images')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const images = (data as { images: string[] | null }).images
  if (images?.length) {
    await deleteImagesByUrls(images).catch(() => {})
  }

  return NextResponse.json({ deleted: true, id: productId })
}