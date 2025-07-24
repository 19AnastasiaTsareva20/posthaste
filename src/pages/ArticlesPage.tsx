import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  SearchComponent,
  NoteCard,
  showNotification,
} from "../components/ui";

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

export const ArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "title">(
    "updatedAt",
  );
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка заметок при монтировании
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    setIsLoading(true);
    try {
      const savedNotes = localStorage.getItem("notesflow-notes");
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes)
          .filter((note: any) => !note.isArchived)
          .map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          }));
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      showNotification.error("Ошибка при загрузке заметок");
    } finally {
      setIsLoading(false);
    }
  };

  // Получение всех уникальных тегов
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [notes]);

  // Фильтрация и сортировка заметок
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes;

    // Фильтр по избранным
    if (showFavoritesOnly) {
      filtered = filtered.filter((note) => note.isFavorite);
    }

    // Фильтр по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Фильтр по выбранным тегам
    if (selectedTags.length > 0) {
      filtered = filtered.filter((note) =>
        selectedTags.every((tag) => note.tags.includes(tag)),
      );
    }

    // Сортировка
    filtered.sort((a, b) => {
      const multiplier = sortOrder === "desc" ? -1 : 1;

      switch (sortBy) {
        case "title":
          return multiplier * a.title.localeCompare(b.title);
        case "createdAt":
          return multiplier * (a.createdAt.getTime() - b.createdAt.getTime());
        case "updatedAt":
        default:
          return multiplier * (a.updatedAt.getTime() - b.updatedAt.getTime());
      }
    });

    return filtered;
  }, [notes, searchQuery, selectedTags, sortBy, sortOrder, showFavoritesOnly]);

  // Переключение избранного
  const handleToggleFavorite = (noteId: string) => {
    try {
      const savedNotes = localStorage.getItem("notesflow-notes");
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        const updatedNotes = notes.map((note: any) =>
          note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note,
        );

        localStorage.setItem("notesflow-notes", JSON.stringify(updatedNotes));

        const updatedNotesList = notes.map((note: Note) =>
          note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note,
        );
        setNotes(updatedNotesList.filter((note: Note) => !note.isArchived));

        const updatedNote = updatedNotesList.find((note) => note.id === noteId);
        if (updatedNote) {
          showNotification.success(
            updatedNote.isFavorite
              ? "Добавлено в избранное"
              : "Удалено из избранного",
          );
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showNotification.error("Ошибка при изменении статуса избранного");
    }
  };

  // Архивирование заметки
  const handleArchiveNote = (noteId: string) => {
    try {
      const savedNotes = localStorage.getItem("notesflow-notes");
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        const updatedNotes = notes.map((note: any) =>
          note.id === noteId
            ? {
                ...note,
                isArchived: true,
                archivedAt: new Date().toISOString(),
              }
            : note,
        );

        localStorage.setItem("notesflow-notes", JSON.stringify(updatedNotes));
        setNotes(notes.filter((note: Note) => note.id !== noteId));

        showNotification.success("Заметка перемещена в архив");
      }
    } catch (error) {
      console.error("Error archiving note:", error);
      showNotification.error("Ошибка при архивировании заметки");
    }
  };

  // Удаление заметки (архивирование)
  const handleDeleteNote = (noteId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту заметку?")) {
      try {
        const savedNotes = localStorage.getItem("notesflow-notes");
        if (savedNotes) {
          const notes = JSON.parse(savedNotes);
          const updatedNotes = notes.map((note: any) =>
            note.id === noteId
              ? {
                  ...note,
                  isArchived: true,
                  archivedAt: new Date().toISOString(),
                }
              : note,
          );

          localStorage.setItem("notesflow-notes", JSON.stringify(updatedNotes));
          setNotes(notes.filter((note: Note) => note.id !== noteId));

          showNotification.info("Заметка перемещена в архив");
        }
      } catch (error) {
        console.error("Error deleting note:", error);
        showNotification.error("Ошибка при удалении заметки");
      }
    }
  };

  // Переключение тега в фильтре
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Очистка всех фильтров
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setShowFavoritesOnly(false);
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
      <div className="max-w-7xl mx-auto p-4 md:pl-24 space-y-6">
        {/* Заголовок и статистика */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-3">
                <svg
                  className="h-8 w-8 text-primary dark:text-night-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                NotesFlow
              </h1>
              <p className="text-text-secondary dark:text-dark-text-secondary mt-1">
                Управляйте своими заметками эффективно
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-text-secondary dark:text-dark-text-secondary">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary dark:bg-night-primary rounded-full" />
                <span>Всего: {notes.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span>
                  Избранных: {notes.filter((n) => n.isFavorite).length}
                </span>
              </div>
              {filteredAndSortedNotes.length !== notes.length && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>Показано: {filteredAndSortedNotes.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Поиск и фильтры */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchComponent
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Поиск по заметкам..."
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={showFavoritesOnly ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill={showFavoritesOnly ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  Избранные
                </Button>

                <div className="flex bg-neutral-100 dark:bg-dark-surface rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="p-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="p-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Теги */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-text-secondary dark:text-dark-text-secondary flex items-center">
                  Теги:
                </span>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-white"
                        : "bg-neutral-100 dark:bg-dark-surface text-text-secondary dark:text-dark-text-secondary hover:bg-neutral-200 dark:hover:bg-dark-background"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Сортировка и очистка фильтров */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input-sm"
                >
                  <option value="updatedAt">По изменению</option>
                  <option value="createdAt">По создании</option>
                  <option value="title">По названию</option>
                </select>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                  }
                  className="p-2"
                >
                  {sortOrder === "desc" ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h9m0 0l4-4m0 0l4 4m-4-4v12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                      />
                    </svg>
                  )}
                </Button>
              </div>

              {(searchQuery ||
                selectedTags.length > 0 ||
                showFavoritesOnly) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Очистить фильтры
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Список заметок */}
        {filteredAndSortedNotes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-text-muted dark:text-dark-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary mb-2">
              {notes.length === 0 ? "Заметок пока нет" : "Заметки не найдены"}
            </h3>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
              {notes.length === 0
                ? "Создайте свою первую заметку и начните организовывать свои мысли"
                : "Попробуйте изменить критерии поиска или очистить фильтры"}
            </p>
            <div className="flex justify-center gap-3">
              {notes.length === 0 ? (
                <Button variant="primary" onClick={() => navigate("/create")}>
                  Создать заметку
                </Button>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Очистить фильтры
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-3"
            }
          >
            {filteredAndSortedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => navigate(`/view/${note.id}`)}
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
  );
};
