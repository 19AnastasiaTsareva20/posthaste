import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ArticlesPage, CreateArticlePage, ViewArticlePage } from './pages';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Главная страница - список заметок / Main page - notes list */}
          <Route path="/" element={<ArticlesPage />} />
          
          {/* Создание новой заметки / Create new note */}
          <Route path="/create" element={<CreateArticlePage />} />
          
          {/* Редактирование заметки / Edit note */}
          <Route path="/edit/:id" element={<CreateArticlePage />} />
          
          {/* Просмотр заметки / View note */}
          <Route path="/view/:id" element={<ViewArticlePage />} />
          
          {/* Перенаправление на главную / Redirect to main */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
