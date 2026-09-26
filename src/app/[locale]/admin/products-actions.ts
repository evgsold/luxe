// src/app/admin/products-actions.ts
'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { Product } from '@/types/data';

const FILE_PATH = path.join(process.cwd(), 'public', 'products.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Экшен загрузки одного файла картинки
export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return { error: 'Файл не выбран' };
    }

    // Проверяем, что это действительно изображение
    if (!file.type.startsWith('image/')) {
      return { error: 'Можно загружать только изображения (JPEG, PNG, WebP и т.д.)' };
    }

    // Создаем папку public/uploads, если её ещё нет
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    // Генерируем уникальное и аккуратное имя файла
    const ext = path.extname(file.name) || '.jpg';
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const fileName = `image_${timestamp}_${randomSuffix}${ext}`;
    
    const filePath = path.join(UPLOADS_DIR, fileName);

    // Записываем файл на диск
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Возвращаем публичный путь
    return { url: `/uploads/${fileName}` };
  } catch (error) {
    console.error('Ошибка сохранения файла:', error);
    return { error: 'Не удалось сохранить файл на сервере' };
  }
}
// Получение всех товаров
export async function getProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Если файла еще нет, возвращаем пустой массив
    return [];
  }
}

// Создание или обновление товара
export async function saveProduct(productData: Omit<Product, 'id'>, id?: number) {
  const products = await getProducts();

  if (id !== undefined && id !== null) {
    // Редактирование существующего
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index] = { ...productData, id };
    }
  } else {
    // Добавление нового (генерируем id: max + 1)
    const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
    products.push({ ...productData, id: maxId + 1 });
  }

  // Записываем красиво отформатированный JSON
  await fs.writeFile(FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');

  // Очищаем кэш сайта, чтобы изменения сразу появились
  revalidatePath('/');
  revalidatePath('/[locale]/admin', 'page');

  return { success: true };
}

// Удаление товара
export async function deleteProduct(id: number) {
  const products = await getProducts();
  const updatedProducts = products.filter((p) => p.id !== id);

  await fs.writeFile(FILE_PATH, JSON.stringify(updatedProducts, null, 2), 'utf-8');

  revalidatePath('/');
  revalidatePath('/[locale]/admin', 'page');
  return { success: true };
}

export async function toggleProductStock(id: number) {
    const products = await getProducts();
    const product = products.find((p) => p.id === id);
    if (!product) return { error: 'Товар не найден' };
  
    product.inStock = !product.inStock;
    await fs.writeFile(FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
  
    revalidatePath('/');
    revalidatePath('/[locale]/admin', 'page');
    return { success: true, inStock: product.inStock };
  }
  
  // Быстрое дублирование товара
  export async function duplicateProduct(id: number) {
    const products = await getProducts();
    const source = products.find((p) => p.id === id);
    if (!source) return { error: 'Товар не найден' };
  
    const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
    const cloned: Product = {
      ...source,
      id: maxId + 1,
      name: `${source.name} (Копия)`,
    };
  
    products.push(cloned);
    await fs.writeFile(FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
  
    revalidatePath('/');
    revalidatePath('/[locale]/admin', 'page');
    return { success: true, newProduct: cloned };
  }