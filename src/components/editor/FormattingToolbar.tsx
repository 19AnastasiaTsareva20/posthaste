import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Button, Card } from './';

interface FormattingToolbarProps {
  editor: Editor | null;
  className?: string;
  compact?: boolean;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  editor,
  className = "",
  compact = false
}) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!editor) {
    return null;
  }

  // Цвета для выделения / Highlight colors
  const highlightColors = [
    '#FBBF24', '#F59E0B', '#EF4444', '#10B981',
    '#3B82F6', '#8B5CF6', '#F97316', '#EC4899'
  ];

  // Добавить ссылку / Add link
  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkUrl('');
    setShowLinkDialog(false);
  };

  // Добавить изображение / Add image
  const addImage = () => {
    const url = window.prompt('URL изображения:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <Card className={`sticky top-0 z-10 ${className}`} hover={false}>
      <div className={`flex flex-wrap items-center gap-1 ${compact ? 'p-2' : 'p-3'}`}>
        {/* Заголовки / Headings */}
        <div className="flex items-center gap-1 mr-2">
          <select
            onChange={(e) => {
              const level = parseInt(e.target.value);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: level as any }).run();
              }
            }}
            value={
              editor.isActive('heading', { level: 1 }) ? 1 :
              editor.isActive('heading', { level: 2 }) ? 2 :
              editor.isActive('heading', { level: 3 }) ? 3 :
              editor.isActive('heading', { level: 4 }) ? 4 : 0
            }
            className="text-sm border border-border dark:border-dark-border rounded-md px-2 py-1 bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary/50"
          >
            <option value={0}>Обычный текст</option>
            <option value={1}>Заголовок 1</option>
            <option value={2}>Заголовок 2</option>
            <option value={3}>Заголовок 3</option>
            <option value={4}>Заголовок 4</option>
          </select>
        </div>

        {/* Разделитель / Separator */}
        <div className="w-px h-6 bg-border dark:bg-dark-border mx-1" />

        {/* Форматирование текста / Text formatting */}
        <div className="flex items-center gap-1">
          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive('bold') ? "primary" : "ghost"}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="Жирный (Ctrl+B)"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
            </svg>
          </Button>

          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive('italic') ? "primary" : "ghost"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="Курсив (Ctrl+I)"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
            </svg>
          </Button>

          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive('underline') ? "primary" : "ghost"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="Подчеркнутый (Ctrl+U)"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 21h14v-2H5v2zm7-4c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6z" />
            </svg>
          </Button>

          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive('strike') ? "primary" : "ghost"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="Зачеркнутый"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 9v2h14V9H5zm5.5 4c0 .55.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1zm0-5c0-.55.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1-.45-1-1z" />
            </svg>
          </Button>
        </div>

        {/* Разделитель / Separator */}
        <div className="w-px h-6 bg-border dark:bg-dark-border mx-1" />

        {/* Выравнивание / Alignment */}
        <div className="flex items-center gap-1">
          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive({ textAlign: 'left' }) ? "primary" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="По левому краю"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
            </svg>
          </Button>

          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive({ textAlign: 'center' }) ? "primary" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="По центру"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h18v2H3V3zm4 4h10v2H7V7zm-4 4h18v2H3v-2zm4 4h10v2H7v-2zm-4 4h18v2H3v-2z" />
            </svg>
          </Button>

          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive({ textAlign: 'right' }) ? "primary" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="По правому краю"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
            </svg>
          </Button>
        </div>

        {/* Разделитель / Separator */}
        <div className="w-px h-6 bg-border dark:bg-dark-border mx-1" />

        {/* Списки / Lists */}
        <div className="flex items-center gap-1">
          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive('bulletList') ? "primary" : "ghost"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="Маркированный список"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
            </svg>
          </Button>

          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive('orderedList') ? "primary" : "ghost"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="Нумерованный список"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
            </svg>
          </Button>
        </div>

        {/* Разделитель / Separator */}
        <div className="w-px h-6 bg-border dark:bg-dark-border mx-1" />

        {/* Дополнительные инструменты / Additional tools */}
        <div className="flex items-center gap-1">
          {/* Выделение / Highlight */}
          <div className="relative">
            <Button
              size={compact ? "sm" : "default"}
              variant={editor.isActive('highlight') ? "primary" : "ghost"}
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
              title="Выделить цветом"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 20a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2M7 13h10v-2H7v2Z" />
              </svg>
            </Button>

            {/* Палитра цветов / Color palette */}
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-large z-20 animate-scale-in">
                <div className="grid grid-cols-4 gap-1 w-32">
                  {highlightColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color }).run();
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded border-2 border-white hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setShowColorPicker(false);
                  }}
                  className="w-full mt-2 px-2 py-1 text-xs text-danger hover:bg-danger/10 rounded transition-colors"
                >
                  Убрать выделение
                </button>
              </div>
            )}
          </div>

          {/* Ссылка / Link */}
          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive('link') ? "primary" : "ghost"}
            onClick={() => setShowLinkDialog(true)}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="Добавить ссылку (Ctrl+K)"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </Button>

          {/* Изображение / Image */}
          <Button
            size={compact ? "sm" : "default"}
            variant="ghost"
            onClick={addImage}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="Добавить изображение"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Button>

          {/* Код / Code */}
          <Button
            size={compact ? "sm" : "default"}
            variant={editor.isActive('code') ? "primary" : "ghost"}
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
            title="Код"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Диалог ссылки / Link dialog */}
      {showLinkDialog && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-large z-20 animate-scale-in">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                URL ссылки:
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="input w-full"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && setLink()}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={setLink}
                disabled={!linkUrl.trim()}
                className="flex-1"
              >
                {editor.isActive('link') ? 'Обновить' : 'Добавить'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                }}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
