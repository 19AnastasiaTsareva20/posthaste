import React, { useRef, useState } from 'react';
import { Button } from './';

interface ImageUploaderProps {
  onImageInsert: (imageData: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageInsert,
  isOpen,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  // Handle file upload/Обработка загрузки файла
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit/Ограничение 5МБ
      alert('Размер файла не должен превышать 5МБ');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageInsert(result);
      setUploading(false);
      onClose();
    };
    
    reader.onerror = () => {
      alert('Ошибка при загрузке файла');
      setUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  // Handle URL insert/Обработка вставки URL
  const handleUrlInsert = () => {
    if (urlInput.trim()) {
      onImageInsert(urlInput.trim());
      setUrlInput('');
      onClose();
    }
  };

  // Handle drag and drop/Обработка перетаскивания
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-text-primary">
            Вставить изображение
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* File upload area/Область загрузки файла */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Загрузить файл
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragOver 
                  ? 'border-primary bg-primary/10' 
                  : 'border-default hover:border-primary'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="text-text-muted">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  Загрузка...
                </div>
              ) : (
                <div className="text-text-muted">
                  <div className="text-2xl mb-2">📁</div>
                  <p>Нажмите или перетащите изображение</p>
                  <p className="text-xs mt-1">JPG, PNG, GIF до 5МБ</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
              className="hidden"
            />
          </div>

          {/* URL input/Ввод URL */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Или вставьте ссылку на изображение
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleUrlInsert()}
              />
              <Button
                onClick={handleUrlInsert}
                disabled={!urlInput.trim()}
              >
                Вставить
              </Button>
            </div>
          </div>
        </div>

        {/* Actions/Действия */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};
