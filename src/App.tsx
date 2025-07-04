import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-header p-6">
        <h1 className="text-3xl font-bold text-white">PostHaste</h1>
        <p className="text-blue-100 mt-2">Современная платформа для создания контента</p>
      </header>
      
      <main className="container mx-auto p-6">
        <div className="bg-surface rounded-lg shadow-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Добро пожаловать в PostHaste! 🎉
          </h2>
          <p className="text-text-secondary mb-4">
            Tailwind CSS успешно настроен с нашими кастомными цветами.
          </p>
          
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors">
              Основная кнопка
            </button>
            <button className="px-4 py-2 bg-success text-white rounded hover:bg-teal-600 transition-colors">
              Успех
            </button>
            <button className="px-4 py-2 bg-danger text-white rounded hover:bg-red-600 transition-colors">
              Опасность
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
