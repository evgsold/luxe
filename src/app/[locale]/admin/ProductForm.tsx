'use client';

import { useState } from 'react';
import { Product } from '@/types/data';
import { saveProduct } from './products-actions';
import ImageUploader from './ImageUploader';

interface ProductFormProps {
  initialProduct?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ initialProduct, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);

  // 1. Основные поля
  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState(initialProduct?.category || 'decor');
  const [price, setPrice] = useState<number | string>(initialProduct?.price ?? '');
  const [oldPrice, setOldPrice] = useState<number | string>(initialProduct?.oldPrice ?? '');
  const [inStock, setInStock] = useState<boolean>(initialProduct?.inStock ?? true);
  const [description, setDescription] = useState(initialProduct?.description || '');

  // 2. Изображения (массив URL-строк)
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);

  // 3. Особенности (features)
  const [features, setFeatures] = useState<string[]>(
    initialProduct?.features?.length ? initialProduct.features : ['']
  );

  // 4. Спецификации (согласно вашему интерфейсу)
  const [specs, setSpecs] = useState({
    brand: initialProduct?.specifications?.brand || '',
    collection: initialProduct?.specifications?.collection || '',
    style: initialProduct?.specifications?.style || '',
    room: initialProduct?.specifications?.room || '',
    warranty: initialProduct?.specifications?.warranty || '',
    country: initialProduct?.specifications?.country || '',
  });

  // --- Хэндлеры для динамического списка Features ---
  const handleAddFeature = () => setFeatures([...features, '']);
  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };
  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // --- Отправка формы ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return alert('Укажите название товара');
    if (!price || Number(price) <= 0) return alert('Укажите корректную цену');
    if (images.length === 0) {
      if (!confirm('Вы не добавили ни одного фото. Все равно сохранить?')) return;
    }

    setLoading(true);

    try {
      // Формируем чистый объект спецификаций без пустых строк
      const cleanSpecifications = Object.fromEntries(
        Object.entries(specs).filter(([_, v]) => v.trim() !== '')
      );

      // Формируем полезную нагрузку
      const productPayload: Omit<Product, 'id'> = {
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        ...(oldPrice && Number(oldPrice) > 0 ? { oldPrice: Number(oldPrice) } : {}),
        inStock,
        description: description.trim(),
        images: images.filter((img) => img.trim() !== ''),
        features: features.map((f) => f.trim()).filter(Boolean),
        specifications: cleanSpecifications,
      };

      await saveProduct(productPayload, initialProduct?.id);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Ошибка при сохранении товара на сервере');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border space-y-8 max-w-4xl mx-auto">
      {/* Заголовок формы */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {initialProduct ? `Редактирование: ${initialProduct.name}` : 'Добавление нового товара'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {initialProduct ? `ID товара: #${initialProduct.id}` : 'Товар будет добавлен в базу данных products.json'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-1 leading-none"
        >
          ✕
        </button>
      </div>

      {/* 1. Блок: Базовая информация */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">1. Основная информация</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Название товара <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: Ваза 'Баскет'"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Категория <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="decor, lighting, furniture..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Статус наличия</label>
            <div className="flex items-center h-[46px]">
              <label className="inline-flex items-center cursor-pointer gap-3">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm font-semibold ${inStock ? 'text-green-700' : 'text-gray-500'}`}>
                  {inStock ? 'В наличии (inStock)' : 'Нет в наличии'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Текущая цена (₽) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              placeholder="120"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Старая цена / Зачеркнутая (₽) <span className="text-xs font-normal text-gray-400">(опционально)</span>
            </label>
            <input
              type="number"
              min="0"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              placeholder="150"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Описание</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Сложная плетеная геометрия с объемным рельефом..."
          />
        </div>
      </div>

      {/* 2. Блок: Фотографии (с использованием ImageUploader) */}
      <div className="border-t pt-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">2. Фотографии товара</h3>
        <ImageUploader images={images} onChange={setImages} disabled={loading} />
      </div>

      {/* 3. Блок: Особенности (Features) */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">3. Особенности (Features)</h3>
            <p className="text-xs text-gray-400">Пункты списка, выводящиеся буллетами в карточке</p>
          </div>
          <button
            type="button"
            onClick={handleAddFeature}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3 py-1.5 rounded-lg transition"
          >
            + Добавить строку
          </button>
        </div>

        <div className="space-y-2">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-5 text-right">{idx + 1}.</span>
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                placeholder="Например: Материал: Экологичный PLA-полимер"
                className="flex-1 border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {features.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition font-bold"
                  title="Удалить"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Блок: Спецификации (Specifications) */}
      <div className="border-t pt-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">4. Характеристики (Specifications)</h3>
          <p className="text-xs text-gray-400">Все поля опциональны, пустые строки не будут сохранены в JSON</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Бренд (brand)</label>
            <input
              type="text"
              value={specs.brand}
              onChange={(e) => setSpecs({ ...specs, brand: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3d fabriq"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Коллекция (collection)</label>
            <input
              type="text"
              value={specs.collection}
              onChange={(e) => setSpecs({ ...specs, collection: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Organic Mesh"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Стиль (style)</label>
            <input
              type="text"
              value={specs.style}
              onChange={(e) => setSpecs({ ...specs, style: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Минимализм, Лофт"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Комната (room)</label>
            <input
              type="text"
              value={specs.room}
              onChange={(e) => setSpecs({ ...specs, room: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Гостиная, Кабинет"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Гарантия (warranty)</label>
            <input
              type="text"
              value={specs.warranty}
              onChange={(e) => setSpecs({ ...specs, warranty: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12 месяцев"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Страна производства (country)</label>
            <input
              type="text"
              value={specs.country}
              onChange={(e) => setSpecs({ ...specs, country: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Россия"
            />
          </div>
        </div>
      </div>

      {/* Панель кнопок */}
      <div className="flex justify-end gap-3 pt-6 border-t items-center">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition disabled:opacity-50"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : initialProduct ? 'Сохранить изменения' : 'Создать товар'}
        </button>
      </div>
    </form>
  );
}