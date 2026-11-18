import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Check,
  Copy,
  ExternalLink,
  ImagePlus,
  LogOut,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import {
  approveAllPendingReviews,
  bulkApplyDiscount,
  bulkDeleteProducts,
  bulkResetDiscount,
  bulkUpdateCategory,
  bulkUpdateStock,
  createProduct,
  deleteProduct,
  deleteProductImage,
  deleteReview,
  duplicateProduct,
  getAdminReviews,
  getAdminSession,
  getAllProducts,
  getCatalogStats,
  getProductById,
  loginAdmin,
  logoutAdmin,
  makePrimaryProductImage,
  moderateReview,
  toggleProductStock,
  updateProduct,
} from '@/actions/products'
import {
  BulkSubmitButton,
  ConfirmButton,
  SelectAllCheckbox,
  SubmitButton,
} from '@/components/admin-controls'

export const dynamic = 'force-dynamic'

async function getLocaleAdminPath(formData?: FormData): Promise<string> {
  const fromForm = String(formData?.get('locale') ?? '').replace(/[^a-zA-Z-]/g, '')
  if (fromForm) return `/${fromForm}/admin`

  const hdrs = await headers()
  const intlLocale = hdrs.get('x-next-intl-locale')?.replace(/[^a-zA-Z-]/g, '')
  if (intlLocale) return `/${intlLocale}/admin`

  const referer = hdrs.get('referer')
  if (referer) {
    try {
      const match = new URL(referer).pathname.match(/^\/([a-zA-Z-]+)\/admin\b/)
      if (match) return `/${match[1]}/admin`
    } catch {
      // Игнорируем некорректный referer
    }
  }

  return '/admin'
}

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: string }>
  searchParams: Promise<{
    error?: string
    status?: string
    edit?: string
    q?: string
    category?: string
    stock?: string
    reviewTab?: string
  }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const safeLocale = locale?.replace(/[^a-zA-Z-]/g, '') || ''
  const adminBase = safeLocale ? `/${safeLocale}/admin` : '/admin'
  const catalogBase = safeLocale ? `/${safeLocale}/catalog` : '/catalog'

  const session = await getAdminSession()

  async function loginAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    const res = await loginAdmin(formData)
    if (!res.ok) {
      redirect(`${base}?error=${encodeURIComponent(res.error ?? 'Ошибка входа')}`)
    }
    redirect(base)
  }

  async function logoutAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    await logoutAdmin('local')
    redirect(base)
  }

  async function logoutAllAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    await logoutAdmin('global')
    redirect(`${base}?status=Все+сессии+завершены`)
  }

  async function createAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    let errorMsg: string | null = null
    try {
      await createProduct(formData)
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка создания товара'
    }
    if (errorMsg) redirect(`${base}?error=${encodeURIComponent(errorMsg)}`)
    redirect(`${base}?status=Товар+добавлен`)
  }

  async function updateAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    const id = String(formData.get('id') ?? '')
    let errorMsg: string | null = null
    try {
      await updateProduct(id, formData)
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка обновления товара'
    }
    if (errorMsg) redirect(`${base}?edit=${id}&error=${encodeURIComponent(errorMsg)}`)
    redirect(`${base}?status=Изменения+сохранены`)
  }

  async function toggleStockAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    const id = String(formData.get('id') ?? '')
    let errorMsg: string | null = null
    try {
      await toggleProductStock(id)
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка смены статуса'
    }
    if (errorMsg) redirect(`${base}?error=${encodeURIComponent(errorMsg)}`)
    redirect(`${base}?status=Статус+наличия+обновлён`)
  }

  async function duplicateAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    const id = String(formData.get('id') ?? '')
    let newId: number | null = null
    let errorMsg: string | null = null
    try {
      const copy = await duplicateProduct(id)
      newId = copy.id
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка копирования'
    }
    if (errorMsg) redirect(`${base}?error=${encodeURIComponent(errorMsg)}`)
    redirect(`${base}?edit=${newId}&status=Копия+создана.+Загрузите+для+неё+фото`)
  }

  async function deleteAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    const id = String(formData.get('id') ?? '')
    let errorMsg: string | null = null
    try {
      await deleteProduct(id)
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка удаления товара'
    }
    if (errorMsg) redirect(`${base}?error=${encodeURIComponent(errorMsg)}`)
    redirect(`${base}?status=Товар+удалён`)
  }

  async function makePrimaryImageAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    const id = String(formData.get('id') ?? '')
    const imageUrl = String(formData.get('imageUrl') ?? '')
    let errorMsg: string | null = null
    try {
      await makePrimaryProductImage(id, imageUrl)
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка смены главного фото'
    }
    if (errorMsg) redirect(`${base}?edit=${id}&error=${encodeURIComponent(errorMsg)}#editor`)
    redirect(`${base}?edit=${id}&status=Главное+фото+обновлено#editor`)
  }

  async function deleteImageAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    const id = String(formData.get('id') ?? '')
    const imageUrl = String(formData.get('imageUrl') ?? '')
    let errorMsg: string | null = null
    try {
      await deleteProductImage(id, imageUrl)
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка удаления фото'
    }
    if (errorMsg) redirect(`${base}?edit=${id}&error=${encodeURIComponent(errorMsg)}#editor`)
    redirect(`${base}?edit=${id}&status=Фото+удалено#editor`)
  }

  async function bulkAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    const ids = formData.getAll('ids').map(Number).filter((n) => Number.isSafeInteger(n) && n > 0)
    const op = String(formData.get('op') ?? '')
    const percent = Number(formData.get('percent') ?? 0)
    const bulkCategory = String(formData.get('bulkCategory') ?? '')
    let errorMsg: string | null = null

    try {
      if (ids.length === 0) throw new Error('Выберите хотя бы один товар')
      if (op === 'stock_on') await bulkUpdateStock(ids, true)
      else if (op === 'stock_off') await bulkUpdateStock(ids, false)
      else if (op === 'discount') await bulkApplyDiscount(ids, percent)
      else if (op === 'reset_discount') await bulkResetDiscount(ids)
      else if (op === 'category') await bulkUpdateCategory(ids, bulkCategory)
      else if (op === 'delete') await bulkDeleteProducts(ids)
      else throw new Error('Выберите действие')
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка массового действия'
    }

    if (errorMsg) redirect(`${base}?error=${encodeURIComponent(errorMsg)}`)
    redirect(`${base}?status=Массовое+действие+выполнено`)
  }

  async function moderateReviewAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    const id = String(formData.get('id') ?? '')
    const status = String(formData.get('status') ?? '') as 'approved' | 'rejected' | 'pending'
    const tab = String(formData.get('tab') ?? 'pending')
    let errorMsg: string | null = null
    try {
      await moderateReview(id, status)
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка модерации'
    }
    if (errorMsg) redirect(`${base}?reviewTab=${tab}&error=${encodeURIComponent(errorMsg)}#reviews`)
    redirect(`${base}?reviewTab=${tab}&status=Статус+отзыва+обновлён#reviews`)
  }

  async function approveAllAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    let count = 0
    let errorMsg: string | null = null
    try {
      count = await approveAllPendingReviews()
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка одобрения'
    }
    if (errorMsg) redirect(`${base}?error=${encodeURIComponent(errorMsg)}#reviews`)
    redirect(
      `${base}?reviewTab=approved&status=${encodeURIComponent(`Одобрено отзывов: ${count}`)}#reviews`
    )
  }

  async function deleteReviewAction(formData: FormData) {
    'use server'
    const base = await getLocaleAdminPath(formData)
    const id = String(formData.get('id') ?? '')
    const tab = String(formData.get('tab') ?? 'pending')
    let errorMsg: string | null = null
    try {
      await deleteReview(id)
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Ошибка удаления отзыва'
    }
    if (errorMsg) redirect(`${base}?reviewTab=${tab}&error=${encodeURIComponent(errorMsg)}#reviews`)
    redirect(`${base}?reviewTab=${tab}&status=Отзыв+удалён#reviews`)
  }

  // --- 1. Экран входа ---
  if (!session) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] text-[#2C2416] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/80 border border-[#E8DCC8] rounded-2xl p-8 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFEA] text-[#C17B5C] text-xs font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Защищённый вход
            </div>
            <h1 className="text-3xl font-light font-serif">3d fabriq · Admin</h1>
            <p className="text-sm text-[#6B5D4F]">
              Доступ только для учётных записей с ролью администратора
            </p>
          </div>

          {sp.error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {sp.error}
            </div>
          )}
          {sp.status && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              {sp.status}
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="locale" value={safeLocale} />

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8C7E72] mb-1.5 font-mono">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full bg-white border border-[#E8DCC8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C17B5C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8C7E72] mb-1.5 font-mono">
                Пароль
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-white border border-[#E8DCC8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C17B5C]"
              />
            </div>

            <SubmitButton
              pendingText="Проверка..."
              className="w-full bg-[#2C2416] hover:bg-[#C17B5C] text-[#FAF7F2] rounded-full py-3 text-sm font-medium transition-colors"
            >
              Войти в панель
            </SubmitButton>
          </form>

          <div className="text-center pt-2 border-t border-[#E8DCC8]/60">
            <Link href={catalogBase} className="text-xs text-[#6B5D4F] hover:text-[#C17B5C] underline">
              ← Вернуться в каталог
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // --- 2. Загрузка данных панели ---
  const reviewTab: 'pending' | 'approved' | 'rejected' | 'all' =
    sp.reviewTab === 'approved' || sp.reviewTab === 'rejected' || sp.reviewTab === 'all'
      ? sp.reviewTab
      : 'pending'

  const [stats, filteredProducts, reviewData, editProduct] = await Promise.all([
    getCatalogStats(),
    getAllProducts({
      search: sp.q || undefined,
      category: sp.category || undefined,
      inStock: sp.stock === 'in' ? true : sp.stock === 'out' ? false : undefined,
      discountedOnly: sp.stock === 'discount',
    }),
    getAdminReviews(reviewTab),
    sp.edit ? getProductById(sp.edit) : Promise.resolve(undefined),
  ])

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#2C2416] pb-20">
      {/* Шапка */}
      <header className="border-b border-[#E8DCC8] bg-white/70 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#2C2416] text-[#FAF7F2]">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-light font-serif leading-none">
                3d fabriq · Админ-панель
              </h1>
              <p className="text-xs text-[#8C7E72] mt-1 font-mono">{session.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <Link
              href={catalogBase}
              className="inline-flex items-center gap-1.5 border border-[#E8DCC8] bg-white hover:border-[#C17B5C] rounded-full px-3.5 py-1.5 transition-colors"
            >
              <span>Каталог</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <form action={logoutAllAction}>
              <input type="hidden" name="locale" value={safeLocale} />
              <ConfirmButton
                message="Завершить активные сессии на всех устройствах?"
                pendingText="Выход..."
                className="border border-[#E8DCC8] bg-white hover:border-red-400 text-[#6B5D4F] rounded-full px-3.5 py-1.5 transition-colors"
              >
                Выйти везде
              </ConfirmButton>
            </form>

            <form action={logoutAction}>
              <input type="hidden" name="locale" value={safeLocale} />
              <SubmitButton
                pendingText="Выход..."
                className="inline-flex items-center gap-1.5 bg-[#2C2416] hover:bg-[#C17B5C] text-[#FAF7F2] rounded-full px-4 py-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти</span>
              </SubmitButton>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-6 space-y-8">
        {/* Уведомления */}
        {sp.error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {sp.error}
          </div>
        )}
        {sp.status && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
            {sp.status}
          </div>
        )}

        {/* KPI Статистика */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white/70 border border-[#E8DCC8] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-[#8C7E72] font-mono block">
              Всего товаров
            </span>
            <span className="text-2xl font-serif mt-1 block">{stats.total}</span>
          </div>
          <div className="bg-white/70 border border-[#E8DCC8] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-[#8C7E72] font-mono block">
              В наличии
            </span>
            <span className="text-2xl font-serif text-emerald-700 mt-1 block">
              {stats.inStock}
            </span>
          </div>
          <div className="bg-white/70 border border-[#E8DCC8] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-[#8C7E72] font-mono block">
              Под заказ
            </span>
            <span className="text-2xl font-serif text-[#8C7E72] mt-1 block">
              {stats.outOfStock}
            </span>
          </div>
          <div className="bg-white/70 border border-[#E8DCC8] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-[#8C7E72] font-mono block">
              Со скидкой
            </span>
            <span className="text-2xl font-serif text-[#C17B5C] mt-1 block">
              {stats.discounted}
            </span>
          </div>
          <div className="bg-white/70 border border-[#E8DCC8] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-[#8C7E72] font-mono block">
              Средняя цена
            </span>
            <span className="text-2xl font-serif mt-1 block">{stats.avgPrice} Br</span>
          </div>
          <a
            href="#reviews"
            className={`border rounded-xl p-4 transition-colors ${
              reviewData.counts.pending > 0
                ? 'bg-[#C17B5C]/10 border-[#C17B5C]/50'
                : 'bg-white/70 border-[#E8DCC8]'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-[#8C7E72] font-mono block">
              Отзывы (ждут)
            </span>
            <span className="text-2xl font-serif text-[#C17B5C] mt-1 block">
              {reviewData.counts.pending}
            </span>
          </a>
        </section>

        {/* Редактор / Создание товара */}
        <section id="editor" className="bg-white/80 border border-[#E8DCC8] rounded-2xl p-5 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DCC8]/70 pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#8C7E72] font-mono block">
                {editProduct ? `Редактирование #${editProduct.id}` : 'Новый товар'}
              </span>
              <h2 className="text-2xl font-light font-serif">
                {editProduct ? editProduct.name : 'Добавить светильник'}
              </h2>
            </div>

            {editProduct && (
              <div className="flex items-center gap-3 text-xs">
                <Link
                  href={`${catalogBase}/${editProduct.id}`}
                  className="inline-flex items-center gap-1 underline text-[#6B5D4F] hover:text-[#C17B5C]"
                >
                  Смотреть на сайте <ExternalLink className="w-3 h-3" />
                </Link>
                <Link
                  href={adminBase}
                  className="border border-[#E8DCC8] rounded-full px-3.5 py-1.5 hover:border-[#2C2416]"
                >
                  Отмена / Новый товар
                </Link>
              </div>
            )}
          </div>

          {/* Управление существующими фото при редактировании */}
          {editProduct && editProduct.images.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#8C7E72] font-mono block">
                Текущие изображения ({editProduct.images.length})
              </span>
              <div className="flex flex-wrap gap-3">
                {editProduct.images.map((url, idx) => (
                  <div
                    key={url}
                    className="border border-[#E8DCC8] bg-[#FAF7F2] rounded-xl p-2 space-y-2 w-32"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#C17B5C] text-[#FAF7F2] text-[10px] rounded-full font-mono">
                          Главное
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 text-[11px]">
                      {idx !== 0 && (
                        <form action={makePrimaryImageAction}>
                          <input type="hidden" name="locale" value={safeLocale} />
                          <input type="hidden" name="id" value={editProduct.id} />
                          <input type="hidden" name="imageUrl" value={url} />
                          <SubmitButton
                            pendingText="..."
                            className="w-full inline-flex items-center justify-center gap-1 py-1 rounded bg-white border border-[#E8DCC8] hover:border-[#C17B5C]"
                          >
                            <Star className="w-3 h-3" /> Главным
                          </SubmitButton>
                        </form>
                      )}
                      <form action={deleteImageAction}>
                        <input type="hidden" name="locale" value={safeLocale} />
                        <input type="hidden" name="id" value={editProduct.id} />
                        <input type="hidden" name="imageUrl" value={url} />
                        <ConfirmButton
                          message="Удалить это фото из Storage?"
                          pendingText="..."
                          className="w-full inline-flex items-center justify-center gap-1 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-3 h-3" /> Удалить
                        </ConfirmButton>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Форма товара */}
          <form
            key={editProduct?.id ?? 'new'}
            action={editProduct ? updateAction : createAction}
            className="space-y-5"
          >
            <input type="hidden" name="locale" value={safeLocale} />
            {editProduct && <input type="hidden" name="id" value={editProduct.id} />}

            <datalist id="existing-categories">
              {stats.categoryList.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#8C7E72] mb-1">Название *</label>
                <input
                  name="name"
                  required
                  maxLength={200}
                  defaultValue={editProduct?.name ?? ''}
                  placeholder="Напр., Баскет Лонг"
                  className="w-full bg-white border border-[#E8DCC8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C17B5C]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8C7E72] mb-1">Категория *</label>
                <input
                  name="category"
                  required
                  maxLength={100}
                  list="existing-categories"
                  defaultValue={editProduct?.category ?? 'Светильники'}
                  className="w-full bg-white border border-[#E8DCC8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C17B5C]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8C7E72] mb-1">Наличие</label>
                <select
                  name="inStock"
                  defaultValue={editProduct ? String(editProduct.inStock) : 'true'}
                  className="w-full bg-white border border-[#E8DCC8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C17B5C]"
                >
                  <option value="true">В наличии в мастерской</option>
                  <option value="false">Под заказ (от 3 дней)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#8C7E72] mb-1">Цена (Br) *</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={editProduct?.price ?? ''}
                  placeholder="120"
                  className="w-full bg-white border border-[#E8DCC8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C17B5C]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8C7E72] mb-1">
                  Старая цена (Br, для скидки)
                </label>
                <input
                  name="oldPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editProduct?.oldPrice ?? ''}
                  placeholder="Оставьте пустым, если без скидки"
                  className="w-full bg-white border border-[#E8DCC8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C17B5C]"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs text-[#8C7E72] mb-1">
                  <ImagePlus className="w-3.5 h-3.5" />
                  Фото (JPEG, PNG, WebP, до 5 МБ)
                </label>
                <input
                  name="images"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="w-full bg-white border border-[#E8DCC8] rounded-xl px-3 py-1.5 text-xs"
                />
                {editProduct && (
                  <select
                    name="imageMode"
                    defaultValue="append"
                    className="mt-1.5 w-full bg-white border border-[#E8DCC8] rounded-lg px-2.5 py-1 text-xs text-[#6B5D4F]"
                  >
                    <option value="append">Добавить к текущим фото</option>
                    <option value="replace">Заменить все текущие фото</option>
                  </select>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8C7E72] mb-1">Описание</label>
                <textarea
                  name="description"
                  rows={4}
                  maxLength={5000}
                  defaultValue={editProduct?.description ?? ''}
                  placeholder="Описание товара..."
                  className="w-full bg-white border border-[#E8DCC8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C17B5C]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8C7E72] mb-1">
                  Особенности (каждый пункт с новой строки)
                </label>
                <textarea
                  name="features"
                  rows={4}
                  defaultValue={editProduct?.features.join('\n') ?? ''}
                  placeholder={'Высота 30см, ширина 16*16см\nЦоколь Е27\nДоступна в разных цветах.'}
                  className="w-full bg-white border border-[#E8DCC8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C17B5C]"
                />
              </div>
            </div>

            <details className="border border-[#E8DCC8]/80 rounded-xl p-4 bg-[#FAF7F2]/50">
              <summary className="cursor-pointer text-xs uppercase tracking-wider text-[#6B5D4F] font-mono">
                Дополнительные характеристики (specifications)
              </summary>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                <input
                  name="specifications.brand"
                  defaultValue={editProduct?.specifications.brand ?? ''}
                  placeholder="Бренд"
                  className="bg-white border border-[#E8DCC8] rounded-xl px-3 py-2 text-sm"
                />
                <input
                  name="specifications.collection"
                  defaultValue={editProduct?.specifications.collection ?? ''}
                  placeholder="Коллекция"
                  className="bg-white border border-[#E8DCC8] rounded-xl px-3 py-2 text-sm"
                />
                <input
                  name="specifications.style"
                  defaultValue={editProduct?.specifications.style ?? ''}
                  placeholder="Стиль"
                  className="bg-white border border-[#E8DCC8] rounded-xl px-3 py-2 text-sm"
                />
                <input
                  name="specifications.room"
                  defaultValue={editProduct?.specifications.room ?? ''}
                  placeholder="Помещение"
                  className="bg-white border border-[#E8DCC8] rounded-xl px-3 py-2 text-sm"
                />
                <input
                  name="specifications.warranty"
                  defaultValue={editProduct?.specifications.warranty ?? ''}
                  placeholder="Гарантия"
                  className="bg-white border border-[#E8DCC8] rounded-xl px-3 py-2 text-sm"
                />
                <input
                  name="specifications.country"
                  defaultValue={editProduct?.specifications.country ?? ''}
                  placeholder="Страна производства"
                  className="bg-white border border-[#E8DCC8] rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </details>

            <SubmitButton
              pendingText={editProduct ? 'Сохранение...' : 'Создание...'}
              className="bg-[#2C2416] hover:bg-[#C17B5C] text-[#FAF7F2] rounded-full px-8 py-3 text-sm font-medium transition-colors"
            >
              {editProduct ? 'Сохранить изменения' : 'Создать товар'}
            </SubmitButton>
          </form>
        </section>

        {/* Поиск, фильтры и массовые действия */}
        <section className="space-y-4">
          <div className="bg-white/80 border border-[#E8DCC8] rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between">
            <form method="GET" action={adminBase} className="flex flex-wrap gap-2 items-center">
              <input
                name="q"
                defaultValue={sp.q ?? ''}
                placeholder="Поиск по названию..."
                className="bg-white border border-[#E8DCC8] rounded-xl px-3 py-1.5 text-sm w-48"
              />
              <select
                name="category"
                defaultValue={sp.category ?? ''}
                className="bg-white border border-[#E8DCC8] rounded-xl px-3 py-1.5 text-sm"
              >
                <option value="">Все категории</option>
                {stats.categoryList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                name="stock"
                defaultValue={sp.stock ?? 'all'}
                className="bg-white border border-[#E8DCC8] rounded-xl px-3 py-1.5 text-sm"
              >
                <option value="all">Любой статус</option>
                <option value="in">В наличии</option>
                <option value="out">Под заказ</option>
                <option value="discount">Со скидкой</option>
              </select>
              <button
                type="submit"
                className="border border-[#2C2416] text-[#2C2416] hover:bg-[#2C2416] hover:text-[#FAF7F2] rounded-xl px-3.5 py-1.5 text-sm transition-colors"
              >
                Найти
              </button>
              {(sp.q || sp.category || (sp.stock && sp.stock !== 'all')) && (
                <Link href={adminBase} className="text-xs underline text-[#8C7E72] px-1">
                  Сбросить
                </Link>
              )}
            </form>

            <form id="bulk-form" action={bulkAction} className="flex flex-wrap gap-2 items-center">
              <input type="hidden" name="locale" value={safeLocale} />
              <select
                name="op"
                className="bg-white border border-[#E8DCC8] rounded-xl px-3 py-1.5 text-sm"
              >
                <option value="">Массовые действия...</option>
                <option value="stock_on">Поставить «В наличии»</option>
                <option value="stock_off">Поставить «Под заказ»</option>
                <option value="discount">Сделать скидку (%)</option>
                <option value="reset_discount">Сбросить скидку</option>
                <option value="category">Сменить категорию</option>
                <option value="delete">Удалить выбранные</option>
              </select>
              <input
                name="percent"
                type="number"
                min="1"
                max="99"
                placeholder="%"
                className="bg-white border border-[#E8DCC8] rounded-xl px-2.5 py-1.5 text-sm w-16"
              />
              <input
                name="bulkCategory"
                list="existing-categories"
                placeholder="Категория"
                className="bg-white border border-[#E8DCC8] rounded-xl px-2.5 py-1.5 text-sm w-32"
              />
              <BulkSubmitButton className="bg-[#2C2416] hover:bg-[#C17B5C] text-[#FAF7F2] rounded-xl px-4 py-1.5 text-sm transition-colors" />
            </form>
          </div>

          {/* Список товаров */}
          <div className="bg-white/80 border border-[#E8DCC8] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E8DCC8] bg-[#F4EFEA]/70 flex items-center justify-between text-xs uppercase tracking-wider text-[#8C7E72] font-mono">
              <label className="flex items-center gap-3 cursor-pointer">
                <SelectAllCheckbox className="rounded" />
                <span>Выбрать все ({filteredProducts.length})</span>
              </label>
              <span>Действия</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-sm text-[#8C7E72]">
                Товары не найдены.
              </div>
            ) : (
              <div className="divide-y divide-[#E8DCC8]/70">
                {filteredProducts.map((p) => {
                  const discount =
                    p.oldPrice && p.oldPrice > p.price
                      ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
                      : null

                  return (
                    <div
                      key={p.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2]/60 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <input
                          type="checkbox"
                          name="ids"
                          value={p.id}
                          form="bulk-form"
                          className="flex-shrink-0"
                        />

                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F4EFEA] border border-[#E8DCC8] flex-shrink-0">
                          {p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8C7E72]">
                              Нет фото
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`${catalogBase}/${p.id}`}
                              className="font-medium font-serif text-base hover:text-[#C17B5C] truncate"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[11px] font-mono text-[#8C7E72]">#{p.id}</span>
                            {discount && (
                              <span className="px-2 py-0.5 rounded-full bg-[#C17B5C] text-[#FAF7F2] text-[10px] font-mono">
                                -{discount}%
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-[#6B5D4F] mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                            <span>{p.category}</span>
                            <span className="font-medium text-[#2C2416]">
                              {p.price} Br
                              {p.oldPrice ? (
                                <span className="ml-1.5 line-through text-[#8C7E72] font-normal">
                                  {p.oldPrice} Br
                                </span>
                              ) : null}
                            </span>
                            <span className="text-[#8C7E72]">Фото: {p.images.length}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <form action={toggleStockAction}>
                          <input type="hidden" name="locale" value={safeLocale} />
                          <input type="hidden" name="id" value={p.id} />
                          <SubmitButton
                            pendingText="..."
                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                              p.inStock
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                : 'bg-[#F4EFEA] border-[#E8DCC8] text-[#6B5D4F] hover:border-[#2C2416]'
                            }`}
                          >
                            {p.inStock ? 'В наличии' : 'Под заказ'}
                          </SubmitButton>
                        </form>

                        <Link
                          href={`${adminBase}?edit=${p.id}#editor`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border border-[#E8DCC8] bg-white hover:border-[#C17B5C]"
                        >
                          <Pencil className="w-3 h-3" /> Изменить
                        </Link>

                        <form action={duplicateAction}>
                          <input type="hidden" name="locale" value={safeLocale} />
                          <input type="hidden" name="id" value={p.id} />
                          <SubmitButton
                            pendingText="..."
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border border-[#E8DCC8] bg-white hover:border-[#2C2416]"
                          >
                            <Copy className="w-3 h-3" /> Копия
                          </SubmitButton>
                        </form>

                        <form action={deleteAction}>
                          <input type="hidden" name="locale" value={safeLocale} />
                          <input type="hidden" name="id" value={p.id} />
                          <ConfirmButton
                            message={`Удалить "${p.name}" и все его изображения?`}
                            pendingText="..."
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="w-3 h-3" /> Удалить
                          </ConfirmButton>
                        </form>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Модерация оценок и отзывов */}
        <section id="reviews" className="bg-white/80 border border-[#E8DCC8] rounded-2xl p-5 sm:p-7 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DCC8]/70 pb-4">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-[#C17B5C]" />
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#8C7E72] font-mono block">
                  Премодерация
                </span>
                <h2 className="text-2xl font-light font-serif">Оценки и отзывы</h2>
              </div>
            </div>

            {reviewData.counts.pending > 0 && (
              <form action={approveAllAction}>
                <input type="hidden" name="locale" value={safeLocale} />
                <ConfirmButton
                  message={`Одобрить все ожидающие отзывы (${reviewData.counts.pending} шт.)?`}
                  pendingText="Одобрение..."
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-4 py-1.5 text-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Одобрить все ({reviewData.counts.pending})
                </ConfirmButton>
              </form>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {(
              [
                ['pending', `Ожидают (${reviewData.counts.pending})`],
                ['approved', `Одобренные (${reviewData.counts.approved})`],
                ['rejected', `Отклонённые (${reviewData.counts.rejected})`],
                ['all', `Все (${reviewData.counts.total})`],
              ] as const
            ).map(([key, label]) => (
              <Link
                key={key}
                href={`${adminBase}?reviewTab=${key}#reviews`}
                className={`px-3.5 py-1.5 rounded-full border transition-colors ${
                  reviewTab === key
                    ? 'bg-[#2C2416] text-[#FAF7F2] border-[#2C2416]'
                    : 'bg-white border-[#E8DCC8] text-[#6B5D4F] hover:border-[#C17B5C]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {reviewData.reviews.length === 0 ? (
            <p className="text-sm text-[#8C7E72] py-6 text-center">
              В этой вкладке пока нет отзывов.
            </p>
          ) : (
            <div className="divide-y divide-[#E8DCC8]/70 border border-[#E8DCC8] rounded-xl overflow-hidden bg-white">
              {reviewData.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase ${
                          rev.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : rev.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {rev.status === 'approved'
                          ? 'Одобрен'
                          : rev.status === 'rejected'
                          ? 'Отклонён'
                          : 'Ожидает'}
                      </span>

                      <span className="inline-flex items-center gap-0.5 text-[#C17B5C]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-[#C17B5C] text-[#C17B5C]' : 'text-[#E8DCC8]'
                            }`}
                          />
                        ))}
                      </span>

                      <span className="font-semibold text-[#2C2416]">{rev.authorName}</span>
                      <span className="text-[#8C7E72] font-mono">
                        {new Date(rev.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                      <Link
                        href={`${catalogBase}/${rev.productId}`}
                        className="underline text-[#6B5D4F] hover:text-[#C17B5C]"
                      >
                        {rev.productName ?? `Товар #${rev.productId}`}
                      </Link>
                    </div>

                    {rev.comment ? (
                      <p className="text-sm text-[#2C2416] leading-relaxed">{rev.comment}</p>
                    ) : (
                      <p className="text-xs italic text-[#8C7E72]">Только оценка без комментария</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    {rev.status !== 'approved' && (
                      <form action={moderateReviewAction}>
                        <input type="hidden" name="locale" value={safeLocale} />
                        <input type="hidden" name="id" value={rev.id} />
                        <input type="hidden" name="status" value="approved" />
                        <input type="hidden" name="tab" value={reviewTab} />
                        <SubmitButton
                          pendingText="..."
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        >
                          <Check className="w-3.5 h-3.5" /> Одобрить
                        </SubmitButton>
                      </form>
                    )}

                    {rev.status !== 'rejected' && (
                      <form action={moderateReviewAction}>
                        <input type="hidden" name="locale" value={safeLocale} />
                        <input type="hidden" name="id" value={rev.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <input type="hidden" name="tab" value={reviewTab} />
                        <SubmitButton
                          pendingText="..."
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-[#F4EFEA] text-[#6B5D4F] border border-[#E8DCC8] hover:border-[#2C2416]"
                        >
                          <X className="w-3.5 h-3.5" /> Отклонить
                        </SubmitButton>
                      </form>
                    )}

                    <form action={deleteReviewAction}>
                      <input type="hidden" name="locale" value={safeLocale} />
                      <input type="hidden" name="id" value={rev.id} />
                      <input type="hidden" name="tab" value={reviewTab} />
                      <ConfirmButton
                        message="Удалить этот отзыв навсегда?"
                        pendingText="..."
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Удалить
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}