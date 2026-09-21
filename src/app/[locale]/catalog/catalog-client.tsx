"use client"

import { motion, Variants } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link'; // 1. Импортируем Link

// --- Типы данных (остаются без изменений) ---
interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  category: string;
  inStock: boolean;
  images: string[];
  features: string[];
  specifications: {
    brand: string;
    collection: string;
    style: string;
    room: string;
    warranty: string;
    country: string;
  };
}

interface CatalogProps {
  allProducts: Product[];
}

interface ImageSize {
  width: number;
  height: number;
}

// --- Варианты анимации для Framer Motion ---
const imageVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};


export default function CatalogClient({ allProducts }: CatalogProps) {
  const [imageSizes, setImageSizes] = useState<Record<string, ImageSize>>({});

  const loadImageSizes = useCallback(() => {
    const sizes: Record<string, ImageSize> = {};
    const allImages = allProducts.flatMap(p => p.images.slice(0, 1)); // Берем только первые изображения
    let loadedCount = 0;
    
    if (allImages.length === 0) return;

    allImages.forEach(img => {
      if (imageSizes[img]) {
        sizes[img] = imageSizes[img];
        loadedCount++;
        return;
      }
      
      const imgObj = new Image();
      imgObj.src = img;
      
      imgObj.onload = () => {
        sizes[img] = { width: imgObj.width, height: imgObj.height };
        loadedCount++;
        if (loadedCount === allImages.length) {
          setImageSizes(prev => ({ ...prev, ...sizes }));
        }
      };
      
      imgObj.onerror = () => {
        sizes[img] = { width: 800, height: 600 };
        loadedCount++;
        if (loadedCount === allImages.length) {
          setImageSizes(prev => ({ ...prev, ...sizes }));
        }
      };
    });
  }, [allProducts, imageSizes]);

  useEffect(() => {
    loadImageSizes();
    
    const handleResize = () => {
      setImageSizes({});
      loadImageSizes();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loadImageSizes]);

  return (
    <section id="catalog" className="py-8 px-4 bg-[#FAF7F2]">
      <div className="container mx-auto">
        
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {allProducts.map((product) => {
            // Используем только первое изображение для каждой карточки
            const img = product.images[0];
            if (!img) return null; // Пропускаем товары без изображений

            const isSizeLoaded = !!imageSizes[img];
            const size = imageSizes[img] || { width: 800, height: 600 };
            const aspectRatio = size.width / size.height;
            const height = Math.max(200, Math.min(500, 350 / aspectRatio));
            
            return (
              // 2. Оборачиваем всю карточку в Link
              <Link 
                href={`/catalog/${product.id}`} 
                key={product.id} 
                passHref
                className="block mb-4 break-inside-avoid" // Стили для позиционирования ссылки
              >
                <motion.div
                  className="overflow-hidden bg-gray-200 rounded-lg h-full w-full"
                  style={{ height: `${height}px` }}
                  variants={imageVariants as Variants}
                  initial="hidden"
                  animate={isSizeLoaded ? "visible" : "hidden"}
                >
                  <div
                    className="w-full h-full cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
                  >
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}