import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { useToast } from '../components/ui/NotificationSystem';
import { exportToMarkdown, exportToHTML, exportToJSON, exportToText, downloadFile } from '../utils/exportUtils';

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
  const toast = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/articles');
      return;
    }

    const savedArticles = JSON.parse(localStorage.getItem('posthaste-articles') || '[]');
    const foundArticle = savedArticles.find((a: Article) => a.id === id);
    
    if (foundArticle) {
      setArticle(foundArticle);
    } else {
      toast.error('Статья не найдена', 'Возможно, она была удалена');
      navigate('/articles');
    }
    
    setLoading(false);
  }, [id, navigate, toast]);

  // Функция экспорта статьи/Article export function
  const exportArticle = (format: 'markdown' | 'html' | 'json' | 'text') => {
    if (!article) return;

    const filename = `${article.title.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, '_')}_${article.id}`;
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'markdown':
        downloadFile(
          exportToMarkdown(article),
          `${filename}_${timestamp}.md`,
          'text/markdown'
        );
        toast.success('Экспорт в Markdown', 'Файл успешно скачан');
        break;
      
      case 'html':
        downloadFile(
          exportToHTML(article),
          `${filename}_${timestamp}.html`,
          'text/html'
        );
        toast.success('Экспорт в HTML', 'Файл успешно скачан');
        break;
      
      case 'json':
        downloadFile(
          exportToJSON(article),
          `${filename}_${timestamp}.json`,
          'application/json'
        );
        toast.success('Экспорт в JSON', 'Файл успешно скачан');
        break;
      
      case 'text':
        downloadFile(
          exportToText(article),
          `${filename}_${timestamp}.txt`,
          'text/plain'
        );
        toast.success('Экспорт в текст', 'Файл успешно скачан');
        break;
    }
  };

  const deleteArticle = () => {
    if (!article) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      const savedArticles = JSON.parse(localStorage.getItem('posthaste-articles') || '[]');
      const updatedArticles = savedArticles.filter((a: Article) => a.id !== article.id);
      localStorage.setItem('posthaste-articles', JSON.stringify(updatedArticles));
      
      toast.success('Статья удалена', 'Статья была успешно удалена');
      navigate('/articles');
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
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-text-secondary mb-4">Статья не найдена</p>
          <Link to="/articles">
            <Button>Вернуться к статьям</Button>
          </Link>
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
              ← Назад к статьям
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white truncate">
                {article.title}
              </h1>
              <p className="text-white/80 text-sm">
                {article.isPublic ? '🌍 Публичная' : '🔒 Приватная'} • 
                Создано {new Date(article.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
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
              className="bg-red-500/20 text-white hover:bg-red-500/30 border-red-500/30"
              size="sm"
            >
              🗑️ Удалить
            </Button>
          </div>
        </div>
      </header>

      {/* Основной контент/Main content */}
      <main className="container mx-auto p-6 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Основное содержимое статьи/Main article content */}
          <div className="lg:col-span-3">
            <Card>
              <article className="prose prose-lg max-w-none dark:prose-invert">
                <div 
                  dangerouslySetInnerHTML={{ __html: article.content }}
                  className="text-text-primary dark:text-dark-text-primary"
                />
              </article>
            </Card>
          </div>

          {/* Боковая панель с информацией/Sidebar with info */}
          <div className="space-y-6">
            {/* Информация о статье/Article info */}
            <Card>
              <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                📊 Информация
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-text-secondary dark:text-dark-text-secondary">Статус:</span>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      article.isPublic 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {article.isPublic ? '🌍 Публичная' : '🔒 Приватная'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-text-secondary dark:text-dark-text-secondary">Создано:</span>
                  <div className="font-mono text-xs mt-1">
                    {new Date(article.createdAt).toLocaleString()}
                  </div>
                </div>
                
                {article.updatedAt !== article.createdAt && (
                  <div>
                    <span className="text-text-secondary dark:text-dark-text-secondary">Обновлено:</span>
                    <div className="font-mono text-xs mt-1">
                      {new Date(article.updatedAt).toLocaleString()}
                    </div>
                  </div>
                )}
                
                <div>
                  <span className="text-text-secondary dark:text-dark-text-secondary">ID:</span>
                  <div className="font-mono text-xs mt-1 break-all">
                    {article.id}
                  </div>
                </div>
              </div>
            </Card>

            {/* Теги/Tags */}
            {article.tags.length > 0 && (
              <Card>
                <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                  🏷️ Теги
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Статистика/Statistics */}
            <Card>
              <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                📈 Статистика
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Символов:</span>
                  <span className="font-mono">
                    {article.content.replace(/<[^>]*>/g, '').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Слов:</span>
                  <span className="font-mono">
                    {article.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Тегов:</span>
                  <span className="font-mono">{article.tags.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Действия/Actions */}
        <Card className="mt-6">
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
            Действия
          </h3>
          <div className="space-y-4">
            {/* Экспорт/Export */}
            <div>
              <h4 className="text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                📤 Экспорт статьи
              </h4>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportArticle('markdown')}
                >
                  📝 Markdown
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportArticle('html')}
                >
                  🌐 HTML
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportArticle('json')}
                >
                  🔧 JSON
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportArticle('text')}
                >
                  📄 Текст
                </Button>
              </div>
            </div>

            {/* Другие действия/Other actions */}
            <div>
              <h4 className="text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                ⚡ Быстрые действия
              </h4>
              <div className="flex gap-2 flex-wrap">
                <Link to="/create">
                  <Button variant="outline" size="sm">
                    ✍️ Создать новую статью
                  </Button>
                </Link>
                <Link to="/articles">
                  <Button variant="outline" size="sm">
                    📚 Все мои статьи
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  🖨️ Печать
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};
