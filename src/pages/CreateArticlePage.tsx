import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { RichTextEditor } from '../components/editor/RichTextEditor';
import { useNotes } from '../hooks/useNotes';

export const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNote, updateNote, allNotes } = useNotes();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing note for editing/Загрузка существующей заметки для редактирования
  useEffect(() => {
    if (id) {
      const note = allNotes.find(n => n.id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags);
        setFolderId(note.folderId || '');
      }
    }
  }, [id, allNotes]);

  // Load folders for selection/Загрузка папок для выбора
  const [folders, setFolders] = useState<any[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('notesflow-folders');
    if (saved) {
      setFolders(JSON.parse(saved));
    }
  }, []);

  // Add tag/Добавление тега
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  // Remove tag/Удаление тега
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Save note/Сохранение заметки
  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      alert('Введите название или содержимое заметки');
      return;
    }

    setIsSaving(true);
    
    try {
      const noteData = {
        title: title.trim() || 'Без названия',
        content: content.trim(),
        tags,
        folderId: folderId || undefined,
        isFavorite: false,
        isArchived: false
      };

      if (id) {
        // Update existing note/Обновление существующей заметки
        updateNote(id, noteData);
      } else {
        // Create new note/Создание новой заметки
        addNote(noteData);
      }

      navigate('/articles');
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Ошибка при сохранении заметки');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save draft/Автосохранение черновика
  useEffect(() => {
    if (!id && (title || content)) {
      const draft = { title, content, tags, folderId };
      localStorage.setItem('notesflow-draft', JSON.stringify(draft));
    }
  }, [title, content, tags, folderId, id]);

  // Load draft on mount/Загрузка черновика при монтировании
  useEffect(() => {
    if (!id) {
      const draft = localStorage.getItem('notesflow-draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setTitle(parsed.title || '');
          setContent(parsed.content || '');
          setTags(parsed.tags || []);
          setFolderId(parsed.folderId || '');
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Заголовок */}
      <header className="bg-gradient-header p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {id ? 'Редактировать заметку' : 'Создать заметку'}
              </h1>
              <p className="text-white/90 mt-1">
                Используйте панель форматирования для оформления текста
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate('/articles')}
              >
                Отмена
              </Button>
              <Button
                className="bg-white text-gray-900 hover:bg-gray-100"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Title and metadata/Название и метаданные */}
          <Card>
            <div className="space-y-4">
              {/* Title input/Поле названия */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Название заметки
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите название заметки..."
                  className="input w-full text-lg"
                />
              </div>

              {/* Folder selection/Выбор папки */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Папка
                </label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Без папки</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags input/Поле тегов */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Теги
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Добавить тег..."
                    className="input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} disabled={!tagInput.trim()}>
                    Добавить
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-accent text-white rounded-full text-sm flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Content editor/Редактор содержимого */}
          <Card>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Содержимое заметки
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Начните писать вашу заметку..."
                className="w-full"
              />
            </div>
          </Card>

          {/* Save button/Кнопка сохранения */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={isSaving || (!title.trim() && !content.trim())}
            >
              {isSaving ? 'Сохранение...' : id ? 'Обновить заметку' : 'Создать заметку'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
