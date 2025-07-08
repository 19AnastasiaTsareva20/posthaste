import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { Button, Card, ThemeToggle, WelcomeModal, AdminPanel } from './components/ui';
import { NotificationProvider } from './components/ui/NotificationSystem';
import { ThemeProvider } from './contexts/ThemeContext';
import { useWelcome } from './hooks/useWelcome';
import { TestPage } from './pages/TestPage';
import { CreateArticlePage } from './pages/CreateArticlePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ViewArticlePage } from './pages/ViewArticlePage';

function MainPage() {
  const { showWelcome, closeWelcome } = useWelcome();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Обработка горячих клавиш/Handle hotkeys
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminPanel(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-background dark:bg-dark-background transition-colors">
        {/* Хэдер с навигацией/Header with navigation */}
        <header className="bg-gradient-header p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white">PostHaste</h1>
                <p className="text-white/90 mt-2">Современная платформа для создания контента</p>
              </div>
              
              {/* Навигация/Navigation */}
              <nav className="hidden md:flex gap-4">
                <Link 
                  to="/" 
                  className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded"
                >
                  Главная
                </Link>
                <Link 
                  to="/create" 
                  className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded"
                >
                  ✍️ Написать
                </Link>
                <Link 
                  to="/articles" 
                  className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded"
                >
                  📚 Статьи
                </Link>
                <Link 
                  to="/test" 
                  className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded"
                >
                  🧪 Тесты
                </Link>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </header>
        
        {/* Основной контент/Main content */}
        <main className="container mx-auto p-6 max-w-7xl">
          {/* Приветственная карточка/Welcome card */}
          <Card className="mb-6">
            <div className="bg-gradient-accent rounded-lg p-6 text-white">
              <h2 className="text-2xl font-semibold mb-4">
                Добро пожаловать в PostHaste! 🚀
              </h2>
              <p className="text-white/90 mb-4">
                Создавайте, публикуйте и делитесь своими статьями с друзьями и всем миром.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/create">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100">
                    Создать статью
                  </Button>
                </Link>
                <Link to="/articles">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    Мои публикации
                  </Button>
                </Link>
                <Link to="/test">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    🧪 Тестовая страница
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Тестирование UI/UI testing */}
          <Card>
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">
              Компоненты интерфейса 🎨
            </h2>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
              Базовые элементы управления и стили.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <Button variant="primary">Основная</Button>
                <Button variant="secondary">Вторичная</Button>
                <Button variant="success">Успех</Button>
                <Button variant="danger">Опасность</Button>
                <Button variant="outline">Контур</Button>
              </div>
              
              <div className="flex gap-4 items-center">
                <Button size="sm">Маленькая</Button>
                <Button size="md">Средняя</Button>
                <Button size="lg">Большая</Button>
              </div>
            </div>
          </Card>

          {/* Будущие функции/Future features */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="border-l-4 border-l-primary">
              <h3 className="text-lg font-semibold mb-2 text-text-primary dark:text-dark-text-primary">
                📤 Публикация статей
              </h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Делитесь статьями с друзьями или публикуйте для всех.
              </p>
            </Card>
            
            <Card className="border-l-4 border-l-success">
              <h3 className="text-lg font-semibold mb-2 text-text-primary dark:text-dark-text-primary">
                👥 Система друзей
              </h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Добавляйте друзей и управляйте доступом к публикациям.
              </p>
            </Card>
          </div>
        </main>

        {/* Модалка приветствия/Welcome modal */}
        <WelcomeModal isOpen={showWelcome} onClose={closeWelcome} />

        {/* Админ-панель/Admin panel */}
        <AdminPanel 
          isOpen={showAdminPanel} 
          onClose={() => setShowAdminPanel(false)} 
        />

        {/* Скрытая кнопка админки/Hidden admin button */}
        <div className="fixed bottom-4 right-4 opacity-20 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowAdminPanel(true)}
            className="bg-gray-800 text-white p-2 rounded-full text-xs shadow-lg"
            title="Панель администратора (Ctrl+Shift+A)"
          >
            🔧
          </button>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/create" element={<CreateArticlePage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/article/:id" element={<ViewArticlePage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
