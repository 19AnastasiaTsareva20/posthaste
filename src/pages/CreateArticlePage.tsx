import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, RichTextEditor, FormattingToolbar, ImageUploader, TableInserter } from '../components/ui';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showTableInserter, setShowTableInserter] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  // Настройка редактора / Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }
      }),
      Placeholder.configure({
        placeholder: 'Начните писать вашу заметку...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight,
      Link,
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      setHasUnsavedChanges(true);
      scheduleAutoSave();
    },
  });

  // Автосохранение / Auto-save
  const scheduleAutoSave = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      if (hasUnsavedChanges && (title.trim() || content.trim())) {
        handleAutoSave();
      }
    }, 2000); // Автосохранение через 2 секунды
  };

  // Загрузка заметки для редактирования / Load note for editing
  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      const savedNotes = localStorage.getItem('notesflow-notes');
      if (savedNotes) {
        try {
          const notes: Note[] = JSON.parse(savedNotes);
          const note = notes.find(n => n.id === id);
          if (note) {
            setTitle(note.title);
            setContent(note.content);
            setTags(note.tags);
            setSelectedFolderId(note.folderId);
            setIsFavorite(note.isFavorite);
            if (editor) {
              editor.commands.setContent(note.content);
            }
          }
        } catch (error) {
          console.error('Error loading note:', error);
        }
      }
      setIsLoading(false);
    } else {
      // Фокус на заголовке для новой заметки / Focus title for new note
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [id, isEditing, editor]);

  // Получить папки / Get folders
  const getFolders = () => {
    const savedFolders = localStorage.getItem('notesflow-folders');
    return savedFolders ? JSON.parse(savedFolders) : [];
  };

  // Обработка изменения заголовка / Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
    scheduleAutoSave();
  };

  // Добавление тега / Add tag
  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setHasUnsavedChanges(true);
    }
    setTagInput('');
  };

  // Удаление тега / Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setHasUnsavedChanges(true);
  };

  // Обработка ввода тегов / Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Автосохранение / Auto save
  const handleAutoSave = async () => {
    if (!title.trim() && !content.trim()) return;

    try {
      await saveNote(false);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // Сохранение заметки / Save note
  const saveNote = async (redirect: boolean = true) => {
    if (!title.trim() && !content.trim()) {
      if (redirect) {
        alert('Заполните заголовок или содержание заметки');
      }
      return;
    }

    setIsSaving(true);

    try {
      const savedNotes = localStorage.getItem('notesflow-notes');
      const notes: Note[] = savedNotes ? JSON.parse(savedNotes) : [];

      const noteData = {
        id: isEditing ? id! : `note-${Date.now()}`,
        title: title.trim() || 'Без заголовка',
        content: content.trim(),
        tags,
        isFavorite,
        folderId: selectedFolderId,
        createdAt: isEditing ? 
          notes.find(n => n.id === id)?.createdAt || new Date() : 
          new Date(),
        updatedAt: new Date()
      };

      if (isEditing) {
        const noteIndex = notes.findIndex(n => n.id === id);
        if (noteIndex !== -1) {
          notes[noteIndex] = noteData;
        }
      } else {
        notes.unshift(noteData);
      }

      localStorage.setItem('notesflow-notes', JSON.stringify(notes));
      
      if (redirect) {
        setHasUnsavedChanges(false);
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Ошибка при сохранении заметки');
    } finally {
      setIsSaving(false);
    }
  };

  // Обработка выхода / Handle exit
  const handleExit = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      navigate('/');
    }
  };

  // Получить цвет тега / Get tag color
  const getTagColor = (tagName: string): string => {
    const savedColors = JSON.parse(localStorage.getItem('notesflow-tag-colors') || '{}');
    const colors = ['#2D9EE0', '#3854F2', '#576EF2', '#2193B0', '#6DD5ED', '#15B9A7', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    return savedColors[tagName] || colors[tagName.length % colors.length];
  };

  // Обработчики для медиа / Media handlers
  const handleImageUpload = (imageData: { url: string; alt?: string }) => {
    if (editor) {
      editor.chain().focus().setImage({ 
        src: imageData.url, 
        alt: imageData.alt || '' 
      }).run();
    }
    setShowImageUploader(false);
  };

  const handleTableInsert = (tableHTML: string) => {
    if (editor) {
      editor.chain().focus().insertContent(tableHTML).run();
    }
    setShowTableInserter(false);
  };

  // Горячие клавиши / Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S или Cmd+S для сохранения / Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNote(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Заголовок страницы / Page header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleExit}
                className="p-2"
                title="Назад к списку заметок"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                {isEditing ? 'Редактировать заметку' : 'Новая заметка'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Статус сохранения / Save status */}
              {lastSaved && (
                <span className="text-sm text-success">
                  Сохранено в {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              {hasUnsavedChanges && (
                <span className="text-sm text-warning flex items-center gap-1">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                  Есть несохраненные изменения
                </span>
              )}

              <Button
                variant="primary"
                onClick={() => saveNote()}
                disabled={isSaving || (!title.trim() && !content.trim())}
                className="min-w-[100px]"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Сохранение...
                  </div>
                ) : (
                  'Сохранить'
                )}
              </Button>
            </div>
          </div>

          {/* Заголовок заметки / Note title */}
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Заголовок заметки..."
            className="w-full text-3xl font-bold bg-transparent border-none outline-none text-text-primary dark:text-dark-text-primary placeholder-text-muted dark:placeholder-dark-text-muted mb-4"
          />

          {/* Метаданные / Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Папка / Folder */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                Папка:
              </label>
              <select
                value={selectedFolderId || ''}
                onChange={(e) => {
                  setSelectedFolderId(e.target.value || undefined);
                  setHasUnsavedChanges(true);
                }}
                className="input w-full"
              >
                <option value="">Без папки</option>
                {getFolders().map((folder: any) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Избранное / Favorite */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                Статус:
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => {
                      setIsFavorite(e.target.checked);
                      setHasUnsavedChanges(true);
                    }}
                    className="rounded border-border focus:ring-primary"
                  />
                  <span className="text-sm flex items-center gap-1">
                    <svg className="h-4 w-4 text-warning" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Добавить в избранное
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Теги / Tags */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
              Теги:
            </label>
            
            {/* Отображение тегов / Display tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full text-white"
                    style={{ backgroundColor: getTagColor(tag) }}
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Ввод тегов / Tag input */}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInput}
              placeholder="Добавить теги (Enter, пробел или запятая для разделения)"
              className="input w-full"
            />
          </div>
        </Card>

        {/* Панель форматирования / Formatting toolbar */}
        <FormattingToolbar editor={editor} />

        {/* Дополнительные инструменты / Additional tools */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowImageUploader(true)}
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Изображение
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTableInserter(true)}
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Таблица
            </Button>
          </div>
        </Card>

        {/* Редактор / Editor */}
        <RichTextEditor
          content={content}
          onChange={setContent}
          onSave={() => saveNote(false)}
          autoFocus={isEditing}
        />

        {/* Модальные окна / Modal windows */}
        {showImageUploader && (
          <ImageUploader
            onImageUpload={handleImageUpload}
            onClose={() => setShowImageUploader(false)}
          />
        )}

        {showTableInserter && (
          <TableInserter
            onTableInsert={handleTableInsert}
            onClose={() => setShowTableInserter(false)}
          />
        )}

        {/* Диалог подтверждения выхода / Exit confirmation dialog */}
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full animate-scale-in">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                  Несохраненные изменения
                </h3>
                <p className="text-text-secondary dark:text-dark-text-secondary">
                  У вас есть несохраненные изменения. Что вы хотите сделать?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setHasUnsavedChanges(false);
                      navigate('/');
                    }}
                    className="flex-1"
                  >
                    Выйти без сохранения
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => saveNote()}
                    className="flex-1"
                  >
                    Сохранить и выйти
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
