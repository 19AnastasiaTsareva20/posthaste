import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui';

interface Article {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Загрузка статей/Load articles
  useEffect(() => {
    const savedArticles = JSON.parse(localStorage.getItem('posthaste-articles') || '[]');
    setArticles(savedArticles);
  }, []);

  // Фильтрация статей/Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesFilter = filter === 'all' || 
      (filter === 'public' && article.isPublic) ||
      (filter === 'private' && !article.isPublic);
    
    const matchesSearch = searchTerm === '' ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const deleteArticle = (id: string) => {
    const updatedArticles = articles.filter(article => article.id !== id);
    setArticles(updatedArticles);
    localStorage.setItem('posthaste-articles', JSON.stringify(updatedArticles));
    setShowDeleteModal(null);
  };

  const getPreview = (content: string, maxLength: number = 150): string => {
    // Удаляем HTML теги/Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
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
            <h1 className="text-2xl font-bold text-white">Мои публикации</h1>
          </div>
          <Link to="/create">
            <Button className="bg-white text-gray-900 hover:bg-gray-100">
              ✍️ Новая статья
            </Button>
          </Link>
        </div>
      </header>

      {/* Основной контент/Main content */}
      <main className="container mx-auto p-6 max-w-7xl">
        {/* Поиск и фильтры/Search and filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Поиск/Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по названию или тегам..."
                className="w-full px-4 py-2 border border-border dark:border-dark-border rounded bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
              />
            </div>
            
            {/* Фильтры/Filters */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                Все ({articles.length})
              </Button>
              <Button
                variant={filter === 'public' ? 'primary' : 'outline'}
                onClick={() => setFilter('public')}
                size="sm"
              >
                🌍 Публичные ({articles.filter(a => a.isPublic).length})
              </Button>
              <Button
                variant={filter === 'private' ? 'primary' : 'outline'}
                onClick={() => setFilter('private')}
                size="sm"
              >
                🔒 Приватные ({articles.filter(a => !a.isPublic).length})
              </Button>
            </div>
          </div>
        </Card>

        {/* Список статей/Articles list */}
        {filteredArticles.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-2">
              {articles.length === 0 ? 'Нет статей' : 'Ничего не найдено'}
            </h3>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
              {articles.length === 0 
                ? 'Создайте свою первую статью!'
                : 'Попробуйте изменить фильтры или поисковый запрос.'
              }
            </p>
            {articles.length === 0 && (
              <Link to="/create">
                <Button>Создать статью</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredArticles.map(article => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-2">
                      {article.title || 'Без названия'}
                    </h3>
                    <p className="text-text-secondary dark:text-dark-text-secondary text-sm mb-3">
                      {getPreview(article.content)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      article.isPublic 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {article.isPublic ? '🌍 Публичная' : '🔒 Приватная'}
                    </span>
                  </div>
                </div>

                {/* Теги/Tags */}
                {article.tags.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Метаинформация и действия/Meta and actions */}
                <div className="flex justify-between items-center text-sm">
                  <div className="text-text-secondary dark:text-dark-text-secondary">
                    Создана: {new Date(article.createdAt).toLocaleDateString()}
                    {article.updatedAt !== article.createdAt && (
                      <span> • Обновлена: {new Date(article.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      👁️ Просмотр
                    </Button>
                    <Button variant="outline" size="sm">
                      ✏️ Редактировать
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => setShowDeleteModal(article.id)}
                    >
                      🗑️ Удалить
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Модальное окно удаления/Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">
              Удалить статью?
            </h3>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
              Это действие нельзя отменить. Статья будет удалена навсегда.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(null)}
              >
                Отмена
              </Button>
              <Button 
                variant="danger"
                onClick={() => deleteArticle(showDeleteModal)}
              >
                Удалить
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
