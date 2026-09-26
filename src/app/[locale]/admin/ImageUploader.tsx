// src/components/admin/ImageUploader.tsx
'use client';

import { useState, useRef, useEffect, DragEvent, ClipboardEvent } from 'react';
import { uploadImage } from './products-actions';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

export default function ImageUploader({ images, onChange, disabled }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [manualUrl, setManualUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Обработка загрузки пачки файлов
  const processFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));

    if (validFiles.length === 0) {
      alert('Пожалуйста, выберите только файлы изображений (JPG, PNG, WebP).');
      return;
    }

    setUploading(true);
    const newUploadedUrls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress(`Загрузка ${i + 1} из ${validFiles.length}...`);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const result = await uploadImage(formData);
        if (result.url) {
          newUploadedUrls.push(result.url);
        } else if (result.error) {
          alert(`Ошибка с файлом ${file.name}: ${result.error}`);
        }
      } catch (e) {
        alert(`Не удалось загрузить ${file.name}`);
      }
    }

    onChange([...images, ...newUploadedUrls]);
    setUploading(false);
    setUploadProgress('');
  };

  // Drag & Drop события
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !uploading) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Вставка через буфер обмена (Ctrl + V / Cmd + V)
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    if (disabled || uploading) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      processFiles(files);
    }
  };

  // Добавление по прямой ссылке
  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    onChange([...images, manualUrl.trim()]);
    setManualUrl('');
    setShowUrlInput(false);
  };

  // Удаление
  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // Сделать главной (перенести на индекс 0)
  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onChange([item, ...filtered]);
  };

  // Перемещение влево/вправо
  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Дропзона для файлов и Ctrl+V */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all text-center cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 bg-white'
        } ${disabled || uploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-sm">
            {uploading ? '⏳' : '📁'}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">
              {uploading
                ? uploadProgress
                : isDragging
                ? 'Отпустите файлы для загрузки'
                : 'Нажмите для выбора или перетащите фото сюда'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Поддерживается вставка из буфера обмена (нажмите <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-[11px] font-mono">Ctrl+V</kbd>)
            </p>
          </div>
        </div>
      </div>

      {/* Переключатель вставки по ссылке */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500 font-medium">
          Загружено фото: <strong className="text-gray-800">{images.length}</strong>
        </span>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          {showUrlInput ? '✕ Скрыть добавление по ссылке' : '+ Добавить по прямой ссылке (URL)'}
        </button>
      </div>

      {/* Поле добавления ссылки */}
      {showUrlInput && (
        <div className="flex gap-2 p-2 bg-gray-50 border rounded-xl">
          <input
            type="text"
            placeholder="https://example.com/image.jpg или /uploads/image.jpg"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="px-4 py-1.5 bg-gray-800 hover:bg-black text-white text-xs font-semibold rounded-lg transition"
          >
            Добавить
          </button>
        </div>
      )}

      {/* Сетка загруженных изображений с управлением */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
          {images.map((imgUrl, index) => {
            const isCover = index === 0;

            return (
              <div
                key={`${imgUrl}-${index}`}
                className={`relative group bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col transition hover:shadow-md ${
                  isCover ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Картинка */}
                <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Product photo ${index + 1}`}
                    className="w-full h-full object-cover transition group-hover:scale-105 duration-200"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute(
                        'src',
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23aaa" font-size="12">Ошибка</text></svg>'
                      );
                    }}
                  />

                  {/* Бейдж обложки */}
                  {isCover && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                      Обложка
                    </span>
                  )}

                  {/* Кнопка удаления */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    title="Удалить фотографию"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-red-600 hover:text-white text-gray-600 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow transition backdrop-blur-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Панель действий под картинкой */}
                <div className="p-2 bg-gray-50 flex items-center justify-between text-xs border-t">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'left')}
                      title="Переместить влево"
                      className="px-2 py-1 bg-white border rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => handleMove(index, 'right')}
                      title="Переместить вправо"
                      className="px-2 py-1 bg-white border rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>

                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => handleMakeCover(index)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Сделать главной
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}