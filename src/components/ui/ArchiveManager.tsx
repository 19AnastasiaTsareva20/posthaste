import React, { useState, useEffect } from 'react';
import { Card, Button } from './';

interface ArchivedNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  archivedAt: Date;
  originalCreatedAt: Date;
  folderId?: string;
}

interface ArchiveManagerProps {
  onRestore: (noteId: string) => void;
  onPermanentDelete: (noteId: string) => void;
  className?: string;
}

export const ArchiveManager: React.FC<ArchiveManagerProps> = ({
  onRestore,
  onPermanentDelete,
  className = ""
}) => {
  const [archivedNotes, setArchivedNotes] = useState<ArchivedNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'archivedAt' | 'title' | 'originalCreatedAt'>('archivedAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    type: 'restore' | 'delete' | 'clear';
    noteId?: string;
  } | null>(null);

  // Загрузка архивированных заметок / Load archived notes
  useEffect(() => {
    const loadArchivedNotes = () => {
      const archived = localStorage.getItem('notesflow-archived');
      if (archived) {
        try {
          const parsedNotes = JSON.parse(archived).map((note: any) => ({
            ...note,
            archivedAt: new Date(note.archivedAt),
            originalCreatedAt: new Date(note.originalCreatedAt)
          }));
          setArchivedNotes(parsedNotes);
        } catch (error) {
          console.error('Error loading archived notes:', error);
        }
      }
    };

    loadArchivedNotes();
  }, []);

  // Фильтрация и сортировка заметок / Filter and sort notes
  const filteredAndSortedNotes = archivedNotes
    .filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      
      switch (sortBy) {
        case 'title':
          return multiplier * a.title.localeCompare(b.title);
        case 'originalCreatedAt':
          return multiplier * (a.originalCreatedAt.getTime() - b.originalCreatedAt.getTime());
        case 'archivedAt':
        default:
          return multiplier * (a.archivedAt.getTime() - b.archivedAt.getTime());
      }
    });

  // Получить превью контента / Get content preview
  const getContentPreview = (content: string, maxLength: number = 100): string => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  };

  // Форматирование даты / Format date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    if (diffInDays < 7) return `${diffInDays} дн. назад`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} нед. назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Получить цвет тега / Get tag color
  const getTagColor = (tagName: string): string => {
    const savedColors = JSON.parse(localStorage.getItem('notesflow-tag-colors') || '{}');
    const colors = ['#2D9EE0', '#3854F2', '#576EF2', '#2193B0', '#6DD5ED', '#15B9A7', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    return savedColors[tagName] || colors[tagName.length % colors.length];
  };

  // Выбор заметки / Select note
  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  // Выбрать все / Select all
  const selectAll = () => {
    setSelectedNotes(
      selectedNotes.length === filteredAndSortedNotes.length 
        ? [] 
        : filteredAndSortedNotes.map(note => note.id)
    );
  };

  // Обработчик восстановления / Restore handler
  const handleRestore = (noteId?: string) => {
    const notesToRestore = noteId ? [noteId] : selectedNotes;
    
    notesToRestore.forEach(id => {
      onRestore(id);
      setArchivedNotes(prev => prev.filter(note => note.id !== id));
    });
    
    setSelectedNotes([]);
    setShowConfirmDialog(null);
  };

  // Обработчик удаления / Delete handler
  const handlePermanentDelete = (noteId?: string) => {
    const notesToDelete = noteId ? [noteId] : selectedNotes;
    
    notesToDelete.forEach(id => {
      onPermanentDelete(id);
      setArchivedNotes(prev => prev.filter(note => note.id !== id));
    });
    
    setSelectedNotes([]);
    setShowConfirmDialog(null);
  };

  // Очистить весь архив / Clear entire archive
  const handleClearArchive = () => {
    archivedNotes.forEach(note => onPermanentDelete(note.id));
    setArchivedNotes([]);
    setSelectedNotes([]);
    setShowConfirmDialog(null);
  };

  return (
    <Card className={`${className}`} hover={false}>
      <div className="space-y-6">
        {/* Заголовок и статистика / Header and statistics */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
              <svg className="h-6 w-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4 6-6" />
              </svg>
              Архив заметок
            </h2>
            <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
              {archivedNotes.length} {archivedNotes.length === 1 ? 'заметка' : archivedNotes.length < 5 ? 'заметки' : 'заметок'} в архиве
            </p>
          </div>
          
          {archivedNotes.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirmDialog({ type: 'clear' })}
              className="text-danger hover:text-danger hover:border-danger"
            >
              Очистить архив
            </Button>
          )}
        </div>

        {/* Инструменты управления / Management tools */}
        {archivedNotes.length > 0 && (
          <div className="space-y-4">
            {/* Поиск и сортировка / Search and sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск в архиве..."
                  className="input w-full pl-10"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input w-auto"
                >
                  <option value="archivedAt">По дате архивирования</option>
                  <option value="title">По названию</option>
                  <option value="originalCreatedAt">По дате создания</option>
                </select>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="p-2"
                  title={sortOrder === 'desc' ? 'По убыванию' : 'По возрастанию'}
                >
                  <svg className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Массовые действия / Bulk actions */}
            {filteredAndSortedNotes.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-dark-surface rounded-lg">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNotes.length === filteredAndSortedNotes.length && filteredAndSortedNotes.length > 0}
                      onChange={selectAll}
                      className="rounded border-border focus:ring-primary"
                    />
                    <span className="text-sm text-text-primary dark:text-dark-text-primary">
                      Выбрать все ({filteredAndSortedNotes.length})
                    </span>
                  </label>
                  
                  {selectedNotes.length > 0 && (
                    <span className="text-sm text-primary dark:text-night-primary font-medium">
                      Выбрано: {selectedNotes.length}
                    </span>
                  )}
                </div>
                
                {selectedNotes.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowConfirmDialog({ type: 'restore' })}
                      className="text-success hover:text-success hover:border-success"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Восстановить
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowConfirmDialog({ type: 'delete' })}
                      className="text-danger hover:text-danger hover:border-danger"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Удалить навсегда
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Список архивированных заметок / Archived notes list */}
        <div className="space-y-3">
          {filteredAndSortedNotes.length === 0 ? (
            <div className="text-center py-12 text-text-muted dark:text-dark-text-muted">
              {archivedNotes.length === 0 ? (
                <>
                  <svg className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8l4 4 6-6" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">Архив пуст</h3>
                  <p className="text-sm">Архивированные заметки будут появляться здесь</p>
                </>
              ) : (
                <>
                  <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
                  </svg>
                  <p>Ничего не найдено по запросу "{searchQuery}"</p>
                </>
              )}
            </div>
          ) : (
            filteredAndSortedNotes.map((note) => (
              <Card key={note.id} className="p-4 transition-all duration-200 hover:shadow-medium">
                <div className="flex items-start gap-3">
                  {/* Чекбокс выбора / Selection checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotes.includes(note.id)}
                    onChange={() => toggleNoteSelection(note.id)}
                    className="mt-1 rounded border-border focus:ring-primary"
                  />
                  
                  {/* Основной контент / Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-text-primary dark:text-dark-text-primary line-clamp-1">
                        {note.title || 'Без заголовка'}
                      </h3>
                      
                      {/* Действия для отдельной заметки / Individual note actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowConfirmDialog({ type: 'restore', noteId: note.id })}
                          className="p-1 text-success hover:bg-success/10"
                          title="Восстановить"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowConfirmDialog({ type: 'delete', noteId: note.id })}
                          className="p-1 text-danger hover:bg-danger/10"
                          title="Удалить навсегда"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Превью контента / Content preview */}
                    {note.content && (
                      <p className="text-text-secondary dark:text-dark-text-secondary text-sm mb-3 line-clamp-2">
                        {getContentPreview(note.content)}
                      </p>
                    )}
                    
                    {/* Теги / Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: getTagColor(tag) }}
                          >
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-neutral-200 dark:bg-dark-border text-text-muted dark:text-dark-text-muted">
                            +{note.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Метаданные / Metadata */}
                    <div className="flex items-center gap-4 text-xs text-text-muted dark:text-dark-text-muted">
                      <span className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4 6-6" />
                        </svg>
                        Архивировано: {formatDate(note.archivedAt)}
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Создано: {formatDate(note.originalCreatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Диалог подтверждения / Confirmation dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full animate-scale-in">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    showConfirmDialog.type === 'restore' ? 'bg-success/20 text-success' :
                    showConfirmDialog.type === 'delete' ? 'bg-danger/20 text-danger' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {showConfirmDialog.type === 'restore' ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                    {showConfirmDialog.type === 'restore' ? 'Восстановить заметки?' :
                     showConfirmDialog.type === 'delete' ? 'Удалить навсегда?' :
                     'Очистить архив?'}
                  </h3>
                </div>
                
                <p className="text-text-secondary dark:text-dark-text-secondary">
                  {showConfirmDialog.type === 'restore' ? 
                    `Восстановить ${showConfirmDialog.noteId ? '1 заметку' : `${selectedNotes.length} заметок`}? Они появятся в основном списке.` :
                   showConfirmDialog.type === 'delete' ?
                    `Удалить ${showConfirmDialog.noteId ? '1 заметку' : `${selectedNotes.length} заметок`} навсегда? Это действие нельзя отменить.` :
                    `Удалить все ${archivedNotes.length} заметок из архива навсегда? Это действие нельзя отменить.`
                  }
                </p>
                
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowConfirmDialog(null)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  
                  <Button
                    variant={showConfirmDialog.type === 'restore' ? 'primary' : 'danger'}
                    onClick={() => {
                      if (showConfirmDialog.type === 'restore') {
                        handleRestore(showConfirmDialog.noteId);
                      } else if (showConfirmDialog.type === 'delete') {
                        handlePermanentDelete(showConfirmDialog.noteId);
                      } else {
                        handleClearArchive();
                      }
                    }}
                    className="flex-1"
                  >
                    {showConfirmDialog.type === 'restore' ? 'Восстановить' : 'Удалить'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
};
