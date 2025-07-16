import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { Button, Card, ThemeToggle, WelcomeModal, AdminPanel } from './components/ui';
import { NotificationProvider } from './components/ui/NotificationSystem';
import { ThemeProvider } from './contexts/ThemeContext';
import { useWelcome } from './hooks/useWelcome';
import { CreateArticlePage } from './pages/CreateArticlePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ViewArticlePage } from './pages/ViewArticlePage';

function MainPage() {
  const { showWelcome, closeWelcome } = useWelcome();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Hotkeys handler/Обработчик горячих клавиш
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
        {/* Header with navigation/Хэдер с навигацией */}
        <header className="bg-gradient-header p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white">NotesFlow</h1>
                <p className="text-white/90 mt-2">Ваше пространство для мыслей</p>
              </div>
              
              {/* Navigation/Навигация */}
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
                  Создать
                </Link>
                <Link 
                  to="/articles" 
                  className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded"
                >
                  Заметки
                </Link>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </header>
        
        {/* Main content/Основной контент */}
        <main className="container mx-auto p-6 max-w-7xl">
          {/* Welcome card/Приветственная карточка */}
          <Card className="mb-6">
            <div className="bg-gradient-cta rounded-lg p-6 text-white">
              <h2 className="text-2xl font-semibold mb-4 text-white">
                Добро пожаловать в NotesFlow
              </h2>
              <p className="text-white/90 mb-4">
                Создавайте, организуйте и управляйте своими заметками в удобном пространстве.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/create">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100">
                    Создать заметку
                  </Button>
                </Link>
                <Link to="/articles">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    Мои заметки
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Features section/Секция возможностей */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <Card className="border-l-4 border-l-primary">
              <h3 className="text-lg font-semibold mb-2 text-text-primary dark:text-dark-text-primary">
                Папки и теги
              </h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Организуйте заметки по папкам и отмечайте тегами для быстрого поиска.
              </p>
            </Card>
            
            <Card className="border-l-4 border-l-accent">
              <h3 className="text-lg font-semibold mb-2 text-text-primary dark:text-dark-text-primary">
                Быстрый поиск
              </h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Мгновенно находите нужные заметки по содержимому и тегам.
              </p>
            </Card>

            <Card className="border-l-4 border-l-success">
              <h3 className="text-lg font-semibold mb-2 text-text-primary dark:text-dark-text-primary">
                Избранные
              </h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Отмечайте важные заметки и получайте к ним быстрый доступ.
              </p>
            </Card>
          </div>
        </main>

        {/* Welcome modal/Модалка приветствия */}
        <WelcomeModal isOpen={showWelcome} onClose={closeWelcome} />

        {/* Admin panel/Админ-панель */}
        <AdminPanel 
          isOpen={showAdminPanel} 
          onClose={() => setShowAdminPanel(false)} 
        />

        {/* Hidden admin button/Скрытая кнопка админки */}
        <div className="fixed bottom-4 right-4 opacity-20 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowAdminPanel(true)}
            className="bg-gray-800 text-white p-2 rounded-full text-xs shadow-lg"
            title="Панель администратора (Ctrl+Shift+A)"
          >
            Админ
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
