// src/app/[locale]/admin/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Product } from '@/types/data';
import { getProducts, deleteProduct, toggleProductStock, duplicateProduct } from './products-actions';
import ProductForm from './ProductForm';
import { logoutAction } from './actions';

type ViewMode = 'table' | 'grid';
type StockFilter = 'all' | 'inStock' | 'outOfStock';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Фильтры и поиск
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortBy, setSortBy] = useState<'id-desc' | 'price-asc' | 'price-desc' | 'name'>('id-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Модалка/Шторка редактирования
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Всплывающее уведомление (Toast)
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Категории для фильтра
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  // Статистика
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock).length;
    const outOfStock = total - inStock;
    return { total, inStock, outOfStock, categoriesCount: categories.length };
  }, [products, categories]);

  // Фильтрация и сортировка
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toString().includes(search);

        const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesStock =
          stockFilter === 'all' ||
          (stockFilter === 'inStock' && p.inStock) ||
          (stockFilter === 'outOfStock' && !p.inStock);

        return matchesSearch && matchesCat && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'id-desc') return b.id - a.id;
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, search, selectedCategory, stockFilter, sortBy]);

  // Быстрый тумблер наличия прямо из списка
  const handleToggleStock = async (id: number) => {
    const res = await toggleProductStock(id);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, inStock: res.inStock! } : p))
      );
      showToast('Статус наличия обновлен');
    }
  };

  // Дублирование
  const handleDuplicate = async (id: number) => {
    const res = await duplicateProduct(id);
    if (res.success && res.newProduct) {
      setProducts((prev) => [...prev, res.newProduct!]);
      showToast('Товар успешно продублирован');
    }
  };

  // Удаление
  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Удалить товар "${name}"?`)) {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Товар удален');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {toast}
        </div>
      )}

      {/* Верхняя навигация */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md">
              ⚡
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base leading-tight block">Админ-панель</span>
              <span className="text-xs text-slate-400 font-medium">Каталог товаров (JSON)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
            >
              <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Добавить товар</span>
            </button>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Выйти из аккаунта"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H9" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Карточки аналитики и остатков */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Всего товаров</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{stats.total}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">в каталоге</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">В наличии</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-emerald-600">{stats.inStock}</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium">готовы к продаже</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Нет на складе</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-rose-600">{stats.outOfStock}</span>
              <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-medium">требуют пополнения</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Категорий</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-indigo-600">{stats.categoriesCount}</span>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">разных групп</span>
            </div>
          </div>
        </div>

        {/* Панель фильтров и управления */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Поиск */}
            <div className="relative flex-1">
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Поиск по названию, ID или категории..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                  ✕
                </button>
              )}
            </div>

            {/* Фильтры и переключатели */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Фильтр по наличию */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Все статусы</option>
                <option value="inStock">Только в наличии</option>
                <option value="outOfStock">Только не в наличии</option>
              </select>

              {/* Сортировка */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="id-desc">Сначала новые</option>
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="name">По алфавиту</option>
              </select>

              {/* Переключатель Таблица / Карточки */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('table')}
                  title="Вид: Таблица"
                  className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'table' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Вид: Сетка"
                  className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'grid' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Табы категорий */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Все категории ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Контентная часть */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-3"></div>
            <p className="text-slate-500 font-medium text-sm">Загружаем список товаров...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-300">
            <p className="text-slate-500 text-sm font-medium mb-3">По вашему запросу товары не найдены</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setStockFilter('all');
              }}
              className="text-indigo-600 font-semibold text-xs hover:underline"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* ================= ТАБЛИЧНЫЙ ВИД ================= */
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-14">Фото</th>
                    <th className="py-3.5 px-4">Название и ID</th>
                    <th className="py-3.5 px-4">Категория</th>
                    <th className="py-3.5 px-4">Цена</th>
                    <th className="py-3.5 px-4">Наличие (в 1 клик)</th>
                    <th className="py-3.5 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Фото */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border overflow-hidden shrink-0">
                          {p.images[0] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Нет</div>
                          )}
                        </div>
                      </td>

                      {/* Имя */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">#{p.id}</div>
                      </td>

                      {/* Категория */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                          {p.category}
                        </span>
                      </td>

                      {/* Цена */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.price} ₽</div>
                        {p.oldPrice && (
                          <div className="text-xs text-slate-400 line-through">{p.oldPrice} ₽</div>
                        )}
                      </td>

                      {/* Тумблер наличия прямо в таблице */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(p.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                            p.inStock
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {p.inStock ? 'В наличии' : 'Нет на складе'}
                        </button>
                      </td>

                      {/* Действия */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Редактировать"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDuplicate(p.id)}
                            title="Дублировать товар"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Удалить"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ================= ВИД СЕТКОЙ (КАРТОЧКИ) ================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Обложка */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {p.images[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">Нет фото</div>
                    )}
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      #{p.id}
                    </span>
                    <button
                      onClick={() => handleToggleStock(p.id)}
                      className={`absolute top-2.5 right-2.5 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-sm transition ${
                        p.inStock ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {p.inStock ? 'В наличии' : 'Нет на складе'}
                    </button>
                  </div>

                  {/* Инфо */}
                  <div className="p-4 space-y-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{p.name}</h3>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xl font-extrabold text-slate-900">{p.price} ₽</span>
                      {p.oldPrice && (
                        <span className="text-xs text-slate-400 line-through">{p.oldPrice} ₽</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Действия */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => openEditModal(p)}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDuplicate(p.id)}
                    title="Дублировать"
                    className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-white transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    title="Удалить"
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= БОКОВАЯ ШТОРКА (DRAWER) ДЛЯ ФОРМЫ ================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Затемнение фона */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-3xl bg-white shadow-2xl overflow-y-auto">
              <div className="p-6">
                <ProductForm
                  initialProduct={editingProduct}
                  onSuccess={() => {
                    setIsDrawerOpen(false);
                    setEditingProduct(null);
                    loadData();
                    showToast('Товар успешно сохранен!');
                  }}
                  onCancel={() => {
                    setIsDrawerOpen(false);
                    setEditingProduct(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}