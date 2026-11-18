// app/catalog/page.tsx

import { promises as fs } from "node:fs"
import path from "node:path"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { getAllProducts } from "@/lib/data"

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

interface ImageSize {
  width: number
  height: number
}

const DEFAULT_SIZE: ImageSize = { width: 800, height: 600 }
const HEADER_BYTES = 131072 // 128 КБ достаточно для заголовка любого изображения

function parseImageSize(buf: Buffer): ImageSize | null {
  if (buf.length < 12) return null

  // PNG
  if (
    buf.length >= 24 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    const width = buf.readUInt32BE(16)
    const height = buf.readUInt32BE(20)
    return width > 0 && height > 0 ? { width, height } : null
  }

  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    const width = buf.readUInt16LE(6)
    const height = buf.readUInt16LE(8)
    return width > 0 && height > 0 ? { width, height } : null
  }

  // WebP
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP" &&
    buf.length >= 30
  ) {
    const chunk = buf.toString("ascii", 12, 16)
    if (chunk === "VP8 " && buf[23] === 0x9d && buf[24] === 0x01 && buf[25] === 0x2a) {
      const width = buf.readUInt16LE(26) & 0x3fff
      const height = buf.readUInt16LE(28) & 0x3fff
      return width > 0 && height > 0 ? { width, height } : null
    }
    if (chunk === "VP8L" && buf[20] === 0x2f) {
      const bits = buf.readUInt32LE(21)
      const width = (bits & 0x3fff) + 1
      const height = ((bits >> 14) & 0x3fff) + 1
      return { width, height }
    }
    if (chunk === "VP8X") {
      const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16))
      const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16))
      return { width, height }
    }
  }

  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i < buf.length) {
      while (i < buf.length && buf[i] !== 0xff) i++
      while (i < buf.length && buf[i] === 0xff) i++
      if (i >= buf.length) break

      const marker = buf[i++]
      if (
        marker === 0xd8 ||
        marker === 0xd9 ||
        marker === 0x01 ||
        (marker >= 0xd0 && marker <= 0xd7)
      ) {
        continue
      }
      if (marker === 0xda) break
      if (i + 2 > buf.length) break

      const segLength = buf.readUInt16BE(i)
      if (segLength < 2) break

      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        if (i + 7 <= buf.length) {
          const height = buf.readUInt16BE(i + 3)
          const width = buf.readUInt16BE(i + 5)
          if (width > 0 && height > 0) return { width, height }
        }
        break
      }

      i += segLength
    }
  }

  return null
}

async function getImageSize(src: string): Promise<ImageSize> {
  try {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      const res = await fetch(src, {
        headers: { Range: `bytes=0-${HEADER_BYTES - 1}` },
        signal: AbortSignal.timeout(2500),
      })
      if (!res.ok) return DEFAULT_SIZE
      const buf = Buffer.from(await res.arrayBuffer())
      return parseImageSize(buf) ?? DEFAULT_SIZE
    }

    const publicDir = path.resolve(process.cwd(), "public")
    const relPath = src.split("?")[0].split("#")[0].replace(/^\/+/, "")
    const filePath = path.resolve(publicDir, relPath)

    if (!filePath.startsWith(publicDir + path.sep)) {
      return DEFAULT_SIZE
    }

    const handle = await fs.open(filePath, "r")
    try {
      const buf = Buffer.alloc(HEADER_BYTES)
      const { bytesRead } = await handle.read(buf, 0, HEADER_BYTES, 0)
      return parseImageSize(buf.subarray(0, bytesRead)) ?? DEFAULT_SIZE
    } finally {
      await handle.close()
    }
  } catch {
    return DEFAULT_SIZE
  }
}

export default async function CatalogPage() {
  try {
    const allProducts: Product[] = await getAllProducts()

    const uniqueImages = Array.from(
      new Set(
        allProducts
          .map((p) => p.images?.[0])
          .filter((img): img is string => Boolean(img))
      )
    )

    const sizeEntries = await Promise.all(
      uniqueImages.map(async (img) => [img, await getImageSize(img)] as const)
    )
    const imageSizes: Record<string, ImageSize> = Object.fromEntries(sizeEntries)

    return (
      <>
        <style>{`
          @keyframes catalogCardIn {
            from {
              opacity: 0;
              transform: scale(0.98);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>

        <section id="catalog" className="py-8 px-4 bg-[#FAF7F2]">
          <div className="container mx-auto">
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
              {allProducts.map((product) => {
                const img = product.images[0]
                if (!img) return null

                const size = imageSizes[img] || DEFAULT_SIZE
                const aspectRatio = size.width / size.height
                const height = Math.max(200, Math.min(500, 350 / aspectRatio))

                return (
                  <Link
                    href={`/catalog/${product.id}`}
                    key={product.id}
                    className="block mb-4 break-inside-avoid"
                  >
                    <div
                      className="overflow-hidden bg-gray-200 rounded-lg h-full w-full"
                      style={{
                        height: `${height}px`,
                        animation: "catalogCardIn 0.4s ease-out both",
                      }}
                    >
                      <div className="w-full h-full cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </>
    )
  } catch (error: unknown) {
    console.error("Failed to load products for Catalog Page:", error)

    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center py-32">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#2C2416] mb-2 font-serif">Ошибка загрузки</h3>
          <p className="text-[#6B5D4F] font-sans">Не удалось загрузить список товаров.</p>
        </div>
      </div>
    )
  }
}