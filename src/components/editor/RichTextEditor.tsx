import React, { useRef, useEffect, useState } from 'react';
import { FormattingToolbar } from './FormattingToolbar';
import { ImageUploader } from '../ui/ImageUploader';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Начните писать...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showImageUploader, setShowImageUploader] = useState(false);

  // Initialize editor/Инициализация редактора
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Handle content change/Обработка изменения содержимого
  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  // Execute formatting command/Выполнение команды форматирования
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // Handle keyboard shortcuts/Обработка горячих клавиш
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+B for bold/Ctrl+B для жирного
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      executeCommand('bold');
    }
    // Ctrl+I for italic/Ctrl+I для курсива
    else if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      executeCommand('italic');
    }
    // Ctrl+U for underline/Ctrl+U для подчеркивания
    else if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      executeCommand('underline');
    }
    // Tab for indent/Tab для отступа
    else if (e.key === 'Tab') {
      e.preventDefault();
      executeCommand('indent');
    }
    // Shift+Tab for outdent/Shift+Tab для уменьшения отступа
    else if (e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      executeCommand('outdent');
    }
  };

  // Handle image insertion/Обработка вставки изображения
  const handleImageInsert = (imageData: string) => {
    const img = `<img src="${imageData}" alt="Изображение" style="max-width: 100%; height: auto; border-radius: 4px; margin: 10px 0;" />`;
    executeCommand('insertHTML', img);
  };

  // Handle paste/Обработка вставки
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Handle image paste/Обработка вставки изображения
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          handleImageInsert(result);
        };
        reader.readAsDataURL(file);
        return;
      }
    }
    
    // Handle text paste/Обработка вставки текста
    const text = e.clipboardData.getData('text/plain');
    executeCommand('insertText', text);
  };

  return (
    <div className={`border border-default rounded-lg overflow-hidden ${className}`}>
      {/* Formatting toolbar/Панель форматирования */}
      <FormattingToolbar
        onFormat={executeCommand}
        onImageUpload={() => setShowImageUploader(true)}
      />
      
      {/* Editor content/Содержимое редактора */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 focus:outline-none bg-background"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: 'var(--color-text-primary)'
        }}
        suppressContentEditableWarning={true}
      />
      
      {/* Image uploader modal/Модальное окно загрузки изображений */}
      <ImageUploader
        isOpen={showImageUploader}
        onClose={() => setShowImageUploader(false)}
        onImageInsert={handleImageInsert}
      />
    </div>
  );
};
