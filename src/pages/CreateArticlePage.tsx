import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, FileUpload, TodoList } from '../components/ui';
import { useToast } from '../components/ui/NotificationSystem';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

interface Article {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = Boolean(editId);

  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Редактор TipTap/TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Placeholder.configure({
        placeholder: 'Начните писать свою статью...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
      setCharCount(text.length);
    },
  });

  // Временно отключаем автосохранение до исправления циклов
  // Заглушки для совместимости/Stubs for compatibility
  const forceSave = () => toast.info('Автосохранение временно отключено');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadSaved = () => null;
  const clearSaved = () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasUnsavedChanges = false;

  // Загрузка статьи для редактирования/Load article for editing
  useEffect(() => {
    if (isEditing && editId) {
      const savedArticles = JSON.parse(localStorage.getItem('posthaste-articles') || '[]');
      const articleToEdit = savedArticles.find((a: Article) => a.id === editId);
      
      if (articleToEdit) {
        setTitle(articleToEdit.title);
        setIsPublic(articleToEdit.isPublic);
        setTags(articleToEdit.tags);
        if (editor) {
          editor.commands.setContent(articleToEdit.content);
        }
        toast.info('Статья загружена для редактирования');
      } else {
        // Статья не найдена, перенаправляем на создание новой
        toast.error('Статья не найдена');
        navigate('/create');
      }
    }
  }, [isEditing, editId, editor, navigate, toast]);

  // Обновление счетчиков при загрузке контента
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
      setCharCount(text.length);
    }
  }, [editor]);

// Горячие клавиши/Hotkeys
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+S - Принудительное сохранение автосохранения
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (!isEditing) {
        forceSave();
      }
    }
    
    // Ctrl+Shift+S - Сохранить/опубликовать статью
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      saveArticle();
    }
    
    // Ctrl+Shift+D - Загрузить черновик
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      if (!isEditing) {
        loadDraft();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Отключаем warning для этого случая

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      toast.success(`Тег "${tagInput.trim()}" добавлен`);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    toast.info(`Тег "${tagToRemove}" удален`);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const saveArticle = async () => {
    if (!editor) return;

    setIsSaving(true);
    
    try {
      const content = editor.getHTML();
      
      if (!title.trim() && !content.trim()) {
        toast.warning('Статья пуста', 'Добавьте заголовок или содержание');
        setIsSaving(false);
        return;
      }

      const now = new Date().toISOString();
      
      const article: Article = {
        id: isEditing ? editId! : Date.now().toString(),
        title: title.trim() || 'Без названия',
        content,
        isPublic,
        tags,
        createdAt: isEditing ? 
          JSON.parse(localStorage.getItem('posthaste-articles') || '[]')
            .find((a: Article) => a.id === editId)?.createdAt || now 
          : now,
        updatedAt: now,
      };

      const savedArticles = JSON.parse(localStorage.getItem('posthaste-articles') || '[]');
      let updatedArticles;
      
      if (isEditing) {
        updatedArticles = savedArticles.map((a: Article) => 
          a.id === editId ? article : a
        );
        toast.success('Статья обновлена!', 'Изменения сохранены успешно');
      } else {
        updatedArticles = [...savedArticles, article];
        toast.success('Статья опубликована!', 'Ваша статья доступна для просмотра');
        // Очищаем автосохранение после публикации
        clearSaved();
      }

      localStorage.setItem('posthaste-articles', JSON.stringify(updatedArticles));
      
      // Перенаправляем на просмотр статьи
      navigate(`/article/${article.id}`);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка при сохранении статьи', 'Попробуйте снова');
    } finally {
      setIsSaving(false);
    }
  };

  const saveDraft = () => {
    if (!editor) return;

    const content = editor.getHTML();
    
    if (!title.trim() && !content.trim()) {
      toast.warning('Нечего сохранять', 'Добавьте содержание для черновика');
      return;
    }

    const draft = {
      title,
      content,
      isPublic,
      tags,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem('posthaste-draft', JSON.stringify(draft));
    toast.success('Черновик сохранен!', 'Вы можете продолжить работу позже');
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('posthaste-draft');
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      setTitle(parsedDraft.title);
      setIsPublic(parsedDraft.isPublic);
      setTags(parsedDraft.tags);
      if (editor) {
        editor.commands.setContent(parsedDraft.content);
      }
      toast.success('Черновик загружен!', 'Продолжайте редактирование');
    } else {
      toast.info('Нет сохраненных черновиков');
    }
  };

  const clearContent = () => {
    if (window.confirm('Очистить все содержимое?')) {
      setTitle('');
      setIsPublic(false);
      setTags([]);
      setTagInput('');
      if (editor) {
        editor.commands.clearContent();
      }
      clearSaved(); // Очищаем автосохраненные данные
      toast.info('Содержимое очищено');
    }
  };

  if (!editor) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-text-secondary">Загрузка редактора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* Хэдер/Header */}
      <header className="bg-gradient-header p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              to="/articles" 
              className="text-white/80 hover:text-white transition-colors"
            >
              ← Назад
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEditing ? 'Редактирование статьи' : 'Новая статья'}
              </h1>
              <p className="text-white/80 text-sm">
                {!isEditing && 'Ctrl+Shift+S для быстрой публикации • Ctrl+Shift+D для загрузки черновика'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <Button
                  onClick={saveDraft}
                  className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                  size="sm"
                >
                  💾 Сохранить черновик
                </Button>
                <Button
                  onClick={loadDraft}
                  className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                  size="sm"
                >
                  📂 Загрузить черновик
                </Button>
                <Button
                  onClick={clearContent}
                  className="bg-red-500/20 text-white hover:bg-red-500/30 border-red-500/30"
                  size="sm"
                >
                  🗑️ Очистить
                </Button>
              </>
            )}
            <Button
              onClick={saveArticle}
              disabled={isSaving}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              {isSaving ? '⏳ Сохранение...' : (isEditing ? '💾 Сохранить' : '📝 Опубликовать')}
            </Button>
          </div>
        </div>
      </header>

      {/* Основной контент/Main content */}
      <main className="container mx-auto p-6 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Основная область редактирования/Main editing area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Заголовок и настройки/Title and settings */}
            <Card>
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Заголовок статьи..."
                  className="w-full text-2xl font-bold bg-transparent border-none outline-none text-text-primary dark:text-dark-text-primary placeholder-text-secondary"
                />
                
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-text-secondary dark:text-dark-text-secondary">
                      {isPublic ? '🌍 Публичная статья' : '🔒 Приватная статья'}
                    </span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Редактор/Editor */}
            <Card>
              <div className="space-y-4">
                {/* Панель инструментов/Toolbar */}
                <div className="flex gap-2 flex-wrap border-b pb-4">
                  <Button
                    variant={editor.isActive('bold') ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    <strong>B</strong>
                  </Button>
                  <Button
                    variant={editor.isActive('italic') ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    <em>I</em>
                  </Button>
                  <Button
                    variant={editor.isActive('heading', { level: 1 }) ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  >
                    H1
                  </Button>
                  <Button
                    variant={editor.isActive('heading', { level: 2 }) ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    H2
                  </Button>
                  <Button
                    variant={editor.isActive('bulletList') ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                  >
                    • Список
                  </Button>
                  <Button
                    variant={editor.isActive('orderedList') ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  >
                    1. Нумерованный
                  </Button>
                  <Button
                    variant={editor.isActive('blockquote') ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    " Цитата
                  </Button>
                </div>

                {/* Область редактирования/Editing area */}
                <div className="min-h-[400px] prose prose-lg max-w-none">
                  <EditorContent
                    editor={editor}
                    className="outline-none text-text-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
            </Card>

            {/* Теги/Tags */}
            <Card>
              <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                🏷️ Теги
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Добавить тег..."
                    className="flex-1 px-3 py-2 border border-border dark:border-dark-border rounded bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
                  />
                  <Button onClick={addTag} size="sm">
                    Добавить
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-primary hover:text-red-500 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Боковая панель/Sidebar */}
          <div className="space-y-6">
            {/* Статистика/Statistics */}
            <Card>
              <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                📊 Статистика
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Слов:</span>
                  <span className="font-mono">{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Символов:</span>
                  <span className="font-mono">{charCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Тегов:</span>
                  <span className="font-mono">{tags.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Режим:</span>
                  <span className="font-mono text-xs">
                    {isEditing ? 'Редактирование' : 'Создание'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Загрузка файлов/File upload */}
            <FileUpload />

            {/* Список задач/Todo list */}
            <TodoList />
          </div>
        </div>
      </main>
    </div>
  );
};
