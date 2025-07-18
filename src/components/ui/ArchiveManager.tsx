import React, { useState, useEffect } from 'react';
import { Card, Button } from './';
import { Note } from '../../types';

interface ArchiveManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export const ArchiveManager: React.FC<ArchiveManagerProps> = ({
  isOpen,
  onClose,
  onRestore,
  onPermanentDelete
}) => {
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);

  // Load archived notes/Загрузка архивированных заметок
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('notesflow-notes');
      if (saved) {
        try {
          const allNotes = JSON.parse(saved).map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          }));
          const archived = allNotes.filter((note: Note) => note.isArchived);
          setArchivedNotes(archived);
        } catch (error) {
          console.error('Error loading archived notes:', error);
          setArchivedNotes([]);
        }
      }
    }
  }, [isOpen]);

  // Format date/Форматирование даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Truncate content/Обрезка содержимого
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header/Заголовок */}
        <div className="flex justify-between items-center p-6 border-b border-default">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Архив заметок
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Архивированных заметок: {archivedNotes.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content/Содержимое */}
        <div className="flex-1 overflow-y-auto p-6">
          {archivedNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-text-muted text-lg">Архив пуст</p>
              <p className="text-text-muted text-sm mt-2">
                Архивированные заметки будут отображаться здесь
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedNotes.map(note => (
                <Card key={note.id} className="opacity-75">
                  {/* Note content/Содержимое заметки */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-text-primary line-clamp-2">
                        {note.title || 'Без названия'}
                      </h3>
                      {note.isFavorite && (
                        <span className="text-yellow-500 ml-2">⭐</span>
                      )}
                    </div>

                    <p className="text-text-secondary text-sm line-clamp-3">
                      {truncateContent(note.content)}
                    </p>

                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-accent/20 text-accent text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-text-muted text-xs">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-text-muted border-t border-default pt-3">
                      <span>
                        Архивировано: {formatDate(note.updatedAt)}
                      </span>
                    </div>

                    {/* Actions/Действия */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onRestore(note.id);
                          setArchivedNotes(prev => 
                            prev.filter(n => n.id !== note.id)
                          );
                        }}
                        className="flex-1"
                      >
                        Восстановить
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('Удалить заметку навсегда? Это действие нельзя отменить.')) {
                            onPermanentDelete(note.id);
                            setArchivedNotes(prev => 
                              prev.filter(n => n.id !== note.id)
                            );
                          }
                        }}
                        className="flex-1"
                      >
                        Удалить навсегда
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer/Подвал */}
        <div className="border-t border-default p-6">
          <div className="flex justify-between items-center">
            <p className="text-text-muted text-sm">
              Заметки в архиве не отображаются в основном списке
            </p>
            <Button onClick={onClose}>
              Закрыть архив
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
