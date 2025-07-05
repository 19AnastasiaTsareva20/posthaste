import './App.css';
import { Button, Card, ThemeToggle, WelcomeModal } from './components/ui';
import { ThemeProvider } from './contexts/ThemeContext';
import { useWelcome } from './hooks/useWelcome';

function App() {
  const { showWelcome, closeWelcome } = useWelcome();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background dark:bg-dark-background transition-colors">
        {/* Хэдер с основным градиентом/Header with main gradient */}
        <header className="bg-gradient-header p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h1 className="text-3xl font-bold text-white">PostHaste</h1>
              <p className="text-white/90 mt-2">Современная платформа для создания контента</p>
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
                <Button className="bg-white text-gray-900 hover:bg-gray-100">
                  Создать статью
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Мои публикации
                </Button>
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
      </div>
    </ThemeProvider>
  );
}

export default App;
