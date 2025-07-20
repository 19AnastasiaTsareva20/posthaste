import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';

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

export const ViewArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID заметки не указан');
      setIsLoading(false);
      return;
    }

    try {
      const savedNotes = localStorage.getItem('notesflow-notes');
      if (savedNotes) {
        const notes: Note[] = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        
        const foundNote = notes.find(n => n.id === id);
        if (foundNote) {
          setNote(foundNote);
        } else {
          setError('Заметка не найдена');
        }
      } else {
        setError('Заметки не найдены');
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setError('Ошибка при загрузке заметки');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const handleEdit = () => {
    if (note) {
      navigate(`/edit/${note.id}`);
    }
  };

  const handleToggleFavorite = () => {
    if (!note) return;

    try {
      const savedNotes = localStorage.getItem('notesflow-notes');
      if (savedNotes) {
        const notes: Note[] = JSON.parse(savedNotes);
        const updatedNotes = notes.map(n =>
          n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n
        );
        
        localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
        setNote({ ...note, isFavorite: !note.isFavorite });
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const handleArchive = () => {
    if (!note) return;

    try {
      const savedNotes = localStorage.getItem('notesflow-notes');
      if (savedNotes) {
        const notes: Note[] = JSON.parse(savedNotes);
        const updatedNotes = notes.map(n =>
          n.id === note.id ? { ...n, isArchived: true } : n
        );
        
        localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
        navigate('/');
      }
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  const handleDelete = () => {
    if (!note) return;

    if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      try {
        const savedNotes = localStorage.getItem('notesflow-notes');
        if (savedNotes) {
          const notes: Note[] = JSON.parse(savedNotes);
          const updatedNotes = notes.filter(n => n.id !== note.id);
          
          localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const getTagColor = (tagName: string): string => {
    const savedColors = JSON.parse(localStorage.getItem('notesflow-tag-colors') || '{}');
    const colors = ['#2D9EE0', '#3854F2', '#576EF2', '#2193B0', '#6DD5ED', '#15B9A7', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    return savedColors[tagName] || colors[tagName.length % colors.length];
  };

  const getFolderName = (folderId: string | undefined): string => {
    if (!folderId) return 'Без папки';
    
    try {
      const savedFolders = localStorage.getItem('notesflow-folders');
      if (savedFolders) {
        const folders = JSON.parse(savedFolders);
        const folder = folders.find((f: any) => f.id === folderId);
        return folder ? folder.name : 'Неизвестная папка';
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
    
    return 'Без папки';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-primary dark:text-dark-text-primary">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span>Загрузка заметки...</span>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-2">
            {error}
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
            Возможно, заметка была удалена или перемещена
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Вернуться к списку заметок
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Заголовок страницы / Page header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="p-2"
                title="Назад к списку заметок"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                Просмотр заметки
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleToggleFavorite}
                className={`p-2 ${note.isFavorite ? 'text-warning' : 'text-text-secondary dark:text-dark-text-secondary'}`}
                title={note.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              >
                <svg className="h-5 w-5" fill={note.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </Button>

              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Редактировать
              </Button>

              <div className="relative group">
                <Button
                  variant="ghost"
                  className="p-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </Button>
                
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={handleArchive}
                    className="w-full px-4 py-2 text-left text-sm text-text-primary dark:text-dark-text-primary hover:bg-neutral-50 dark:hover:bg-dark-background flex items-center gap-2 first:rounded-t-lg"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4m0 0l4-4m-4 4V3m0 14l-4-4m4 4l4-4" />
                    </svg>
                    Архивировать
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger/10 flex items-center gap-2 last:rounded-b-lg"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Заголовок заметки / Note title */}
          <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-6">
            {note.title || 'Без заголовка'}
          </h1>

          {/* Метаданные / Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">
                Папка
              </label>
              <p className="text-sm text-text-primary dark:text-dark-text-primary">
                {getFolderName(note.folderId)}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">
                Создано
              </label>
              <p className="text-sm text-text-primary dark:text-dark-text-primary">
                {note.createdAt.toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">
                Изменено
              </label>
              <p className="text-sm text-text-primary dark:text-dark-text-primary">
                {note.updatedAt.toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">
                Статус
              </label>
              <div className="flex items-center gap-2">
                {note.isFavorite && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning rounded-full text-xs font-medium">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Избранное
                  </span>
                )}
                {!note.isFavorite && (
                  <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    Обычная
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Теги / Tags */}
          {note.tags.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">
                Теги
              </label>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-white"
                    style={{ backgroundColor: getTagColor(tag) }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Содержимое заметки / Note content */}
        <Card className="p-6">
          <div 
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-text-primary dark:prose-headings:text-dark-text-primary prose-p:text-text-primary dark:prose-p:text-dark-text-primary prose-a:text-primary dark:prose-a:text-night-primary prose-strong:text-text-primary dark:prose-strong:text-dark-text-primary prose-code:text-text-primary dark:prose-code:text-dark-text-primary prose-blockquote:text-text-secondary dark:prose-blockquote:text-dark-text-secondary prose-blockquote:border-primary dark:prose-blockquote:border-night-primary"
            dangerouslySetInnerHTML={{ __html: note.content || '<p class="text-text-secondary dark:text-dark-text-secondary italic">Содержимое отсутствует</p>' }}
          />
        </Card>
      </div>
    </div>
  );
};
