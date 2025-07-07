import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url?: string;
}

interface FileUploadProps {
  onFileUpload?: (files: UploadedFile[]) => void;
  maxSizeMB?: number; // Максимальный размер в MB/Max size in MB
  allowedTypes?: string[];
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  maxSizeMB = 50, // 50MB по умолчанию/50MB default
  allowedTypes = [
    '.doc', '.docx', // Word
    '.pdf', // PDF
    '.xls', '.xlsx', // Excel
    '.ppt', '.pptx', // PowerPoint
    '.txt', '.rtf', // Текстовые/Text
    '.jpg', '.jpeg', '.png', '.gif', '.webp' // Изображения/Images
  ],
  multiple = true
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загрузка файлов из localStorage/Load files from localStorage
  React.useEffect(() => {
    const savedFiles = localStorage.getItem('posthaste-uploaded-files');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, []);

  // Сохранение файлов в localStorage/Save files to localStorage
  React.useEffect(() => {
    localStorage.setItem('posthaste-uploaded-files', JSON.stringify(uploadedFiles));
    onFileUpload?.(uploadedFiles);
  }, [uploadedFiles, onFileUpload]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'doc':
      case 'docx':
        return '📄';
      case 'pdf':
        return '📕';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'txt':
      case 'rtf':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const validateFile = (file: File): string | null => {
    // Проверка размера/Size check
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `Файл слишком большой. Максимум ${maxSizeMB}MB`;
    }

    // Проверка типа файла/File type check
    const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
    if (!allowedTypes.includes(fileExtension)) {
      return `Неподдерживаемый тип файла. Разрешены: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFiles = (files: FileList) => {
    setError(null);
    const validFiles: UploadedFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          url: URL.createObjectURL(file) // Для предварительного просмотра/For preview
        };
        validFiles.push(uploadedFile);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('; '));
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">
        📎 Загрузка файлов
      </h3>

      {/* Зона загрузки/Upload zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border dark:border-dark-border hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-text-primary dark:text-dark-text-primary font-medium">
              Перетащите файлы сюда или
            </p>
            <Button onClick={openFileSelector} className="mt-2">
              Выберите файлы
            </Button>
          </div>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
            Поддерживаемые форматы: {allowedTypes.join(', ')}
          </p>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
            Максимальный размер: {maxSizeMB}MB
          </p>
        </div>
      </div>

      {/* Скрытый input для выбора файлов/Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Ошибки/Errors */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Список загруженных файлов/Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-text-primary dark:text-dark-text-primary mb-3">
            Загруженные файлы ({uploadedFiles.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getFileIcon(file.name)}</span>
                  <div>
                    <p className="font-medium text-text-primary dark:text-dark-text-primary text-sm">
                      {file.name}
                    </p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-danger hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                  title="Удалить файл"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
