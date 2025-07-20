import React, { useState } from 'react';
import { Button } from './Button';
import { showNotification } from './NotificationSystem';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived?: boolean;
}

interface ExportManagerProps {
  note?: Note;
  notes?: Note[];
  onClose?: () => void;
}

type ExportFormat = 'markdown' | 'html' | 'text' | 'json';

export const ExportManager: React.FC<ExportManagerProps> = ({ note, notes, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');
  const [isExporting, setIsExporting] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);

  // Получение настроек экспорта
  const getExportSettings = () => {
    try {
      const settings = localStorage.getItem('notesflow-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        return parsed.exportFormat || 'markdown';
      }
    } catch (error) {
      console.error('Error loading export settings:', error);
    }
    return 'markdown';
  };

  // Конвертация HTML в Markdown
  const htmlToMarkdown = (html: string): string => {
    let markdown = html;
    
    // Заголовки
    markdown = markdown.replace(/<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (match, level, attrs, content) => {
      const hashes = '#'.repeat(parseInt(level));
      return `${hashes} ${content}\n\n`;
    });
    
    // Жирный текст
    markdown = markdown.replace(/<(strong|b)([^>]*)>(.*?)<\/(strong|b)>/gi, '**$3**');
    
    // Курсив
    markdown = markdown.replace(/<(em|i)([^>]*)>(.*?)<\/(em|i)>/gi, '*$3*');
    
    // Ссылки
    markdown = markdown.replace(/<a([^>]*?)href="([^"]*)"([^>]*?)>(.*?)<\/a>/gi, '[$4]($2)');
    
    // Списки
    markdown = markdown.replace(/<ul([^>]*)>(.*?)<\/ul>/gis, (match, attrs, content) => {
      const items = content.replace(/<li([^>]*)>(.*?)<\/li>/gi, '- $2\n');
      return `${items}\n`;
    });
    
    markdown = markdown.replace(/<ol([^>]*)>(.*?)<\/ol>/gis, (match, attrs, content) => {
      let counter = 1;
      const items = content.replace(/<li([^>]*)>(.*?)<\/li>/gi, () => `${counter++}. $2\n`);
      return `${items}\n`;
    });
    
    // Цитаты
    markdown = markdown.replace(/<blockquote([^>]*)>(.*?)<\/blockquote>/gis, '> $2\n\n');
    
    // Код
    markdown = markdown.replace(/<code([^>]*)>(.*?)<\/code>/gi, '`$2`');
    markdown = markdown.replace(/<pre([^>]*)><code([^>]*)>(.*?)<\/code><\/pre>/gis, '```\n$3\n```\n\n');
    
    // Изображения
    markdown = markdown.replace(/<img([^>]*?)src="([^"]*)"([^>]*?)alt="([^"]*)"([^>]*?)>/gi, '![$4]($2)');
    markdown = markdown.replace(/<img([^>]*?)src="([^"]*)"([^>]*?)>/gi, '![]($2)');
    
    // Таблицы (базовая поддержка)
    markdown = markdown.replace(/<table([^>]*)>(.*?)<\/table>/gis, (match, attrs, content) => {
      let tableMarkdown = '';
      const rows = content.match(/<tr([^>]*)>(.*?)<\/tr>/gis);
      if (rows) {
        rows.forEach((row, index) => {
          const cells = row.replace(/<tr([^>]*)>|<\/tr>/gi, '').match(/<t[hd]([^>]*)>(.*?)<\/t[hd]>/gi);
          if (cells) {
            const cellContent = cells.map(cell => cell.replace(/<t[hd]([^>]*)>|<\/t[hd]>/gi, '').trim()).join(' | ');
            tableMarkdown += `| ${cellContent} |\n`;
            if (index === 0) {
              const separator = cells.map(() => '---').join(' | ');
              tableMarkdown += `| ${separator} |\n`;
            }
          }
        });
      }
      return `${tableMarkdown}\n`;
    });
    
    // Удаление остальных HTML тегов
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
    markdown = markdown.replace(/<p([^>]*)>/gi, '');
    markdown = markdown.replace(/<\/p>/gi, '\n\n');
    markdown = markdown.replace(/<div([^>]*)>/gi, '');
    markdown = markdown.replace(/<\/div>/gi, '\n');
    markdown = markdown.replace(/<[^>]*>/g, '');
    
    // Очистка лишних переносов
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    markdown = markdown.trim();
    
    return markdown;
  };

  // Конвертация HTML в текст
  const htmlToText = (html: string): string => {
    let text = html;
    
    // Заголовки
    text = text.replace(/<h[1-6]([^>]*)>(.*?)<\/h[1-6]>/gi, '$2\n\n');
    
    // Параграфы и переносы
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n\n');
    
    // Списки
    text = text.replace(/<li([^>]*)>(.*?)<\/li>/gi, '• $2\n');
    
    // Удаление всех HTML тегов
    text = text.replace(/<[^>]*>/g, '');
    
    // Декодирование HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    
    // Очистка лишних переносов
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();
    
    return text;
  };

  // Форматирование контента для экспорта
  const formatNoteContent = (note: Note, format: ExportFormat): string => {
    const createdDate = note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt);
    const updatedDate = note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt);
    
    let content = '';
    
    switch (format) {
      case 'markdown':
        content += `# ${note.title}\n\n`;
        
        if (includeMetadata) {
          content += `**Создано:** ${createdDate.toLocaleDateString('ru-RU')}\n`;
          content += `**Обновлено:** ${updatedDate.toLocaleDateString('ru-RU')}\n`;
          if (note.isFavorite) {
            content += `**Статус:** ⭐ Избранное\n`;
          }
          content += '\n';
        }
        
        if (includeTags && note.tags.length > 0) {
          content += `**Теги:** ${note.tags.map(tag => `#${tag}`).join(', ')}\n\n`;
        }
        
        content += '---\n\n';
        content += htmlToMarkdown(note.content);
        break;
        
      case 'html':
        content += `<!DOCTYPE html>\n<html lang="ru">\n<head>\n`;
        content += `  <meta charset="UTF-8">\n`;
        content += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
        content += `  <title>${note.title}</title>\n`;
        content += `  <style>\n`;
        content += `    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }\n`;
        content += `    .metadata { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }\n`;
        content += `    .tags { margin: 10px 0; }\n`;
        content += `    .tag { background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 0.875rem; margin-right: 8px; }\n`;
        content += `    h1, h2, h3, h4, h5, h6 { color: #333; }\n`;
        content += `  </style>\n</head>\n<body>\n`;
        content += `  <h1>${note.title}</h1>\n`;
        
        if (includeMetadata) {
          content += `  <div class="metadata">\n`;
          content += `    <p><strong>Создано:</strong> ${createdDate.toLocaleDateString('ru-RU')}</p>\n`;
          content += `    <p><strong>Обновлено:</strong> ${updatedDate.toLocaleDateString('ru-RU')}</p>\n`;
          if (note.isFavorite) {
            content += `    <p><strong>Статус:</strong> ⭐ Избранное</p>\n`;
          }
          content += `  </div>\n`;
        }
        
        if (includeTags && note.tags.length > 0) {
          content += `  <div class="tags">\n`;
          content += `    <strong>Теги:</strong> `;
          content += note.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');
          content += `\n  </div>\n`;
        }
        
        content += `  <hr>\n`;
        content += `  <div class="content">\n    ${note.content}\n  </div>\n`;
        content += `</body>\n</html>`;
        break;
        
      case 'text':
        content += `${note.title}\n`;
        content += '='.repeat(note.title.length) + '\n\n';
        
        if (includeMetadata) {
          content += `Создано: ${createdDate.toLocaleDateString('ru-RU')}\n`;
          content += `Обновлено: ${updatedDate.toLocaleDateString('ru-RU')}\n`;
          if (note.isFavorite) {
            content += `Статус: ⭐ Избранное\n`;
          }
          content += '\n';
        }
        
        if (includeTags && note.tags.length > 0) {
          content += `Теги: ${note.tags.map(tag => `#${tag}`).join(', ')}\n\n`;
        }
        
        content += '-'.repeat(50) + '\n\n';
        content += htmlToText(note.content);
        break;
        
      case 'json':
        const exportData = {
          id: note.id,
          title: note.title,
          content: note.content,
          tags: note.tags,
          isFavorite: note.isFavorite,
          createdAt: createdDate.toISOString(),
          updatedAt: updatedDate.toISOString(),
          exportedAt: new Date().toISOString(),
          format: 'NotesFlow JSON Export v1.0'
        };
        content = JSON.stringify(exportData, null, 2);
        break;
    }
    
    return content;
  };

  // Экспорт одной заметки
  const exportSingleNote = async () => {
    if (!note) return;
    
    setIsExporting(true);
    try {
      const content = formatNoteContent(note, selectedFormat);
      const extensions = { markdown: 'md', html: 'html', text: 'txt', json: 'json' };
      const extension = extensions[selectedFormat];
      
      const blob = new Blob([content], { 
        type: selectedFormat === 'html' ? 'text/html' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification.success('Заметка экспортирована');
      onClose?.();
    } catch (error) {
      console.error('Error exporting note:', error);
      showNotification.error('Ошибка при экспорте заметки');
    } finally {
      setIsExporting(false);
    }
  };

  // Экспорт нескольких заметок
  const exportMultipleNotes = async () => {
    if (!notes || notes.length === 0) return;
    
    setIsExporting(true);
    try {
      let content = '';
      
      if (selectedFormat === 'json') {
        const exportData = {
          notes: notes.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            tags: note.tags,
            isFavorite: note.isFavorite,
            createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
            updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt
          })),
          exportedAt: new Date().toISOString(),
          totalNotes: notes.length,
          format: 'NotesFlow JSON Export v1.0'
        };
        content = JSON.stringify(exportData, null, 2);
      } else {
        notes.forEach((note, index) => {
          if (index > 0) {
            content += selectedFormat === 'html' ? '\n<hr style="margin: 40px 0;">\n' : '\n\n' + '='.repeat(80) + '\n\n';
          }
          content += formatNoteContent(note, selectedFormat);
        });
        
        if (selectedFormat === 'html') {
          content = `<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="UTF-8">\n<title>Экспорт заметок</title>\n<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:800px;margin:0 auto;padding:20px;line-height:1.6}</style>\n</head>\n<body>\n${content}\n</body>\n</html>`;
        }
      }
      
      const extensions = { markdown: 'md', html: 'html', text: 'txt', json: 'json' };
      const extension = extensions[selectedFormat];
      
      const blob = new Blob([content], { 
        type: selectedFormat === 'html' ? 'text/html' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `notesflow-export-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification.success(`Экспортировано ${notes.length} заметок`);
      onClose?.();
    } catch (error) {
      console.error('Error exporting notes:', error);
      showNotification.error('Ошибка при экспорте заметок');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (note) {
      exportSingleNote();
    } else if (notes) {
      exportMultipleNotes();
    }
  };

  // Установка формата по умолчанию при монтировании
  React.useEffect(() => {
    const defaultFormat = getExportSettings();
    setSelectedFormat(defaultFormat);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">
          Экспорт {note ? 'заметки' : `${notes?.length || 0} заметок`}
        </h3>
        
        {note && (
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">
            Заметка: <strong>{note.title}</strong>
          </p>
        )}
      </div>

      {/* Выбор формата */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
          Формат экспорта:
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'markdown', label: 'Markdown', desc: 'Универсальный формат разметки' },
            { key: 'html', label: 'HTML', desc: 'Веб-страница с форматированием' },
            { key: 'text', label: 'Текст', desc: 'Простой текстовый файл' },
            { key: 'json', label: 'JSON', desc: 'Структурированные данные' }
          ].map((format) => (
            <button
              key={format.key}
              onClick={() => setSelectedFormat(format.key as ExportFormat)}
              className={`p-3 border rounded-lg text-left transition-all ${
                selectedFormat === format.key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border dark:border-dark-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium">{format.label}</div>
              <div className="text-xs text-text-secondary dark:text-dark-text-secondary">
                {format.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Опции экспорта */}
      {selectedFormat !== 'json' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
            Дополнительные опции:
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Включить метаданные (дата создания, обновления)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeTags}
                onChange={(e) => setIncludeTags(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Включить теги</span>
            </label>
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isExporting}
        >
          Отмена
        </Button>
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Экспорт...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Экспортировать
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
