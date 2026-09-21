"use client"

import { useState } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight, Check, ChevronDown } from "lucide-react"
import Link from "next/link"

export interface Product {
  id: number
  name: string
  price: number
  oldPrice?: number
  description: string
  category: string
  inStock: boolean
  images: string[]
  features: string[]
  specifications: {
    brand?: string
    collection?: string
    style?: string
    room?: string
    warranty?: string
    country?: string
  }
}

interface ProductClientProps {
  product: Product
  relatedProducts: Product[]
}

const specLabels: Record<string, string> = {
  brand: "Бренд",
  collection: "Коллекция",
  style: "Стиль",
  room: "Помещение",
  warranty: "Гарантия",
  country: "Страна производства",
}

const cubicEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.02,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { duration: 0.45, ease: cubicEase },
      opacity: { duration: 0.35, ease: "easeOut" },
      scale: { duration: 0.45, ease: cubicEase },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "35%" : "-35%",
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { duration: 0.4, ease: cubicEase },
      opacity: { duration: 0.3, ease: "easeIn" },
      scale: { duration: 0.4, ease: cubicEase },
    },
  }),
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [direction, setDirection] = useState(0)
  const [featuresOpen, setFeaturesOpen] = useState(true)
  const [specsOpen, setSpecsOpen] = useState(true)

  const paginate = (newDirection: number) => {
    if (product.images.length <= 1) return
    setDirection(newDirection)
    setSelectedImage((prev) => {
      let next = prev + newDirection
      if (next < 0) next = product.images.length - 1
      if (next >= product.images.length) next = 0
      return next
    })
  }

  const handleThumbnailClick = (newIndex: number) => {
    if (newIndex === selectedImage) return
    setDirection(newIndex > selectedImage ? 1 : -1)
    setSelectedImage(newIndex)
  }

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null

  return (
    // overflow-x-hidden предотвращает горизонтальный люфт страницы
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2416] pb-36 lg:pb-16 selection:bg-[#C17B5C]/20 selection:text-[#2C2416] overflow-x-hidden">
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
              <div className="relative aspect-square max-h-[46vh] sm:max-h-none w-full bg-white/40 border border-[#E8DCC8]/80 rounded-2xl overflow-hidden select-none group touch-pan-y shadow-sm">
                <div className="relative w-full h-full overflow-hidden">
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={selectedImage}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, { offset, velocity }) => {
                        const swipeThreshold = 40
                        if (offset.x < -swipeThreshold || velocity.x < -350) {
                          paginate(1)
                        } else if (offset.x > swipeThreshold || velocity.x > 350) {
                          paginate(-1)
                        }
                      }}
                      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
                    >
                      <img
                        src={product.images[selectedImage] || "/placeholder.svg"}
                        alt={product.name}
                        draggable={false}
                        className="w-full h-full object-cover pointer-events-none select-none"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {discountPercent && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#C17B5C] text-[#FAF7F2] text-[11px] font-mono tracking-wider rounded-full shadow-sm z-10 pointer-events-none">
                    -{discountPercent}%
                  </span>
                )}

                {product.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 z-10 sm:hidden px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[#FAF7F2] text-[11px] font-mono tracking-wider pointer-events-none">
                    {selectedImage + 1} / {product.images.length}
                  </div>
                )}

                {product.images.length > 1 && (
                  <div className="hidden sm:flex absolute inset-x-4 top-1/2 -translate-y-1/2 justify-between pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => paginate(-1)}
                      aria-label="Предыдущее фото"
                      className="pointer-events-auto p-3 bg-white/90 backdrop-blur-sm text-[#2C2416] rounded-full shadow-md hover:bg-white hover:text-[#C17B5C] transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => paginate(1)}
                      aria-label="Следующее фото"
                      className="pointer-events-auto p-3 bg-white/90 backdrop-blur-sm text-[#2C2416] rounded-full shadow-md hover:bg-white hover:text-[#C17B5C] transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Миниатюры */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-1 px-0.5 scrollbar-none snap-x">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      className="relative w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden snap-start focus:outline-none"
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          selectedImage === index ? "opacity-100" : "opacity-50 hover:opacity-80"
                        }`}
                      />
                      {selectedImage === index && (
                        <motion.div
                          layoutId="activeThumbnailBorder"
                          className="absolute inset-0 border-2 border-[#2C2416] rounded-xl pointer-events-none"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                    </button>
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
                
                <h1 className="text-2xl sm:text-4xl font-light font-serif text-[#2C2416] leading-tight mb-2 sm:mb-4">
                  {product.name}
                </h1>

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
                  <div className="py-3 sm:py-4">
                    <button
                      onClick={() => setFeaturesOpen(!featuresOpen)}
                      className="w-full flex items-center justify-between text-left py-1"
                    >
                      <span className="text-xs uppercase tracking-[0.15em] text-[#8C7E72] font-semibold">
                        Особенности изделия
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8C7E72] transition-transform duration-200 ${
                          featuresOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {featuresOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2 mt-3 overflow-hidden"
                        >
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2C2416]">
                              <Check className="w-4 h-4 text-[#C17B5C] flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="py-3 sm:py-4">
                    <button
                      onClick={() => setSpecsOpen(!specsOpen)}
                      className="w-full flex items-center justify-between text-left py-1"
                    >
                      <span className="text-xs uppercase tracking-[0.15em] text-[#8C7E72] font-semibold">
                        Характеристики
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8C7E72] transition-transform duration-200 ${
                          specsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {specsOpen && (
                        <motion.dl
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="divide-y divide-[#E8DCC8]/30 text-xs sm:text-sm mt-2 overflow-hidden"
                        >
                          {Object.entries(product.specifications).map(
                            ([key, value]) =>
                              value && (
                                <div key={key} className="py-2 flex justify-between gap-4">
                                  <dt className="text-[#8C7E72]">{specLabels[key] || key}</dt>
                                  <dd className="text-[#2C2416] font-medium text-right">{value}</dd>
                                </div>
                              )
                          )}
                        </motion.dl>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Похожие товары (Исправленные отступы и пропорции) */}
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

            {/* Контейнер карусели: правильный padding и видимый край следующей карточки */}
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

              {/* Спейсер: гарантирует ровный правый отступ в 16px в конце скролла на мобилках */}
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