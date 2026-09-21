// components/footer.tsx

import Link from "next/link"
import { Instagram, Mail, ArrowUpRight } from "lucide-react"

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

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#FAF7F2] text-[#2C2416] border-t border-[#E8DCC8]/70 selection:bg-[#C17B5C]/20 selection:text-[#2C2416]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 lg:px-16 pt-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 pb-12 border-b border-[#E8DCC8]/60">
          
          {/* Бренд и концепция */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#2C2416] group-hover:text-[#C17B5C] transition-colors">
                3d fabriq
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#6B5D4F] leading-relaxed max-w-sm font-sans">
              Авторские светильники и вазы, созданные методом параметрической 3D-печати. 
              Экологичные полимеры, мягкий рассеянный свет и внимание к деталям.
            </p>
            <p className="text-[11px] text-[#8C7E72] font-mono">
              Минск, Беларусь • Доставка по всей стране
            </p>
          </div>

          {/* Навигация по разделам */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[#8C7E72] font-mono block mb-2">
              Навигация
            </span>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans">
              <li>
                <Link href="/catalog" className="text-[#6B5D4F] hover:text-[#C17B5C] transition-colors">
                  Каталог изделий
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#6B5D4F] hover:text-[#C17B5C] transition-colors">
                  Связаться с мастерской
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[#6B5D4F] hover:text-[#C17B5C] transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          {/* Каналы связи */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[#8C7E72] font-mono block mb-2">
              Связь и соцсети
            </span>
            <div className="space-y-2.5 text-xs sm:text-sm font-sans">
              
              {/* Telegram */}
              <Link
                href="https://t.me/ViBo_30"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-[#6B5D4F] hover:text-[#C17B5C] transition-colors py-1 group"
              >
                <div className="flex items-center gap-2.5">
                  <TelegramIcon className="w-3.5 h-3.5 text-[#C17B5C]" />
                  <span>Telegram</span>
                </div>
                <span className="text-xs font-mono text-[#8C7E72] group-hover:text-[#C17B5C] inline-flex items-center gap-0.5">
                  @ViBo_30
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </Link>

              {/* Instagram */}
              <Link
                href="https://www.instagram.com/3d_fabriq_minsk/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-[#6B5D4F] hover:text-[#C17B5C] transition-colors py-1 group"
              >
                <div className="flex items-center gap-2.5">
                  <Instagram className="w-3.5 h-3.5 text-[#C17B5C]" />
                  <span>Instagram</span>
                </div>
                <span className="text-xs font-mono text-[#8C7E72] group-hover:text-[#C17B5C] inline-flex items-center gap-0.5">
                  3d_fabriq_minsk
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </Link>

              {/* Email */}
              <a
                href="mailto:3dfabriq@mail.ru"
                className="flex items-center justify-between text-[#6B5D4F] hover:text-[#C17B5C] transition-colors py-1 group"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-[#C17B5C]" />
                  <span>Email</span>
                </div>
                <span className="text-xs font-mono text-[#8C7E72] group-hover:text-[#C17B5C]">
                  3dfabriq@mail.ru
                </span>
              </a>

            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}