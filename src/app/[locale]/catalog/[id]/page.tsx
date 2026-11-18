import { Fragment } from "react"
import { notFound, redirect } from "next/navigation"
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react"
import Link from "next/link"
import {
  getAllProducts,
  getApprovedReviews,
  getProductById,
  submitProductReview,
} from "@/actions/products"

export const dynamic = "force-dynamic"

const specLabels: Record<string, string> = {
  brand: "Бренд",
  collection: "Коллекция",
  style: "Стиль",
  room: "Помещение",
  warranty: "Гарантия",
  country: "Страна производства",
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ reviewStatus?: string; reviewError?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  const [allProducts, { reviews, summary }] = await Promise.all([
    getAllProducts(),
    getApprovedReviews(product.id),
  ])

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3)

  const images = product.images.length > 0 ? product.images : ["/placeholder.svg"]

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null

  async function submitReviewAction(formData: FormData) {
    "use server"
    const base = locale ? `/${locale}/catalog/${product!.id}` : `/catalog/${product!.id}`
    const res = await submitProductReview(formData)
    if (!res.ok) {
      redirect(`${base}?reviewError=${encodeURIComponent(res.error ?? "Ошибка")}#reviews`)
    }
    redirect(`${base}?reviewStatus=sent#reviews`)
  }

  const galleryCss = `
    .gallery-viewport .gallery-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.98);
      transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 0;
    }
    .gallery-thumb-img {
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }
    .gallery-thumb:hover .gallery-thumb-img {
      opacity: 0.8;
    }
    .gallery-thumb-border {
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .star-rating:hover label {
      color: #E8DCC8;
    }
    .star-rating label:hover,
    .star-rating label:hover ~ label {
      color: #C17B5C;
    }
    .star-rating:not(:hover) input:checked ~ label {
      color: #C17B5C;
    }
    ${images
      .map(
        (_, i) => `
      #gallery-slide-${i}:checked ~ .gallery-viewport .gallery-slide-${i} {
        position: relative;
        opacity: 1;
        pointer-events: auto;
        transform: scale(1);
        z-index: 1;
      }
      #gallery-slide-${i}:checked ~ .gallery-thumbs .gallery-thumb-${i} .gallery-thumb-img {
        opacity: 1;
      }
      #gallery-slide-${i}:checked ~ .gallery-thumbs .gallery-thumb-${i} .gallery-thumb-border {
        opacity: 1;
      }
    `
      )
      .join("\n")}
  `

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2416] pb-36 lg:pb-16 selection:bg-[#C17B5C]/20 selection:text-[#2C2416] overflow-x-hidden">
      <style>{galleryCss}</style>

      {/* Хлебные крошки */}
      <div className="pt-4 pb-2 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#8C7E72]">
          <Link href="/catalog" className="hover:text-[#C17B5C] transition-colors">
            Каталог
          </Link>
          <span className="text-[#8C7E72]/60">/</span>
          <span className="text-[#2C2416] font-medium truncate max-w-[220px]">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Основной блок */}
      <section className="pb-10 sm:pb-20 px-4 sm:px-8 lg:px-16 border-b border-[#E8DCC8]/60">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start">
            {/* Галерея */}
            <div className="lg:col-span-7 space-y-3">
              {images.map((_, index) => (
                <input
                  key={index}
                  type="radio"
                  name="product-gallery"
                  id={`gallery-slide-${index}`}
                  defaultChecked={index === 0}
                  className="fixed top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
                />
              ))}

              <div className="gallery-viewport relative w-full flex items-center justify-center select-none group">
                {images.map((image, index) => {
                  const prevIdx = (index - 1 + images.length) % images.length
                  const nextIdx = (index + 1) % images.length

                  return (
                    <div
                      key={index}
                      className={`gallery-slide gallery-slide-${index} flex items-center justify-center w-full`}
                    >
                      <div className="relative inline-block max-w-full rounded-2xl overflow-hidden border border-[#E8DCC8]/80 shadow-sm bg-white/40">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={product.name}
                          draggable={false}
                          className="block w-auto h-auto max-w-full max-h-[58vh] sm:max-h-[76vh] select-none"
                        />

                        {discountPercent && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#C17B5C] text-[#FAF7F2] text-[11px] font-mono tracking-wider rounded-full shadow-sm z-20 pointer-events-none">
                            -{discountPercent}%
                          </span>
                        )}

                        {images.length > 1 && (
                          <div className="sm:hidden absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[#FAF7F2] text-[11px] font-mono tracking-wider pointer-events-none">
                            {index + 1} / {images.length}
                          </div>
                        )}

                        {images.length > 1 && (
                          <div className="hidden sm:flex absolute inset-x-4 top-1/2 -translate-y-1/2 justify-between pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <label
                              htmlFor={`gallery-slide-${prevIdx}`}
                              aria-label="Предыдущее фото"
                              className="cursor-pointer pointer-events-auto p-3 bg-white/90 backdrop-blur-sm text-[#2C2416] rounded-full shadow-md hover:bg-white hover:text-[#C17B5C] transition-all"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </label>
                            <label
                              htmlFor={`gallery-slide-${nextIdx}`}
                              aria-label="Следующее фото"
                              className="cursor-pointer pointer-events-auto p-3 bg-white/90 backdrop-blur-sm text-[#2C2416] rounded-full shadow-md hover:bg-white hover:text-[#C17B5C] transition-all"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Миниатюры */}
              {images.length > 1 && (
                <div className="gallery-thumbs mx-auto w-fit max-w-full flex gap-2 overflow-x-auto py-1 px-0.5 scrollbar-none snap-x">
                  {images.map((image, index) => (
                    <label
                      key={index}
                      htmlFor={`gallery-slide-${index}`}
                      className={`gallery-thumb gallery-thumb-${index} cursor-pointer relative w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden snap-start`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="gallery-thumb-img w-full h-full object-cover"
                      />
                      <span className="gallery-thumb-border absolute inset-0 border-2 border-[#2C2416] rounded-xl pointer-events-none" />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Информация */}
            <div className="lg:col-span-5 space-y-5 sm:space-y-8 lg:sticky lg:top-8">
              <div>
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#8C7E72] block mb-1.5 font-mono">
                  {product.category || "Коллекция"}
                </span>

                <h1 className="text-2xl sm:text-4xl font-light font-serif text-[#2C2416] leading-tight mb-2 sm:mb-3">
                  {product.name}
                </h1>

                {summary.count > 0 && (
                  <a
                    href="#reviews"
                    className="inline-flex items-center gap-2 text-xs text-[#6B5D4F] hover:text-[#C17B5C] mb-3 transition-colors"
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(summary.average)
                              ? "fill-[#C17B5C] text-[#C17B5C]"
                              : "text-[#E8DCC8]"
                          }`}
                        />
                      ))}
                    </span>
                    <span className="font-medium text-[#2C2416]">{summary.average}</span>
                    <span>({summary.count})</span>
                  </a>
                )}

                <div className="flex items-baseline gap-3 mb-2.5">
                  <span className="text-2xl sm:text-3xl font-medium text-[#2C2416] font-sans">
                    {product.price.toLocaleString("ru-RU")} Br
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-sm sm:text-base text-[#8C7E72] line-through font-sans">
                      {product.oldPrice.toLocaleString("ru-RU")} Br
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-medium">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      product.inStock ? "bg-emerald-600" : "bg-[#8C7E72]"
                    }`}
                  />
                  <span className={product.inStock ? "text-emerald-800" : "text-[#8C7E72]"}>
                    {product.inStock ? "В наличии в мастерской" : "Под заказ (от 3 дней)"}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#6B5D4F] leading-relaxed font-sans border-t border-[#E8DCC8]/60 pt-4 sm:pt-5">
                {product.description}
              </p>

              <div className="hidden lg:block pt-2">
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-3 min-h-[48px] px-8 py-3.5 bg-[#2C2416] text-[#FAF7F2] hover:bg-[#C17B5C] transition-colors rounded-full text-sm font-medium tracking-wide shadow-sm"
                >
                  <span>Заказать изделие</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-center text-xs text-[#8C7E72] mt-3">
                  Бережная доставка по всей Беларуси • Ручная проверка
                </p>
              </div>

              {/* Аккордеоны */}
              <div className="border-t border-[#E8DCC8]/60 divide-y divide-[#E8DCC8]/50">
                {product.features && product.features.length > 0 && (
                  <details open className="group py-3 sm:py-4">
                    <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden w-full flex items-center justify-between text-left py-1">
                      <span className="text-xs uppercase tracking-[0.15em] text-[#8C7E72] font-semibold">
                        Особенности изделия
                      </span>
                      <ChevronDown className="w-4 h-4 text-[#8C7E72] transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <ul className="space-y-2 mt-3">
                      {product.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2C2416]"
                        >
                          <Check className="w-4 h-4 text-[#C17B5C] flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {product.specifications &&
                  Object.values(product.specifications).some(Boolean) && (
                    <details open className="group py-3 sm:py-4">
                      <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden w-full flex items-center justify-between text-left py-1">
                        <span className="text-xs uppercase tracking-[0.15em] text-[#8C7E72] font-semibold">
                          Характеристики
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#8C7E72] transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <dl className="divide-y divide-[#E8DCC8]/30 text-xs sm:text-sm mt-2">
                        {Object.entries(product.specifications).map(
                          ([key, value]) =>
                            value && (
                              <div key={key} className="py-2 flex justify-between gap-4">
                                <dt className="text-[#8C7E72]">{specLabels[key] || key}</dt>
                                <dd className="text-[#2C2416] font-medium text-right">{value}</dd>
                              </div>
                            )
                        )}
                      </dl>
                    </details>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Оценки и отзывы */}
      <section
        id="reviews"
        className="py-12 sm:py-16 px-4 sm:px-8 lg:px-16 border-b border-[#E8DCC8]/60"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Форма оценки */}
            <div className="lg:col-span-5 bg-white/70 border border-[#E8DCC8] rounded-2xl p-6 space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8C7E72] block mb-1 font-mono">
                  Обратная связь
                </span>
                <h2 className="text-2xl font-light font-serif">Оставить оценку</h2>
                <p className="text-xs text-[#8C7E72] mt-1">
                  Отзыв появится на странице после проверки администратором.
                </p>
              </div>

              {sp.reviewStatus === "sent" && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
                  Спасибо! Ваша оценка отправлена на модерацию.
                </div>
              )}
              {sp.reviewError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {sp.reviewError}
                </div>
              )}

              <form action={submitReviewAction} className="space-y-4">
                <input type="hidden" name="productId" value={product.id} />
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />

                <div>
                  <span className="block text-xs text-[#8C7E72] mb-1.5">Ваша оценка *</span>
                  <div className="star-rating inline-flex flex-row-reverse items-center gap-0.5">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <Fragment key={star}>
                        <input
                          type="radio"
                          name="rating"
                          id={`review-star-${star}`}
                          value={star}
                          defaultChecked={star === 5}
                          className="fixed top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
                        />
                        <label
                          htmlFor={`review-star-${star}`}
                          title={`${star} из 5`}
                          className="cursor-pointer p-1 text-[#E8DCC8] transition-colors"
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </label>
                      </Fragment>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#8C7E72] mb-1">Ваше имя *</label>
                  <input
                    name="authorName"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Как к вам обращаться"
                    className="w-full bg-white border border-[#E8DCC8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C17B5C]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8C7E72] mb-1">
                    Комментарий (необязательно)
                  </label>
                  <textarea
                    name="comment"
                    rows={3}
                    maxLength={1500}
                    placeholder="Поделитесь впечатлением о светильнике..."
                    className="w-full bg-white border border-[#E8DCC8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C17B5C]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2C2416] hover:bg-[#C17B5C] text-[#FAF7F2] rounded-full py-3 text-sm font-medium transition-colors"
                >
                  Отправить оценку
                </button>
              </form>
            </div>

            {/* Список одобренных отзывов */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-end justify-between border-b border-[#E8DCC8]/70 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#8C7E72] block mb-1 font-mono">
                    Отзывы покупателей
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-light font-serif">
                    {summary.count > 0 ? `Оценка ${summary.average} из 5` : "Пока нет отзывов"}
                  </h2>
                </div>
                {summary.count > 0 && (
                  <span className="text-xs font-mono text-[#8C7E72]">
                    Всего: {summary.count}
                  </span>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="text-sm text-[#6B5D4F]">
                  Станьте первым, кто оценит это изделие.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <article
                      key={rev.id}
                      className="bg-white/60 border border-[#E8DCC8]/80 rounded-2xl p-5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm text-[#2C2416]">
                            {rev.authorName}
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? "fill-[#C17B5C] text-[#C17B5C]"
                                    : "text-[#E8DCC8]"
                                }`}
                              />
                            ))}
                          </span>
                        </div>
                        <time className="text-xs font-mono text-[#8C7E72]">
                          {new Date(rev.createdAt).toLocaleDateString("ru-RU")}
                        </time>
                      </div>
                      {rev.comment && (
                        <p className="text-sm text-[#6B5D4F] leading-relaxed">{rev.comment}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Похожие товары */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 sm:pt-16 pb-12 sm:pb-24 px-4 sm:px-8 lg:px-16">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-5 sm:mb-8">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#8C7E72] block mb-1 font-mono">
                  Коллекция
                </span>
                <h2 className="text-xl sm:text-3xl font-light font-serif">Другие изделия</h2>
              </div>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#6B5D4F] hover:text-[#C17B5C] transition-colors py-1"
              >
                Все <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 overflow-x-auto sm:overflow-visible pb-6 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-pl-4 scroll-pr-4 scrollbar-none">
              {relatedProducts.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  href={`/catalog/${item.id}`}
                  className="group block flex-shrink-0 w-[64vw] max-w-[260px] sm:w-auto sm:max-w-none snap-start"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-xl sm:rounded-2xl bg-[#E8DCC8]/20 mb-2.5 relative border border-[#E8DCC8]/60">
                    <img
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-medium text-[#2C2416] group-hover:text-[#C17B5C] transition-colors font-serif truncate">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#8C7E72] mt-0.5 truncate uppercase tracking-wider font-mono">
                        {item.category}
                      </p>
                    </div>
                    <span className="text-sm font-medium font-sans text-[#2C2416] whitespace-nowrap">
                      {item.price.toLocaleString("ru-RU")} Br
                    </span>
                  </div>
                </Link>
              ))}

              <div className="w-1.5 flex-shrink-0 sm:hidden" aria-hidden="true" />
            </div>
          </div>
        </section>
      )}

      {/* Липкая нижняя панель для смартфонов */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E8DCC8] px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <span className="text-[10px] text-[#8C7E72] uppercase tracking-wider block leading-none mb-1 font-mono">
              Стоимость
            </span>
            <span className="text-xl font-medium text-[#2C2416] font-sans">
              {product.price.toLocaleString("ru-RU")} Br
            </span>
          </div>

          <Link
            href="/contact"
            className="flex-1 max-w-[190px] inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 bg-[#2C2416] active:bg-[#C17B5C] text-[#FAF7F2] rounded-full text-xs uppercase tracking-wider font-medium shadow-md transition-colors"
          >
            <span>Заказать</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}