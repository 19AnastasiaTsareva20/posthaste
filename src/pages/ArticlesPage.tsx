import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  SearchComponent,
  NoteCard,
  FolderManager,
  TagManager,
  FavoritesFilter 
} from '../components/ui';
import { useNotes } from '../hooks/useNotes';

export const ArticlesPage: React.FC = () => {
  const navigate = useNavigate();
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
    deleteNote,
    toggleFavorite
  } = useNotes();

  // Count favorites/Подсчет избранных
  const favoritesCount = allNotes.filter(note => note.isFavorite && !note.isArchived).length;

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
                    onClick={(note) => navigate(`/article/${note.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
