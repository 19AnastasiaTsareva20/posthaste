import React, { useState, useRef, useCallback } from 'react';
import { Card, Button } from './';

interface ImageUploaderProps {
  onImageUpload: (imageData: { url: string; file?: File; alt?: string }) => void;
  onClose: () => void;
  maxFileSize?: number;
  acceptedFormats?: string[];
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  onClose,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Неподдерживаемый формат. Разрешены: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      const sizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      return `Файл слишком большой. Максимальный размер: ${sizeMB} МБ`;
    }
    
    return null;
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError('Ошибка при загрузке файла');
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleImageUrl = async () => {
    if (!imageUrl.trim()) {
      setError('Введите URL изображения');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const img = new Image();
      img.onload = () => {
        setPreview(imageUrl);
        setUploading(false);
      };
      img.onerror = () => {
        setError('Не удалось загрузить изображение по указанному URL');
        setUploading(false);
      };
      img.src = imageUrl;
    } catch (error) {
      setError('Ошибка при загрузке изображения');
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (uploadMethod === 'url' && imageUrl) {
      onImageUpload({
        url: imageUrl,
        alt: altText
      });
    } else if (preview && fileInputRef.current?.files?.[0]) {
      onImageUpload({
        url: preview,
        file: fileInputRef.current.files[0],
        alt: altText
      });
    }
  };

  const handleReset = () => {
    setPreview(null);
    setImageUrl('');
    setAltText('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in ${className}`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
              <svg className="h-6 w-6 text-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Добавить изображение
            </h2>
            <Button size="sm" variant="ghost" onClick={onClose} className="p-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          <div className="flex bg-neutral-100 dark:bg-dark-surface rounded-lg p-1">
            <button
              onClick={() => setUploadMethod('file')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                uploadMethod === 'file'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              Загрузить файл
            </button>
            <button
              onClick={() => setUploadMethod('url')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                uploadMethod === 'url'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              По ссылке
            </button>
          </div>

          {uploadMethod === 'file' && (
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-border dark:border-dark-border hover:border-primary/50 hover:bg-primary/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {uploading ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  <p className="text-text-primary dark:text-dark-text-primary font-medium">
                    Обработка изображения...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="h-8 w-8 text-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-text-primary dark:text-dark-text-primary">
                      Перетащите изображение сюда
                    </p>
                    <p className="text-text-secondary dark:text-dark-text-secondary">
                      или <span className="text-primary dark:text-night-primary font-medium">нажмите для выбора</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {uploadMethod === 'url' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                URL изображения:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="input flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleImageUrl()}
                />
                <Button
                  variant="primary"
                  onClick={handleImageUrl}
                  disabled={!imageUrl.trim() || uploading}
                >
                  {uploading ? 'Загрузка...' : 'Загрузить'}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex items-center gap-2 text-danger">
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {preview && (
            <div className="space-y-4">
              <div className="border border-border dark:border-dark-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-text-primary dark:text-dark-text-primary">
                    Превью изображения:
                  </h3>
                  <Button size="sm" variant="ghost" onClick={handleReset}>
                    Удалить
                  </Button>
                </div>
                
                <div className="relative bg-neutral-50 dark:bg-dark-surface rounded-lg overflow-hidden">
                  <img
                    src={preview}
                    alt="Превью"
                    className="max-w-full max-h-64 mx-auto object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                  Описание изображения:
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Краткое описание изображения"
                  className="input w-full"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border dark:border-dark-border">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!preview}
              className="flex-1"
            >
              Добавить изображение
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
