import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ArticlesPage, CreateArticlePage, ViewArticlePage, ArchivePage, SettingsPage } from './pages';
import { Navigation, NotificationSystem } from './components/ui';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Система навигации / Navigation system */}
        <Navigation />

        {/* Основные маршруты / Main routes */}
        <Routes>
          {/* Главная страница - список заметок / Main page - notes list */}
          <Route path="/" element={<ArticlesPage />} />
          
          {/* Создание новой заметки / Create new note */}
          <Route path="/create" element={<CreateArticlePage />} />
          
          {/* Редактирование заметки / Edit note */}
          <Route path="/edit/:id" element={<CreateArticlePage />} />
          
          {/* Просмотр заметки / View note */}
          <Route path="/view/:id" element={<ViewArticlePage />} />
          
          {/* Архив заметок / Notes archive */}
          <Route path="/archive" element={<ArchivePage />} />
          
          {/* Настройки / Settings */}
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Перенаправление на главную / Redirect to main */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Система уведомлений / Notification system */}
        <NotificationSystem />
      </div>
    </Router>
  );
}

export default App;
