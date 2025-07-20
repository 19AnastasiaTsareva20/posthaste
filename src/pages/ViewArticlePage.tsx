import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, showNotification, ExportManager } from '../components/ui';

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
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadNote(id);
    }
  }, [id]);

  const loadNote = (noteId: string) => {
    setIsLoading(true);
    try {
      const savedNotes = localStorage.getItem('notesflow-notes');
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        const foundNote = notes.find((n: any) => n.id === noteId);
        
        if (foundNote) {
          setNote({
            ...foundNote,
            createdAt: new Date(foundNote.createdAt),
            updatedAt: new Date(foundNote.updatedAt)
          });
        } else {
          showNotification.error('Заметка не найдена');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error loading note:', error);
      showNotification.error('Ошибка при загрузке заметки');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!note) return;
    
    try {
      const savedNotes = localStorage.getItem('notesflow-notes');
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        const updatedNotes = notes.map((n: any) =>
          n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n
        );
        
        localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
        setNote(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        
        showNotification.success(
          note.isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное'
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showNotification.error('Ошибка при изменении статуса избранного');
    }
  };

  const handleArchive = () => {
    if (!note) return;
    
    if (window.confirm('Вы уверены, что хотите архивировать эту заметку?')) {
      try {
        const savedNotes = localStorage.getItem('notesflow-notes');
        if (savedNotes) {
          const notes = JSON.parse(savedNotes);
          const updatedNotes = notes.map((n: any) =>
            n.id === note.id 
              ? { ...n, isArchived: true, archivedAt: new Date().toISOString() } 
              : n
          );
          
          localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
          showNotification.success('Заметка перемещена в архив');
          navigate('/');
        }
      } catch (error) {
        console.error('Error archiving note:', error);
        showNotification.error('Ошибка при архивировании заметки');
      }
    }
  };

  const handleDelete = () => {
    if (!note) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      try {
        const savedNotes = localStorage.getItem('notesflow-notes');
        if (savedNotes) {
          const notes = JSON.parse(savedNotes);
          const updatedNotes = notes.map((n: any) =>
            n.id === note.id 
              ? { ...n, isArchived: true, archivedAt: new Date().toISOString() } 
              : n
          );
          
          localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
          showNotification.info('Заметка перемещена в архив');
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        showNotification.error('Ошибка при удалении заметки');
      }
    }
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

  if (!note) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-2">
            Заметка не найдена
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
            Возможно, заметка была удалена или перемещена
          </p>
          <Button onClick={() => navigate('/')}>
            Вернуться к заметкам
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Шапка с действиями */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="p-2"
                title="Назад к заметкам"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
                  {note.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
                  <span>Создано: {note.createdAt.toLocaleDateString('ru-RU')}</span>
                  <span>Обновлено: {note.updatedAt.toLocaleDateString('ru-RU')}</span>
                  {note.isFavorite && (
                    <span className="flex items-center gap-1 text-warning">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Избранное
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleToggleFavorite}
                className="p-2"
                title={note.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                <svg className="h-5 w-5" fill={note.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowExportModal(true)}
                className="p-2"
                title="Экспортировать заметку"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate(`/edit/${note.id}`)}
                className="p-2"
                title="Редактировать заметку"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>

              <div className="w-px h-6 bg-border dark:bg-dark-border mx-1" />

              <Button
                variant="ghost"
                onClick={handleArchive}
                className="p-2 text-text-secondary hover:text-warning"
                title="Архивировать заметку"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4m0 0l4-4m-4 4V3m0 14l-4-4m4 4l4-4" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                onClick={handleDelete}
                className="p-2 text-text-secondary hover:text-danger"
                title="Удалить заметку"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
        </Card>

        {/* Теги */}
        {note.tags.length > 0 && (
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary dark:bg-night-primary/10 dark:text-night-primary rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Содержание заметки */}
        <Card className="p-6">
          <div 
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </Card>

        {/* Модальное окно экспорта */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <ExportManager 
                note={note}
                onClose={() => setShowExportModal(false)}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
