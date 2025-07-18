import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  SearchComponent,
  NoteCard,
  FolderManager,
  TagManager,
  FavoritesFilter,
  QuickNote,
  ArchiveManager
} from '../components/ui';
import { useNotes } from '../hooks/useNotes';

export const ArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showArchive, setShowArchive] = useState(false);
  
  const {
    notes,
    allNotes,
    searchQuery,
    setSearchQuery,
    selectedFolder,
    setSelectedFolder,
    selectedTag,
    setSelectedTag,
    showFavorites,
    setShowFavorites,
    addNote,
    deleteNote,
    toggleFavorite,
    archiveNote,
    restoreNote,
    permanentlyDeleteNote
  } = useNotes();

  // Count favorites and archived/Подсчет избранных и архивированных
  const favoritesCount = allNotes.filter(note => note.isFavorite && !note.isArchived).length;
  const archivedCount = allNotes.filter(note => note.isArchived).length;

  // Handle quick note save/Обработка сохранения быстрой заметки
  const handleQuickNoteSave = (content: string) => {
    addNote({
      title: '',
      content,
      tags: ['быстрая-заметка'],
      folderId: undefined,
      isFavorite: false,
      isArchived: false
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Заголовок */}
      <header className="bg-gradient-header p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Мои заметки</h1>
              <p className="text-white/90 mt-1">
                Найдено заметок: {notes.length}
              </p>
            </div>
            <div className="flex gap-4">
              <Link to="/">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  На главную
                </Button>
              </Link>
              <Link to="/create">
                <Button className="bg-white text-gray-900 hover:bg-gray-100">
                  Создать заметку
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with filters/Боковая панель с фильтрами */}
          <div className="space-y-6">
            <SearchComponent
              onSearch={setSearchQuery}
              placeholder="Поиск заметок..."
            />
            
            <FolderManager
              onFolderSelect={setSelectedFolder}
              selectedFolderId={selectedFolder}
            />
            
            <TagManager
              onTagSelect={setSelectedTag}
              selectedTag={selectedTag}
            />
            
            <FavoritesFilter
              showFavorites={showFavorites}
              onToggle={setShowFavorites}
              favoritesCount={favoritesCount}
            />

            {/* Quick note/Быстрая заметка */}
            <QuickNote onSave={handleQuickNoteSave} />

            {/* Archive access/Доступ к архиву */}
            <Card>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-text-primary">Архив</h3>
                  <span className="text-text-muted text-sm">({archivedCount})</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchive(true)}
                  className="w-full"
                  disabled={archivedCount === 0}
                >
                  Открыть архив
                </Button>
                {archivedCount === 0 && (
                  <p className="text-text-muted text-xs">
                    Архивированных заметок пока нет
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Notes grid/Сетка заметок */}
          <div className="lg:col-span-3">
            {notes.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-text-muted">
                  {searchQuery || selectedFolder || selectedTag || showFavorites ? (
                    <div>
                      <p className="text-lg mb-2">Заметки не найдены</p>
                      <p className="text-sm">Попробуйте изменить параметры поиска</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg mb-2">У вас пока нет заметок</p>
                      <Link to="/create">
                        <Button className="mt-4">
                          Создать первую заметку
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {notes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={(note) => navigate(`/article/${note.id}`)}
                    onDelete={deleteNote}
                    onToggleFavorite={toggleFavorite}
                    onArchive={archiveNote}
                    onClick={(note) => navigate(`/article/${note.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Archive manager/Менеджер архива */}
        <ArchiveManager
          isOpen={showArchive}
          onClose={() => setShowArchive(false)}
          onRestore={restoreNote}
          onPermanentDelete={permanentlyDeleteNote}
        />
      </div>
    </div>
  );
};
