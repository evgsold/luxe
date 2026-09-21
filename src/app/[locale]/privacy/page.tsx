// app/privacy/page.tsx

import Link from "next/link"
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react"

export const metadata = {
  title: "Политика конфиденциальности | 3d fabriq",
  description: "Политика в отношении обработки персональных данных пользователей сайта.",
}

export default function PrivacyPage() {
  const sections = [
    { id: "s1", title: "1. Общие положения" },
    { id: "s2", title: "2. Основные понятия" },
    { id: "s3", title: "3. Права и обязанности Оператора" },
    { id: "s4", title: "4. Права и обязанности субъектов данных" },
    { id: "s5", title: "5. Принципы обработки данных" },
    { id: "s6", title: "6. Цели обработки данных" },
    { id: "s7", title: "7. Условия обработки данных" },
    { id: "s8", title: "8. Порядок сбора, хранения и передачи" },
    { id: "s9", title: "9. Перечень действий с данными" },
    { id: "s10", title: "10. Трансграничная передача" },
    { id: "s11", title: "11. Конфиденциальность данных" },
    { id: "s12", title: "12. Заключительные положения" },
  ]

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2416] selection:bg-[#C17B5C]/20 selection:text-[#2C2416]">
      {/* Верхняя панель навигации */}
      <div className="pt-6 sm:pt-8 pb-4 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto border-b border-[#E8DCC8]/60">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-wider text-[#8C7E72] font-mono">
            <Link href="/" className="hover:text-[#C17B5C] transition-colors py-1 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Главная</span>
            </Link>
            <span>/</span>
            <span className="text-[#2C2416] font-medium">Политика конфиденциальности</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-8 lg:px-16 py-10 sm:py-16">
        {/* Заголовок страницы */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DCC8]/40 border border-[#E8DCC8] text-[#C17B5C] text-xs font-mono mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>152-ФЗ • Защита персональных данных</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-light font-serif text-[#2C2416] leading-tight mb-4">
            Политика в отношении обработки персональных данных
          </h1>
          <p className="text-xs sm:text-sm text-[#8C7E72] font-mono">
            Редакция действует бессрочно до замены новой версией
          </p>
        </div>

        {/* Сетка: Оглавление (Desktop) + Текст политики */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Плавающее боковое меню (Только ПК) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-8 space-y-4">
            <div className="p-6 bg-white/50 border border-[#E8DCC8] rounded-2xl">
              <span className="text-xs uppercase tracking-[0.15em] text-[#8C7E72] font-mono block mb-4">
                Навигация по документу
              </span>
              <ul className="space-y-2 text-xs font-sans">
                {sections.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-[#6B5D4F] hover:text-[#C17B5C] transition-colors block py-0.5 leading-snug"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-[#E8DCC8]/60">
                <span className="text-[11px] text-[#8C7E72] block font-mono mb-2">Вопросы по обработке данных:</span>
                <a
                  href="mailto:privacy@thismywebsite.com"
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#2C2416] hover:text-[#C17B5C] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C17B5C]" />
                  <span>privacy@thismywebsite.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Основной текст */}
          <main className="lg:col-span-8 space-y-12 text-sm sm:text-base text-[#6B5D4F] leading-relaxed font-sans">
            
            {/* 1. Общие положения */}
            <section id="s1" className="scroll-mt-8 space-y-4 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416]">
                1. Общие положения
              </h2>
              <p>
                Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. № 152-ФЗ «О персональных данных» (далее — Закон о персональных данных) и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые Михайловым Иваном Сергеевичем (далее — Оператор).
              </p>
              <p>
                <strong className="text-[#2C2416] font-medium">1.1.</strong> Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.
              </p>
              <p>
                <strong className="text-[#2C2416] font-medium">1.2.</strong> Настоящая политика Оператора в отношении обработки персональных данных (далее — Политика) применяется ко всей информации, которую Оператор может получить о посетителях веб-сайта <span className="font-mono text-[#2C2416]">https://thismywebsite.com</span>.
              </p>
            </section>

            {/* 2. Основные понятия */}
            <section id="s2" className="scroll-mt-8 space-y-4 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416]">
                2. Основные понятия, используемые в Политике
              </h2>
              <div className="space-y-3">
                <p><strong className="text-[#2C2416] font-medium">2.1. Автоматизированная обработка персональных данных</strong> — обработка персональных данных с помощью средств вычислительной техники.</p>
                <p><strong className="text-[#2C2416] font-medium">2.2. Блокирование персональных данных</strong> — временное прекращение обработки персональных данных (за исключением случаев, если обработка необходима для уточнения персональных данных).</p>
                <p><strong className="text-[#2C2416] font-medium">2.3. Веб-сайт</strong> — совокупность графических и информационных материалов, а также программ для ЭВМ и баз данных, обеспечивающих их доступность в сети интернет по сетевому адресу <span className="font-mono text-[#2C2416]">https://thismywebsite.com</span>.</p>
                <p><strong className="text-[#2C2416] font-medium">2.4. Информационная система персональных данных</strong> — совокупность содержащихся в базах данных персональных данных и обеспечивающих их обработку информационных технологий и технических средств.</p>
                <p><strong className="text-[#2C2416] font-medium">2.5. Обезличивание персональных данных</strong> — действия, в результате которых невозможно определить без использования дополнительной информации принадлежность персональных данных конкретному Пользователю или иному субъекту персональных данных.</p>
                <p><strong className="text-[#2C2416] font-medium">2.6. Обработка персональных данных</strong> — любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных.</p>
                <p><strong className="text-[#2C2416] font-medium">2.7. Оператор</strong> — государственный орган, муниципальный орган, юридическое или физическое лицо, самостоятельно или совместно с другими лицами организующие и/или осуществляющие обработку персональных данных, а также определяющие цели обработки персональных данных, состав персональных данных, подлежащих обработке, действия (операции), совершаемые с персональными данными.</p>
                <p><strong className="text-[#2C2416] font-medium">2.8. Персональные данные</strong> — любая информация, относящаяся прямо или косвенно к определенному или определяемому Пользователю веб-сайта <span className="font-mono text-[#2C2416]">https://thismywebsite.com</span>.</p>
                <p><strong className="text-[#2C2416] font-medium">2.9. Персональные данные, разрешенные для распространения</strong> — данные, доступ неограниченного круга лиц к которым предоставлен субъектом путем дачи согласия на обработку в порядке, предусмотренном Законом о персональных данных.</p>
                <p><strong className="text-[#2C2416] font-medium">2.10. Пользователь</strong> — любой посетитель веб-сайта <span className="font-mono text-[#2C2416]">https://thismywebsite.com</span>.</p>
                <p><strong className="text-[#2C2416] font-medium">2.11. Предоставление персональных данных</strong> — действия, направленные на раскрытие персональных данных определенному лицу или определенному кругу лиц.</p>
                <p><strong className="text-[#2C2416] font-medium">2.12. Распространение персональных данных</strong> — любые действия, направленные на раскрытие персональных данных неопределенному кругу лиц или на ознакомление с ними неограниченного круга лиц.</p>
                <p><strong className="text-[#2C2416] font-medium">2.13. Трансграничная передача персональных данных</strong> — передача персональных данных на территорию иностранного государства органу власти иностранного государства, иностранному физическому или юридическому лицу.</p>
                <p><strong className="text-[#2C2416] font-medium">2.14. Уничтожение персональных данных</strong> — любые действия, в результате которых персональные данные уничтожаются безвозвратно с невозможностью дальнейшего восстановления содержания.</p>
              </div>
            </section>

            {/* 3. Права и обязанности Оператора */}
            <section id="s3" className="scroll-mt-8 space-y-4 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416]">
                3. Основные права и обязанности Оператора
              </h2>
              <div className="space-y-3">
                <p><strong className="text-[#2C2416] font-medium">3.1. Оператор имеет право:</strong></p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>получать от субъекта персональных данных достоверные информацию и/или документы, содержащие персональные данные;</li>
                  <li>в случае отзыва согласия продолжить обработку персональных данных без согласия при наличии оснований, указанных в Законе о персональных данных;</li>
                  <li>самостоятельно определять состав и перечень мер, необходимых и достаточных для обеспечения выполнения обязанностей, предусмотренных законодательством.</li>
                </ul>

                <p className="pt-2"><strong className="text-[#2C2416] font-medium">3.2. Оператор обязан:</strong></p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>предоставлять субъекту персональных данных по его просьбе информацию, касающуюся обработки его персональных данных;</li>
                  <li>организовывать обработку персональных данных в порядке, установленном законодательством РФ;</li>
                  <li>отвечать на обращения и запросы субъектов и их законных представителей;</li>
                  <li>сообщать в уполномоченный орган по защите прав субъектов необходимую информацию в течение 10 дней с даты получения запроса;</li>
                  <li>публиковать или иным образом обеспечивать неограниченный доступ к настоящей Политике;</li>
                  <li>принимать правовые, организационные и технические меры для защиты персональных данных;</li>
                  <li>прекратить передачу, обработку и уничтожить персональные данные в порядке и случаях, предусмотренных Законом.</li>
                </ul>
              </div>
            </section>

            {/* 4. Права и обязанности субъектов данных */}
            <section id="s4" className="scroll-mt-8 space-y-4 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416]">
                4. Основные права и обязанности субъектов персональных данных
              </h2>
              <div className="space-y-3">
                <p><strong className="text-[#2C2416] font-medium">4.1. Субъекты персональных данных имеют право:</strong></p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>получать информацию, касающуюся обработки его персональных данных;</li>
                  <li>требовать от оператора уточнения его персональных данных, их блокирования или уничтожения в случае, если они неполные, устаревшие, неточные или незаконно полученные;</li>
                  <li>выдвигать условие предварительного согласия при обработке данных в целях продвижения товаров и услуг;</li>
                  <li>на отзыв согласия на обработку персональных данных;</li>
                  <li>обжаловать в уполномоченный орган или в судебном порядке неправомерные действия или бездействие Оператора.</li>
                </ul>

                <p className="pt-2"><strong className="text-[#2C2416] font-medium">4.2. Субъекты персональных данных обязаны:</strong></p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>предоставлять Оператору достоверные данные о себе;</li>
                  <li>сообщать Оператору об уточнении (обновлении, изменении) своих персональных данных.</li>
                </ul>

                <p className="pt-2 text-xs sm:text-sm">
                  <strong className="text-[#2C2416] font-medium">4.3.</strong> Лица, передавшие Оператору недостоверные сведения о себе либо сведения о другом субъекте без согласия последнего, несут ответственность в соответствии с законодательством РФ.
                </p>
              </div>
            </section>

            {/* 5. Принципы обработки */}
            <section id="s5" className="scroll-mt-8 space-y-3 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416] mb-3">
                5. Принципы обработки персональных данных
              </h2>
              <p><strong className="text-[#2C2416] font-medium">5.1.</strong> Обработка осуществляется на законной и справедливой основе.</p>
              <p><strong className="text-[#2C2416] font-medium">5.2.</strong> Обработка ограничивается достижением конкретных, заранее определенных и законных целей.</p>
              <p><strong className="text-[#2C2416] font-medium">5.3.</strong> Не допускается объединение баз данных, содержащих персональные данные, цели обработки которых несовместимы.</p>
              <p><strong className="text-[#2C2416] font-medium">5.4.</strong> Обработке подлежат только данные, отвечающие целям их обработки.</p>
              <p><strong className="text-[#2C2416] font-medium">5.5.</strong> Содержание и объем обрабатываемых данных соответствуют заявленным целям, избыточность не допускается.</p>
              <p><strong className="text-[#2C2416] font-medium">5.6.</strong> Обеспечивается точность, достаточность и актуальность персональных данных.</p>
              <p><strong className="text-[#2C2416] font-medium">5.7.</strong> Хранение осуществляется в форме, позволяющей определить субъекта, не дольше, чем этого требуют цели обработки.</p>
            </section>

            {/* 6. Цели обработки персональных данных (Оформленная спецификация) */}
            <section id="s6" className="scroll-mt-8 space-y-4 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416]">
                6. Цели обработки персональных данных
              </h2>
              <div className="bg-white/60 border border-[#E8DCC8] rounded-2xl p-6 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-3 border-b border-[#E8DCC8]/40">
                  <span className="font-mono text-[#8C7E72] uppercase tracking-wider">Цель обработки:</span>
                  <span className="sm:col-span-2 text-[#2C2416] font-medium">
                    Информирование Пользователя посредством отправки электронных писем
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-3 border-b border-[#E8DCC8]/40">
                  <span className="font-mono text-[#8C7E72] uppercase tracking-wider">Персональные данные:</span>
                  <span className="sm:col-span-2 text-[#2C2416]">
                    Фамилия, имя, отчество, электронный адрес, номера телефонов, фотографии (для обратной связи)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-3 border-b border-[#E8DCC8]/40">
                  <span className="font-mono text-[#8C7E72] uppercase tracking-wider">Правовые основания:</span>
                  <span className="sm:col-span-2 text-[#2C2416]">
                    Федеральный закон «Об информации, информационных технологиях и о защите информации» от 27.07.2006 N 149-ФЗ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="font-mono text-[#8C7E72] uppercase tracking-wider">Виды обработки:</span>
                  <span className="sm:col-span-2 text-[#2C2416]">
                    Отправка информационных писем на адрес электронной почты
                  </span>
                </div>
              </div>
            </section>

            {/* 7. Условия обработки */}
            <section id="s7" className="scroll-mt-8 space-y-3 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416] mb-3">
                7. Условия обработки персональных данных
              </h2>
              <p><strong className="text-[#2C2416] font-medium">7.1.</strong> Обработка осуществляется с согласия субъекта персональных данных.</p>
              <p><strong className="text-[#2C2416] font-medium">7.2.</strong> Обработка необходима для достижения целей, предусмотренных законом или международным договором.</p>
              <p><strong className="text-[#2C2416] font-medium">7.3.</strong> Обработка необходима для осуществления правосудия или исполнения судебного акта.</p>
              <p><strong className="text-[#2C2416] font-medium">7.4.</strong> Обработка необходима для исполнения или заключения договора по инициативе субъекта данных.</p>
              <p><strong className="text-[#2C2416] font-medium">7.5.</strong> Обработка необходима для осуществления прав и законных интересов оператора или третьих лиц.</p>
              <p><strong className="text-[#2C2416] font-medium">7.6.</strong> Осуществляется обработка данных, доступ к которым предоставлен неограниченному кругу лиц.</p>
              <p><strong className="text-[#2C2416] font-medium">7.7.</strong> Осуществляется обработка данных, подлежащих опубликованию или обязательному раскрытию по закону.</p>
            </section>

            {/* 8. Порядок сбора, хранения и передачи */}
            <section id="s8" className="scroll-mt-8 space-y-3 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416] mb-3">
                8. Порядок сбора, хранения, передачи и других видов обработки
              </h2>
              <p>Безопасность данных обеспечивается реализацией правовых, организационных и технических мер.</p>
              <p><strong className="text-[#2C2416] font-medium">8.1.</strong> Оператор обеспечивает сохранность данных и исключает доступ к ним неуполномоченных лиц.</p>
              <p><strong className="text-[#2C2416] font-medium">8.2.</strong> Персональные данные никогда не передаются третьим лицам, за исключением случаев исполнения законодательства либо прямого согласия субъекта.</p>
              <p><strong className="text-[#2C2416] font-medium">8.3.</strong> Пользователь может актуализировать данные, направив письмо на <a href="mailto:privacy@thismywebsite.com" className="underline hover:text-[#C17B5C]">privacy@thismywebsite.com</a> с пометкой «Актуализация персональных данных».</p>
              <p><strong className="text-[#2C2416] font-medium">8.4.</strong> Согласие может быть отозвано в любой момент письмом на <a href="mailto:privacy@thismywebsite.com" className="underline hover:text-[#C17B5C]">privacy@thismywebsite.com</a> с пометкой «Отзыв согласия на обработку персональных данных».</p>
              <p><strong className="text-[#2C2416] font-medium">8.5.</strong> Сторонние сервисы (платежные системы, почтовые службы) обрабатывают данные по собственным регламентам. Оператор не несет ответственности за их действия.</p>
              <p><strong className="text-[#2C2416] font-medium">8.6.</strong> Запреты субъекта на передачу не действуют в случаях обработки в государственных интересах.</p>
              <p><strong className="text-[#2C2416] font-medium">8.7–8.9.</strong> Обеспечивается конфиденциальность. Данные хранятся не дольше, чем требуют цели их сбора, после чего безвозвратно уничтожаются или обезличиваются.</p>
            </section>

            {/* 9. Перечень действий */}
            <section id="s9" className="scroll-mt-8 space-y-3 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416] mb-3">
                9. Перечень действий, производимых Оператором
              </h2>
              <p><strong className="text-[#2C2416] font-medium">9.1.</strong> Оператор осуществляет сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу, обезличивание, блокирование, удаление и уничтожение персональных данных.</p>
              <p><strong className="text-[#2C2416] font-medium">9.2.</strong> Осуществляется автоматизированная обработка данных с получением и/или передачей информации по сетям или без таковой.</p>
            </section>

            {/* 10. Трансграничная передача */}
            <section id="s10" className="scroll-mt-8 space-y-3 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416] mb-3">
                10. Трансграничная передача персональных данных
              </h2>
              <p><strong className="text-[#2C2416] font-medium">10.1.</strong> Оператор обязан уведомить уполномоченный орган по защите прав субъектов до начала трансграничной передачи.</p>
              <p><strong className="text-[#2C2416] font-medium">10.2.</strong> До подачи уведомления Оператор обязан получить соответствующие сведения от органов власти иностранного государства или иностранных контрагентов.</p>
            </section>

            {/* 11. Конфиденциальность */}
            <section id="s11" className="scroll-mt-8 space-y-3 border-b border-[#E8DCC8]/60 pb-10">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416] mb-3">
                11. Конфиденциальность персональных данных
              </h2>
              <p>
                Оператор и иные лица, получившие доступ к персональным данным, обязаны не раскрывать третьим лицам и не распространять персональные данные без согласия субъекта персональных данных, если иное не предусмотрено федеральным законом.
              </p>
            </section>

            {/* 12. Заключительные положения */}
            <section id="s12" className="scroll-mt-8 space-y-3 pb-6">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#2C2416] mb-3">
                12. Заключительные положения
              </h2>
              <p>
                <strong className="text-[#2C2416] font-medium">12.1.</strong> Пользователь может получить любые разъяснения по интересующим вопросам, обратившись к Оператору по электронной почте{" "}
                <a href="mailto:privacy@thismywebsite.com" className="text-[#2C2416] underline hover:text-[#C17B5C] font-mono">
                  privacy@thismywebsite.com
                </a>.
              </p>
              <p>
                <strong className="text-[#2C2416] font-medium">12.2.</strong> В документе будут отражены любые изменения политики. Политика действует бессрочно до замены ее новой версией.
              </p>
              <p>
                <strong className="text-[#2C2416] font-medium">12.3.</strong> Актуальная версия Политики в свободном доступе расположена в сети Интернет по адресу{" "}
                <span className="font-mono text-[#2C2416]">https://thismywebsite.com/privacy/</span>.
              </p>
            </section>

          </main>

        </div>
      </div>
    </div>
  )
}