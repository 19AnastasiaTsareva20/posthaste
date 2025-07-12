import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, SearchBar } from '../components/ui';
import { useToast } from '../components/ui/NotificationSystem';

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
  const toast = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const savedArticles = JSON.parse(localStorage.getItem('posthaste-articles') || '[]');
  const sortedArticles = savedArticles.sort((a: Article, b: Article) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  setArticles(sortedArticles);
  setFilteredArticles(sortedArticles);
  
    // Собираем все уникальные теги с правильной типизацией
    const allTags = Array.from(
      new Set(sortedArticles.flatMap((article: Article) => article.tags || []))
    ).filter((tag): tag is string => typeof tag === 'string');
    setAvailableTags(allTags);
    
    setLoading(false);
  }, []);

  // Функция поиска/Search function
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter((article: Article) =>
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredArticles(filtered);
    toast.info(`Найдено статей: ${filtered.length}`);
  };

  // Функция фильтрации по тегам/Tag filter function
  const handleTagFilter = (tag: string) => {
    if (!tag) {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter((article: Article) =>
      article.tags.includes(tag)
    );
    
    setFilteredArticles(filtered);
    toast.info(`Статей с тегом #${tag}: ${filtered.length}`);
  };

  const deleteArticle = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      const updatedArticles = articles.filter(article => article.id !== id);
      setArticles(updatedArticles);
      setFilteredArticles(updatedArticles.filter(article => 
        filteredArticles.find(fa => fa.id === article.id)
      ));
      localStorage.setItem('posthaste-articles', JSON.stringify(updatedArticles));
      toast.success('Статья удалена');
    }
  };

  const exportAllArticles = (format: string) => {
    if (articles.length === 0) {
      toast.warning('Нет статей для экспорта');
      return;
    }

    const { exportAllArticles: exportFunction } = require('../utils/exportUtils');
    exportFunction(articles, format);
    toast.success(`Экспорт всех статей в ${format.toUpperCase()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-text-secondary">Загрузка статей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* Хэдер/Header */}
      <header className="bg-gradient-header p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Мои статьи</h1>
              <p className="text-white/90 mt-2">
                Всего статей: {articles.length} • Показано: {filteredArticles.length}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to="/create">
              <Button className="bg-white text-gray-900 hover:bg-gray-100">
                ✍️ Создать статью
              </Button>
            </Link>
            <Link to="/">
              <Button className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                🏠 Главная
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Основной контент/Main content */}
      <main className="container mx-auto p-6 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Поиск и фильтры/Search and filters */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                🔍 Поиск и фильтры
              </h3>
              <SearchBar
                onSearch={handleSearch}
                onTagFilter={handleTagFilter}
                availableTags={availableTags}
                placeholder="Поиск по заголовку, содержанию или тегам..."
              />
            </Card>

            {/* Массовые операции/Bulk operations */}
            <Card>
              <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                📤 Экспорт всех статей
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => exportAllArticles('json')}
                >
                  🔧 JSON
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => exportAllArticles('markdown')}
                >
                  📝 Markdown
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => exportAllArticles('html')}
                >
                  🌐 HTML
                </Button>
              </div>
            </Card>
          </div>

          {/* Список статей/Articles list */}
          <div className="lg:col-span-3">
            {filteredArticles.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-2">
                  {articles.length === 0 ? 'Нет статей' : 'Нет результатов поиска'}
                </h3>
                <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
                  {articles.length === 0 
                    ? 'Создайте свою первую статью!' 
                    : 'Попробуйте изменить параметры поиска'
                  }
                </p>
                {articles.length === 0 && (
                  <Link to="/create">
                    <Button>Создать первую статью</Button>
                  </Link>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article: Article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
                            {article.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            article.isPublic 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {article.isPublic ? '🌍 Публичная' : '🔒 Приватная'}
                          </span>
                        </div>
                        
                        <div className="text-text-secondary dark:text-dark-text-secondary text-sm mb-3">
                          <span>Создано: {new Date(article.createdAt).toLocaleDateString()}</span>
                          {article.updatedAt !== article.createdAt && (
                            <span className="ml-3">
                              Обновлено: {new Date(article.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {article.tags.length > 0 && (
                          <div className="flex gap-2 flex-wrap mb-3">
                            {article.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Link to={`/article/${article.id}`}>
                            <Button variant="outline" size="sm">
                              👁️ Просмотр
                            </Button>
                          </Link>
                          <Link to={`/create?edit=${article.id}`}>
                            <Button variant="outline" size="sm">
                              ✏️ Редактировать
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteArticle(article.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            🗑️ Удалить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
