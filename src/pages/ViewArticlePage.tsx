import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

export const ViewArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const savedArticles = JSON.parse(localStorage.getItem('posthaste-articles') || '[]');
      const foundArticle = savedArticles.find((a: Article) => a.id === id);
      setArticle(foundArticle || null);
    }
    setLoading(false);
  }, [id]);

  const deleteArticle = () => {
    if (article && window.confirm('Удалить статью?')) {
      const savedArticles = JSON.parse(localStorage.getItem('posthaste-articles') || '[]');
      const updatedArticles = savedArticles.filter((a: Article) => a.id !== article.id);
      localStorage.setItem('posthaste-articles', JSON.stringify(updatedArticles));
      navigate('/articles');
    }
  };

  const shareArticle = () => {
    if (article) {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        alert('Ссылка скопирована в буфер обмена!');
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-text-secondary">Загрузка статьи...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <Card className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-2">
            Статья не найдена
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
            Возможно, статья была удалена или ссылка неверна.
          </p>
          <Link to="/articles">
            <Button>← Вернуться к статьям</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* Хэдер/Header */}
      <header className="bg-gradient-header p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              to="/articles" 
              className="text-white/80 hover:text-white transition-colors"
            >
              ← Назад к статьям
            </Link>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${
                article.isPublic 
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-700/50 text-white/80'
              }`}>
                {article.isPublic ? '🌍 Публичная' : '🔒 Приватная'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={shareArticle}
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
              size="sm"
            >
              📤 Поделиться
            </Button>
            <Link to={`/create?edit=${article.id}`}>
              <Button
                className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                size="sm"
              >
                ✏️ Редактировать
              </Button>
            </Link>
            <Button
              onClick={deleteArticle}
              variant="danger"
              size="sm"
            >
              🗑️ Удалить
            </Button>
          </div>
        </div>
      </header>

      {/* Основной контент/Main content */}
      <main className="container mx-auto p-6 max-w-4xl">
        {/* Заголовок статьи/Article title */}
        <Card className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
            {article.title || 'Без названия'}
          </h1>
          
          {/* Метаинформация/Meta information */}
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary dark:text-dark-text-secondary">
            <span>📅 Создана: {new Date(article.createdAt).toLocaleDateString()}</span>
            {article.updatedAt !== article.createdAt && (
              <span>✏️ Обновлена: {new Date(article.updatedAt).toLocaleDateString()}</span>
            )}
            <span>📝 {article.content.replace(/<[^>]*>/g, '').length} символов</span>
          </div>

          {/* Теги/Tags */}
          {article.tags.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Содержание статьи/Article content */}
        <Card>
          <div 
            className="prose prose-lg max-w-none text-text-primary dark:text-dark-text-primary"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          {!article.content.trim() && (
            <div className="text-center py-12 text-text-secondary dark:text-dark-text-secondary">
              <div className="text-4xl mb-4">📝</div>
              <p>Содержание статьи пусто</p>
            </div>
          )}
        </Card>

        {/* Похожие статьи или действия/Related articles or actions */}
        <Card className="mt-6">
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
            Действия
          </h3>
          <div className="flex gap-4 flex-wrap">
            <Link to="/create">
              <Button variant="outline">
                ✍️ Создать новую статью
              </Button>
            </Link>
            <Link to="/articles">
              <Button variant="outline">
                📚 Все мои статьи
              </Button>
            </Link>
            <Button 
              variant="outline"
              onClick={() => window.print()}
            >
              🖨️ Печать
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};
