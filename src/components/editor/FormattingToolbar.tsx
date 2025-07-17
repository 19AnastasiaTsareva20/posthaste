import React from 'react';
import { Button } from '../ui';

interface FormattingToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onImageUpload: () => void;
  onInsertChecklist: () => void;
  onInsertTable: () => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onFormat,
  onImageUpload,
  onInsertChecklist,
  onInsertTable
}) => {
  // Format buttons data/Данные кнопок форматирования
  const formatButtons = [
    { command: 'bold', icon: 'B', title: 'Жирный (Ctrl+B)', shortcut: 'Ctrl+B' },
    { command: 'italic', icon: 'I', title: 'Курсив (Ctrl+I)', shortcut: 'Ctrl+I' },
    { command: 'underline', icon: 'U', title: 'Подчеркнутый (Ctrl+U)', shortcut: 'Ctrl+U' },
    { command: 'strikethrough', icon: 'S', title: 'Зачеркнутый', shortcut: '' }
  ];

  const listButtons = [
    { command: 'insertUnorderedList', icon: '•', title: 'Маркированный список' },
    { command: 'insertOrderedList', icon: '1.', title: 'Нумерованный список' }
  ];

  const alignButtons = [
    { command: 'justifyLeft', icon: '⟨', title: 'По левому краю' },
    { command: 'justifyCenter', icon: '||', title: 'По центру' },
    { command: 'justifyRight', icon: '⟩', title: 'По правому краю' }
  ];

  return (
    <div className="border-b border-default p-3 bg-surface">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Text formatting/Форматирование текста */}
        <div className="flex gap-1 border-r border-default pr-2">
          {formatButtons.map(btn => (
            <button
              key={btn.command}
              onClick={() => onFormat(btn.command)}
              className="w-8 h-8 rounded bg-background hover:bg-primary hover:text-white transition-colors text-sm font-bold"
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Headings/Заголовки */}
        <div className="flex gap-1 border-r border-default pr-2">
          <select
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                onFormat('formatBlock', value);
                e.target.value = '';
              }
            }}
            className="text-sm bg-background border border-default rounded px-2 py-1"
          >
            <option value="">Заголовок</option>
            <option value="h1">Заголовок 1</option>
            <option value="h2">Заголовок 2</option>
            <option value="h3">Заголовок 3</option>
            <option value="p">Обычный текст</option>
          </select>
        </div>

        {/* Lists/Списки */}
        <div className="flex gap-1 border-r border-default pr-2">
          {listButtons.map(btn => (
            <button
              key={btn.command}
              onClick={() => onFormat(btn.command)}
              className="w-8 h-8 rounded bg-background hover:bg-primary hover:text-white transition-colors text-sm"
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
          <button
            onClick={onInsertChecklist}
            className="px-3 py-1 rounded bg-background hover:bg-success hover:text-white transition-colors text-sm"
            title="Чек-лист задач"
          >
            ☐ Задачи
          </button>
        </div>

        {/* Alignment/Выравнивание */}
        <div className="flex gap-1 border-r border-default pr-2">
          {alignButtons.map(btn => (
            <button
              key={btn.command}
              onClick={() => onFormat(btn.command)}
              className="w-8 h-8 rounded bg-background hover:bg-primary hover:text-white transition-colors text-sm"
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Tables and special content/Таблицы и специальный контент */}
        <div className="flex gap-1 border-r border-default pr-2">
          <button
            onClick={onInsertTable}
            className="px-3 py-1 rounded bg-background hover:bg-accent hover:text-white transition-colors text-sm"
            title="Вставить таблицу"
          >
            ⚏ Таблица
          </button>
          <button
            onClick={() => onFormat('insertHorizontalRule')}
            className="px-3 py-1 rounded bg-background hover:bg-primary hover:text-white transition-colors text-sm"
            title="Горизонтальная линия"
          >
            ―
          </button>
        </div>

        {/* Links and media/Ссылки и медиа */}
        <div className="flex gap-1 border-r border-default pr-2">
          <button
            onClick={() => {
              const url = prompt('Введите URL ссылки:');
              if (url) {
                onFormat('createLink', url);
              }
            }}
            className="px-3 py-1 rounded bg-background hover:bg-primary hover:text-white transition-colors text-sm"
            title="Добавить ссылку"
          >
            🔗
          </button>
          <Button
            size="sm"
            variant="outline"
            onClick={onImageUpload}
            title="Вставить изображение"
          >
            🖼️
          </Button>
        </div>

        {/* Clear formatting/Очистить форматирование */}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => onFormat('removeFormat')}
            className="px-3 py-1 rounded bg-background hover:bg-warning hover:text-white transition-colors text-sm"
            title="Очистить форматирование"
          >
            Очистить
          </button>
        </div>
      </div>
    </div>
  );
};
