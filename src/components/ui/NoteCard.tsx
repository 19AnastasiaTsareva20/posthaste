import React from 'react';
import { Card, Button } from './';
import { Note } from '../../types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onArchive?: (id: string) => void;
  onClick?: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onToggleFavorite,
  onArchive,
  onClick
}) => {
  // Format date/Форматирование даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Truncate content/Обрезка содержимого
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <div onClick={() => onClick?.(note)}>
        {/* Header with title and favorite/Заголовок с названием и избранное */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-text-primary line-clamp-2 flex-1">
            {note.title || 'Без названия'}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note.id);
            }}
            className={`ml-2 transition-colors ${
              note.isFavorite 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-text-muted hover:text-yellow-500'
            }`}
            aria-label={note.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            title={note.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </div>

        {/* Content preview/Превью содержимого */}
        <p className="text-text-secondary text-sm mb-3 line-clamp-3">
          {truncateContent(note.content)}
        </p>

        {/* Tags/Теги */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-accent/20 text-accent text-xs rounded"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-text-muted text-xs">
                +{note.tags.length - 3} ещё
              </span>
            )}
          </div>
        )}

        {/* Footer with date and actions/Подвал с датой и действиями */}
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-xs">
            {formatDate(note.updatedAt)}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
            >
              Изменить
            </Button>
            {onArchive && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Архивировать заметку?')) {
                    onArchive(note.id);
                  }
                }}
                title="Архивировать заметку"
              >
                📁
              </Button>
            )}
            <Button
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Удалить заметку?')) {
                  onDelete(note.id);
                }
              }}
            >
              Удалить
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
