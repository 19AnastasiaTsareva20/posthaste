import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  SearchComponent, 
  FolderManager, 
  TagManager, 
  FavoritesFilter,
  NoteCard,
  QuickNote 
} from '../components/ui';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived?: boolean;
}

interface Tag {
  name: string;
  count: number;
}

export const ArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка заметок / Load notes
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    setIsLoading(true);
    try {
      const savedNotes = localStorage.getItem('notesflow-notes');
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        })).filter((note: Note) => !note.isArchived);
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Получение тегов с количеством / Get tags with count
  const allTags: Tag[] = useMemo(() => {
    const tagCount: { [key: string]: number } = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCount).map(([name, count]) => ({
      name,
      count
    }));
  }, [notes]);

  // Фильтрация и сортировка заметок / Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes;

    // Поиск / Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Фильтр по папке / Filter by folder
    if (selectedFolderId) {
      filtered = filtered.filter(note => note.folderId === selectedFolderId);
    }

    // Фильтр по тегу / Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    // Фильтр избранных / Filter favorites
    if (showFavorites) {
      filtered = filtered.filter(note => note.isFavorite);
    }

    // Сортировка / Sorting
    filtered.sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      
      switch (sortBy) {
        case 'title':
          return multiplier * a.title.localeCompare(b.title);
        case 'createdAt':
          return multiplier * (a.createdAt.getTime() - b.createdAt.getTime());
        case 'updatedAt':
        default:
          return multiplier * (a.updatedAt.getTime() - b.updatedAt.getTime());
      }
    });

    return filtered;
  }, [notes, searchQuery, selectedFolderId, selectedTag, showFavorites, sortBy, sortOrder]);

  // Обработчики / Handlers
  const handleCreateNote = () => {
    navigate('/create');
  };

  const handleEditNote = (note: Note) => {
    navigate(`/edit/${note.id}`);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
  };

  const handleToggleFavorite = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note
    );
    setNotes(updatedNotes);
    localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
  };

  const handleArchiveNote = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isArchived: true } : note
    );
    setNotes(updatedNotes.filter(note => !note.isArchived));
    localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
  };

  const handleQuickNoteSave = (noteData: { title: string; content: string; tags: string[] }) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      isFavorite: false,
      folderId: selectedFolderId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('notesflow-notes', JSON.stringify(updatedNotes));
    setShowQuickNote(false);
  };

  // Статистика / Statistics
  const stats = {
    total: notes.length,
    favorites: notes.filter(note => note.isFavorite).length,
    withTags: notes.filter(note => note.tags.length > 0).length,
    inFolders: notes.filter(note => note.folderId).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-primary dark:text-dark-text-primary">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span>Загрузка заметок...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Боковая панель / Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Статистика / Statistics */}
            <Card className="p-4">
              <h2 className="font-semibold text-text-primary dark:text-dark-text-primary mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary dark:text-night-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                  <path d="M20 7.35V19a2 2 0 01-2 2H6a2 2 0 01-2-2V7.35c0-.65.42-1.2 1-1.41l9-3.3c.56-.2 1.17-.2 1.73 0l9 3.3c.58.21 1 .76 1 1.41z"/>
                </svg>
                Статистика
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary dark:text-dark-text-secondary">Всего заметок:</span>
                  <span className="font-medium text-text-primary dark:text-dark-text-primary">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary dark:text-dark-text-secondary">Избранных:</span>
                  <span className="font-medium text-warning">{stats.favorites}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary dark:text-dark-text-secondary">С тегами:</span>
                  <span className="font-medium text-primary dark:text-night-primary">{stats.withTags}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary dark:text-dark-text-secondary">В папках:</span>
                  <span className="font-medium text-success">{stats.inFolders}</span>
                </div>
              </div>
            </Card>

            {/* Управление папками / Folder management */}
            <FolderManager
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
            />

            {/* Управление тегами / Tag management */}
            <TagManager
              tags={allTags}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />

            {/* Фильтр избранных / Favorites filter */}
            <FavoritesFilter
              isActive={showFavorites}
              onToggle={setShowFavorites}
              count={stats.favorites}
            />
          </div>

          {/* Основной контент / Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Заголовок и панель управления / Header and controls */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-3">
                    <svg className="h-8 w-8 text-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Мои заметки
                  </h1>
                  {filteredAndSortedNotes.length > 0 && (
                    <span className="text-sm bg-primary/10 text-primary dark:bg-night-primary/10 dark:text-night-primary px-2 py-1 rounded-full">
                      {filteredAndSortedNotes.length}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowQuickNote(true)}
                    className="flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Быстрая заметка
                  </Button>
                  
                  <Button
                    variant="primary"
                    onClick={handleCreateNote}
                    className="flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Новая заметка
                  </Button>
                </div>
              </div>

              {/* Поиск / Search */}
              <div className="mb-6">
                <SearchComponent
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Поиск по заметкам, тегам и содержимому..."
                  className="w-full"
                />
              </div>

              {/* Панель управления / Control panel */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Активные фильтры / Active filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary dark:bg-night-primary/10 dark:text-night-primary rounded-full text-sm">
                      Поиск: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  
                  {selectedTag && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                      #{selectedTag}
                      <button
                        onClick={() => setSelectedTag(undefined)}
                        className="hover:bg-secondary/20 rounded-full p-0.5"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  
                  {selectedFolderId && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-full text-sm">
                      Папка
                      <button
                        onClick={() => setSelectedFolderId(undefined)}
                        className="hover:bg-success/20 rounded-full p-0.5"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  
                  {showFavorites && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning rounded-full text-sm">
                      Избранные
                      <button
                        onClick={() => setShowFavorites(false)}
                        className="hover:bg-warning/20 rounded-full p-0.5"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>

                {/* Сортировка и вид / Sorting and view */}
                <div className="flex items-center gap-3">
                  {/* Сортировка / Sorting */}
                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="input-sm"
                    >
                      <option value="updatedAt">По изменению</option>
                      <option value="createdAt">По созданию</option>
                      <option value="title">По названию</option>
                    </select>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                      className="p-2"
                    >
                      {sortOrder === 'desc' ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m0 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                      )}
                    </Button>
                  </div>

                  {/* Переключение вида / View toggle */}
                  <div className="flex bg-neutral-100 dark:bg-dark-surface rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'grid'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'list'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Список заметок / Notes list */}
            {filteredAndSortedNotes.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  {searchQuery || selectedTag || selectedFolderId || showFavorites
                    ? 'Заметки не найдены'
                    : 'У вас пока нет заметок'
                  }
                </h3>
                <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
                  {searchQuery || selectedTag || selectedFolderId || showFavorites
                    ? 'Попробуйте изменить фильтры или создать новую заметку'
                    : 'Начните создавать заметки, чтобы организовать свои мысли и идеи'
                  }
                </p>
                <Button variant="primary" onClick={handleCreateNote}>
                  Создать первую заметку
                </Button>
              </Card>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {filteredAndSortedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={() => handleEditNote(note)}
                    onFavoriteToggle={() => handleToggleFavorite(note.id)}
                    onArchive={() => handleArchiveNote(note.id)}
                    onDelete={() => handleDeleteNote(note.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Быстрая заметка / Quick note */}
        {showQuickNote && (
          <QuickNote
            onSave={handleQuickNoteSave}
            onClose={() => setShowQuickNote(false)}
            defaultFolderId={selectedFolderId}
          />
        )}
      </div>
    </div>
  );
};
