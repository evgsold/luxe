"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Phone, Instagram, ArrowRight, Upload, X, Paperclip } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { sendEmail } from "@/actions/sendEmail"
import Link from "next/link"
import Image from "next/image"

// Иконка Telegram
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [formStatus, setFormStatus] = useState<{ message: string; type: "success" | "error" | "" }>({
    message: "",
    type: "",
  })
  const [copied, setCopied] = useState<string>("")

  // Временные URL для превью файлов
  const filePreviews = files.map((file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
    url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
  }))

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => {
        if (preview.url) URL.revokeObjectURL(preview.url)
      })
    }
  }, [files])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(type)
        setTimeout(() => setCopied(""), 2000)
      },
      () => {
        setFormStatus({ message: "Не удалось скопировать. Попробуйте еще раз.", type: "error" })
      }
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
    const fileInput = document.getElementById("files") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormStatus({ message: "", type: "" })

    const formData = new FormData(event.currentTarget)
    formData.delete("files")
    files.forEach((file) => {
      formData.append("files", file)
    })

    const result = await sendEmail(formData)

    if (result.success) {
      setFormStatus({ message: result.message, type: "success" })
      ;(event.target as HTMLFormElement).reset()
      setFiles([])
    } else {
      setFormStatus({ message: result.message || "Произошла ошибка при отправке.", type: "error" })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2416] selection:bg-[#C17B5C]/20 selection:text-[#2C2416]">
      {/* Верхний навигационный штамп */}
      <div className="pt-8 pb-8 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <nav className="text-[11px] sm:text-xs uppercase tracking-wider text-[#8C7E72] font-mono">
          <Link href="/" className="hover:text-[#C17B5C] transition-colors">
            Главная
          </Link>
          <span className="mx-2 text-[#8C7E72]/50">/</span>
          <span className="text-[#2C2416]">Контакты</span>
        </nav>
      </div>

      <section className="px-4 sm:px-8 lg:px-16 pb-16 sm:pb-24">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Левая колонка: Интро и прямые контакты */}
            <motion.div
              className="lg:col-span-5 space-y-8 lg:sticky lg:top-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#C17B5C] block mb-3 font-mono font-medium">
                  Обратная связь
                </span>
                <h1 className="text-3xl sm:text-5xl font-light font-serif text-[#2C2416] leading-[1.12] mb-5">
                  Связаться с <br />
                  <span className="italic text-[#C17B5C]">мастерской</span>
                </h1>
                <p className="text-sm sm:text-base text-[#6B5D4F] leading-relaxed font-sans max-w-md">
                  Расскажите о желаемой форме, размерах или оттенке изделия. Мы поможем подобрать идеальную геометрию и рассчитаем точные сроки 3D-печати.
                </p>
              </div>

              {/* Прямые каналы связи */}
              <div className="space-y-3 pt-4 border-t border-[#E8DCC8]/70">
                <span className="text-xs uppercase tracking-[0.15em] text-[#8C7E72] block mb-2 font-mono">
                  Быстрая связь
                </span>

                {/* Telegram */}
                <Link
                  href="https://t.me/ViBo_30"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-4 bg-white/70 hover:bg-white border border-[#E8DCC8] rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <TelegramIcon className="w-4 h-4 text-[#C17B5C]" />
                    <span className="text-sm font-medium text-[#2C2416]">Telegram</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#8C7E72] group-hover:text-[#C17B5C] transition-colors">
                      @ViBo_30
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#8C7E72] group-hover:translate-x-0.5 group-hover:text-[#C17B5C] transition-all" />
                  </div>
                </Link>

                {/* Телефон */}
                <button
                  type="button"
                  onClick={() => copyToClipboard("+375 (99) 123-45-67", "Телефон")}
                  className="w-full flex items-center justify-between p-4 bg-white/70 hover:bg-white border border-[#E8DCC8] rounded-xl transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#C17B5C]" />
                    <span className="text-sm font-medium text-[#2C2416]">+375 (99) 123-45-67</span>
                  </div>
                  <span className="text-xs font-mono text-[#8C7E72] group-hover:text-[#C17B5C] transition-colors">
                    {copied === "Телефон" ? "Скопировано" : "Скопировать"}
                  </span>
                </button>

                {/* Instagram */}
                <Link
                  href="https://www.instagram.com/3d_fabriq_minsk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-4 bg-white/70 hover:bg-white border border-[#E8DCC8] rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-[#C17B5C]" />
                    <span className="text-sm font-medium text-[#2C2416]">Instagram</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8C7E72] group-hover:translate-x-0.5 group-hover:text-[#C17B5C] transition-all" />
                </Link>
              </div>

              <div className="pt-2">
                <p className="text-xs text-[#8C7E72] font-mono leading-relaxed">
                  Минск, Беларусь • Доставка заказов по всей стране.
                  <br />
                  Отвечаем на сообщения в течение 24 часов.
                </p>
              </div>
            </motion.div>

            {/* Правая колонка: Форма связи */}
            <motion.div
              className="lg:col-span-7 bg-white/60 border border-[#E8DCC8]/80 rounded-2xl p-6 sm:p-10 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Имя */}
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-[0.15em] text-[#8C7E72] mb-2 font-mono">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Алексей"
                    className="w-full px-4 py-3.5 bg-[#FAF7F2]/50 border border-[#E8DCC8] rounded-xl text-sm text-[#2C2416] placeholder:text-[#8C7E72]/50 focus:outline-none focus:border-[#2C2416] transition-colors"
                  />
                </div>

                {/* Контакты (Сетка 2 колонки) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-xs uppercase tracking-[0.15em] text-[#8C7E72] mb-2 font-mono">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3.5 bg-[#FAF7F2]/50 border border-[#E8DCC8] rounded-xl text-sm text-[#2C2416] placeholder:text-[#8C7E72]/50 focus:outline-none focus:border-[#2C2416] transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs uppercase tracking-[0.15em] text-[#8C7E72] mb-2 font-mono">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+375 (29) 000-00-00"
                      className="w-full px-4 py-3.5 bg-[#FAF7F2]/50 border border-[#E8DCC8] rounded-xl text-sm text-[#2C2416] placeholder:text-[#8C7E72]/50 focus:outline-none focus:border-[#2C2416] transition-colors"
                    />
                  </div>
                </div>

                {/* Сообщение / Пожелания */}
                <div>
                  <label htmlFor="message" className="block text-xs uppercase tracking-[0.15em] text-[#8C7E72] mb-2 font-mono">
                    Пожелания к изделию *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Опишите желаемую форму, размеры, цветовую палитру или модель из каталога, которую вы хотели бы адаптировать..."
                    className="w-full px-4 py-3.5 bg-[#FAF7F2]/50 border border-[#E8DCC8] rounded-xl text-sm text-[#2C2416] placeholder:text-[#8C7E72]/50 focus:outline-none focus:border-[#2C2416] transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Загрузка файлов */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-[#8C7E72] mb-2 font-mono">
                    Референсы или фото интерьера (опционально)
                  </label>
                  
                  <div className="relative">
                    <input
                      type="file"
                      id="files"
                      name="files"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="files"
                      className="flex items-center justify-center gap-2.5 w-full px-4 py-4 border border-dashed border-[#E8DCC8] hover:border-[#2C2416] rounded-xl cursor-pointer bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] transition-colors group"
                    >
                      <Upload className="w-4 h-4 text-[#8C7E72] group-hover:text-[#2C2416] transition-colors" />
                      <span className="text-xs sm:text-sm text-[#6B5D4F] font-sans">
                        {files.length > 0 ? `Выбрано файлов: ${files.length}` : "Прикрепить изображения или файлы"}
                      </span>
                    </label>
                  </div>

                  {/* Превью прикрепленных файлов */}
                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <AnimatePresence>
                        {filePreviews.map((preview, index) => (
                          <motion.div
                            key={preview.name + index}
                            layout
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between p-2.5 bg-white border border-[#E8DCC8] rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-3">
                              {preview.url ? (
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#E8DCC8]/60">
                                  <Image src={preview.url} alt={preview.name} fill className="object-cover" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] flex items-center justify-center flex-shrink-0 border border-[#E8DCC8]/60">
                                  <Paperclip className="w-4 h-4 text-[#8C7E72]" />
                                </div>
                              )}
                              <div className="truncate">
                                <p className="font-medium text-[#2C2416] truncate">{preview.name}</p>
                                <p className="text-[11px] text-[#8C7E72] font-mono">{Math.round(preview.size / 1024)} KB</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              aria-label="Удалить файл"
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-[#8C7E72] hover:text-[#2C2416] transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Кнопка отправки */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-3 min-h-[48px] px-8 py-3.5 bg-[#2C2416] text-[#FAF7F2] hover:bg-[#C17B5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full text-xs uppercase tracking-wider font-medium font-sans shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Отправка запроса...</span>
                      </>
                    ) : (
                      <>
                        <span>Отправить запрос</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Сообщение о статусе отправки */}
                <AnimatePresence>
                  {formStatus.message && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={`text-center text-xs tracking-wide font-medium font-sans pt-1 ${
                        formStatus.type === "success" ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {formStatus.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  )
}