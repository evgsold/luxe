// components/home-client.tsx

"use client"

import { ArrowRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import StructuredData from "@/components/StructuredData"

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

export default function HomeClient({ products }: { products: Product[] }) {
  const websiteData = {
    name: "3d fabriq - Каталог авторского 3D-печатного освещения",
    description:
      "Коллекция лаконичных светильников, созданных с помощью технологий 3D-печати. Экологичные материалы, чистые линии и мягкий свет.",
    url: "https://digitalfortress.vercel.app",
  }

  const organizationData = {
    name: "3d fabriq",
    url: "https://digitalfortress.vercel.app",
    logo: "https://digitalfortress.vercel.app/logo.png",
  }

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const categories = [
    { name: "Подвесные светильники", count: "Коллекция", href: "/catalog" },
    { name: "Торшеры", count: "Коллекция", href: "/catalog" },
    { name: "Настольные лампы", count: "Коллекция", href: "/catalog" },
    { name: "Настенные бра", count: "Коллекция", href: "/catalog" },
  ]

  const values = [
    {
      num: "01",
      title: "Параметрический дизайн",
      desc: "Сложная биоморфическая пластика и мягкое рассеивание света, недостижимые в традиционном серийном производстве.",
    },
    {
      num: "02",
      title: "Экологичный биополимер",
      desc: "Используем перерабатываемый растительный PLA-пластик и долговечные светодиодные компоненты с мягким спектром.",
    },
    {
      num: "03",
      title: "Локальное производство",
      desc: "Каждое изделие печатается индивидуально, бережно вручную обрабатывается и отправляется напрямую из мастерской.",
    },
  ]

  const processSteps = [
    { step: "01", title: "Выбор формы", desc: "Подберите силуэт и температуру света в каталоге" },
    { step: "02", title: "Печать и сборка", desc: "Изготавливаем изделие с контролем каждого слоя" },
    { step: "03", title: "Тестирование", desc: "Проверяем электрику, качество диффузора и пакуем" },
    { step: "04", title: "Доставка", desc: "Быстро отправляем заказ прямо до вашей двери" },
  ]

  return (
    <>
      <StructuredData type="WebSite" data={websiteData} />
      <StructuredData type="Organization" data={organizationData} />

      <div className="min-h-screen bg-[#FAF7F2] text-[#2C2416] selection:bg-[#C17B5C]/20 selection:text-[#2C2416]">
        {/* Hero Section */}
        <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 px-6 sm:px-10 lg:px-16 border-b border-[#E8DCC8]/60">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Hero Text */}
              <motion.div
                className="lg:col-span-7 pr-0 lg:pr-8"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.span
                  variants={fadeIn}
                  className="inline-block text-sm uppercase tracking-[0.25em] text-[#C17B5C] font-semibold mb-6"
                >
                  3D-Печатное освещение
                </motion.span>

                <motion.h1
                  variants={fadeIn}
                  className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.08] mb-8 font-serif"
                >
                  Свет как форма <br />
                  <span className="italic font-normal text-[#C17B5C]">современного уюта</span>
                </motion.h1>

                <motion.p
                  variants={fadeIn}
                  className="text-lg sm:text-xl text-[#6B5D4F] leading-relaxed max-w-xl mb-10 font-sans font-normal"
                >
                  Коллекция лаконичных светильников, созданных методом аддитивного производства. 
                  Чистая геометрия, теплый рассеянный свет и внимание к деталям.
                </motion.p>

                <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-6">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-3 px-9 py-4 bg-[#2C2416] text-[#FAF7F2] hover:bg-[#C17B5C] transition-colors duration-300 text-base tracking-wide rounded-full font-sans"
                  >
                    <span>В каталог</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center text-base font-medium text-[#2C2416] hover:text-[#C17B5C] transition-colors border-b border-[#2C2416]/30 pb-0.5 tracking-wide"
                  >
                    Связаться с нами
                  </Link>
                </motion.div>
              </motion.div>

              {/* Hero Image */}
              <motion.div
                className="lg:col-span-5"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#E8DCC8]/30">
                  <img
                    src="/uploads/image_0_0.jpg"
                    alt="Светильник 3d fabriq"
                    className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 border-b border-[#E8DCC8]/60">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
              <div>
                <span className="text-sm uppercase tracking-[0.2em] text-[#8C7E72] block mb-2 font-mono">Навигация</span>
                <h2 className="text-3xl sm:text-4xl font-light font-serif">Категории изделий</h2>
              </div>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1.5 text-sm uppercase tracking-wider text-[#6B5D4F] hover:text-[#C17B5C] transition-colors"
              >
                Все модели <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={cat.href}
                  className="group block p-8 rounded-xl bg-white/60 border border-[#E8DCC8]/70 hover:border-[#C17B5C]/60 hover:bg-white transition-all duration-300"
                >
                  <span className="text-sm text-[#8C7E72] block mb-6 font-mono">0{idx + 1}</span>
                  <h3 className="text-xl font-medium text-[#2C2416] group-hover:text-[#C17B5C] transition-colors mb-2 font-serif">
                    {cat.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-[#8C7E72] pt-4 border-t border-[#E8DCC8]/40">
                    <span>{cat.count}</span>
                    <ArrowRight className="w-4 h-4 -translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Values / Philosophy */}
        <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-[#F4EFEA] border-b border-[#E8DCC8]/60">
          <div className="container mx-auto max-w-7xl">
            <div className="max-w-xl mb-16 sm:mb-20">
              <span className="text-sm uppercase tracking-[0.2em] text-[#8C7E72] block mb-2 font-mono">Подход</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light font-serif leading-tight">
                Технологичность и лаконичная эстетика
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-10">
              {values.map((val, idx) => (
                <div key={idx} className="relative pt-6 border-t border-[#2C2416]/15">
                  <span className="text-sm font-mono text-[#C17B5C] block mb-4">{val.num}</span>
                  <h3 className="text-2xl font-medium mb-3 font-serif">{val.title}</h3>
                  <p className="text-base text-[#6B5D4F] leading-relaxed font-sans">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 border-b border-[#E8DCC8]/60">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-lg mx-auto mb-16">
              <span className="text-sm uppercase tracking-[0.2em] text-[#8C7E72] block mb-2 font-mono">Процесс</span>
              <h2 className="text-3xl sm:text-4xl font-light font-serif">Как мы создаем и отправляем заказ</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <span className="text-4xl font-light text-[#E8DCC8] block mb-3 font-serif">{step.step}</span>
                  <h4 className="text-lg font-medium mb-2 font-serif text-[#2C2416]">{step.title}</h4>
                  <p className="text-sm sm:text-base text-[#6B5D4F] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Products */}
        <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
              <div>
                <span className="text-sm uppercase tracking-[0.2em] text-[#8C7E72] block mb-2 font-mono">Избранное</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light font-serif">Популярные модели</h2>
              </div>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1.5 text-sm uppercase tracking-wider text-[#6B5D4F] hover:text-[#C17B5C] transition-colors"
              >
                Весь каталог <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products && products.length > 0 ? (
                products.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/catalog/${item.id}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[#E8DCC8]/30 mb-5 relative">
                      <img
                        src={item.images[0] || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-16 text-[#8C7E72] text-base">
                  Товары скоро появятся в каталоге.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Minimalist CTA */}
        <section className="py-24 sm:py-28 px-6 sm:px-10 lg:px-16 bg-[#C17B5C] text-[#FAF7F2]">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl sm:text-6xl font-light font-serif leading-tight mb-6">
              Создайте мягкую атмосферу <br />
              <span className="italic text-[#E8DCC8]">в вашем доме</span>
            </h2>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 max-w-md mx-auto mb-10 leading-relaxed font-sans">
              Каждый светильник изготавливается под заказ с вниманием к чистоте линий и балансу света.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-3 px-9 py-4 bg-[#FAF7F2] text-[#2C2416] hover:bg-[#2C2416] hover:text-[#FAF7F2] transition-colors duration-300 text-base tracking-wide rounded-full font-sans"
            >
              <span>Перейти в каталог</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}