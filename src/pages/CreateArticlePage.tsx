import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { RichTextEditor } from '../components/editor/RichTextEditor';
import { FileUpload } from '../components/ui/FileUpload';

export const CreateArticlePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');

  const handleSave = () => {
    // Пока просто сохраняем в localStorage/Save to localStorage for now
    const article = {
      id: Date.now().toString(),
      title,
      content,
      isPublic,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedArticles = JSON.parse(localStorage.getItem('posthaste-articles') || '[]');
    savedArticles.push(article);
    localStorage.setItem('posthaste-articles', JSON.stringify(savedArticles));

    alert('Статья сохранена! 🎉');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* Хэдер/Header */}
      <header className="bg-gradient-header p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="text-white/80 hover:text-white transition-colors"
            >
              ← Назад
            </Link>
            <h1 className="text-2xl font-bold text-white">Создание статьи</h1>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              💾 Сохранить
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              👁️ Предпросмотр
            </Button>
          </div>
        </div>
      </header>

      {/* Основной контент/Main content */}
      <main className="container mx-auto p-6 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Редактор/Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Заголовок статьи/Article title */}
            <Card>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Заголовок статьи..."
                className="w-full text-2xl font-bold bg-transparent border-none outline-none text-text-primary dark:text-dark-text-primary placeholder-text-secondary"
              />
            </Card>

            {/* Редактор контента/Content editor */}
            <Card className="p-0">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Начните писать свою статью..."
                className="border-0"
              />
            </Card>
          </div>

          {/* Боковая панель/Sidebar */}
          <div className="space-y-6">
            {/* Настройки публикации/Publication settings */}
            <Card>
              <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                ⚙️ Настройки
              </h3>
              
              <div className="space-y-4">
                {/* Приватность/Privacy */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-text-primary dark:text-dark-text-primary">
                      Публичная статья
                    </span>
                  </label>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                    Будет видна всем пользователям
                  </p>
                </div>

                {/* Теги/Tags */}
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                    Теги
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="javascript, react, frontend"
                    className="w-full px-3 py-2 border border-border dark:border-dark-border rounded bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary text-sm"
                  />
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                    Разделяйте запятыми
                  </p>
                </div>
              </div>
            </Card>

            {/* Загрузка файлов/File upload */}
            <FileUpload />

            {/* Статистика/Statistics */}
            <Card>
              <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                📊 Статистика
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary dark:text-dark-text-secondary">Символов:</span>
                  <span className="text-text-primary dark:text-dark-text-primary">{content.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary dark:text-dark-text-secondary">Заголовок:</span>
                  <span className="text-text-primary dark:text-dark-text-primary">{title.length}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary dark:text-dark-text-secondary">Статус:</span>
                  <span className="text-text-primary dark:text-dark-text-primary">
                    {isPublic ? '🌍 Публичная' : '🔒 Приватная'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
