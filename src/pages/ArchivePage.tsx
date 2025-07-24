import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, SearchComponent, NoteCard } from "../components/ui";

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
  archivedAt?: Date;
}

export const ArchivePage: React.FC = () => {
  const navigate = useNavigate();
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"archivedAt" | "updatedAt" | "title">(
    "archivedAt",
  );
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка архивированных заметок / Load archived notes
  useEffect(() => {
    loadArchivedNotes();
  }, []);

  const loadArchivedNotes = () => {
    setIsLoading(true);
    try {
      const savedNotes = localStorage.getItem("notesflow-notes");
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes)
          .map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
            archivedAt: note.archivedAt ? new Date(note.archivedAt) : undefined,
          }))
          .filter((note: Note) => note.isArchived);
        setArchivedNotes(parsedNotes);
      }
    } catch (error) {
      console.error("Error loading archived notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтрация и сортировка / Filter and sort
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = archivedNotes;

    // Поиск / Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Сортировка / Sorting
    filtered.sort((a, b) => {
      const multiplier = sortOrder === "desc" ? -1 : 1;

      switch (sortBy) {
        case "title":
          return multiplier * a.title.localeCompare(b.title);
        case "updatedAt":
          return multiplier * (a.updatedAt.getTime() - b.updatedAt.getTime());
        case "archivedAt":
        default:
          const aTime = a.archivedAt?.getTime() || a.updatedAt.getTime();
          const bTime = b.archivedAt?.getTime() || b.updatedAt.getTime();
          return multiplier * (aTime - bTime);
      }
    });

    return filtered;
  }, [archivedNotes, searchQuery, sortBy, sortOrder]);

  // Восстановление заметки / Restore note
  const handleRestoreNote = (noteId: string) => {
    try {
      const savedNotes = localStorage.getItem("notesflow-notes");
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        const updatedNotes = notes.map((note: any) =>
          note.id === noteId
            ? { ...note, isArchived: false, archivedAt: undefined }
            : note,
        );

        localStorage.setItem("notesflow-notes", JSON.stringify(updatedNotes));
        setArchivedNotes(archivedNotes.filter((note) => note.id !== noteId));
      }
    } catch (error) {
      console.error("Error restoring note:", error);
    }
  };

  // Окончательное удаление заметки / Permanently delete note
  const handleDeleteNote = (noteId: string) => {
    if (
      window.confirm(
        "Вы уверены, что хотите окончательно удалить эту заметку? Это действие нельзя отменить.",
      )
    ) {
      try {
        const savedNotes = localStorage.getItem("notesflow-notes");
        if (savedNotes) {
          const notes = JSON.parse(savedNotes);
          const updatedNotes = notes.filter((note: any) => note.id !== noteId);

          localStorage.setItem("notesflow-notes", JSON.stringify(updatedNotes));
          setArchivedNotes(archivedNotes.filter((note) => note.id !== noteId));
        }
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  // Очистка всего архива / Clear all archive
  const handleClearArchive = () => {
    if (
      window.confirm(
        "Вы уверены, что хотите окончательно удалить все архивированные заметки? Это действие нельзя отменить.",
      )
    ) {
      try {
        const savedNotes = localStorage.getItem("notesflow-notes");
        if (savedNotes) {
          const notes = JSON.parse(savedNotes);
          const updatedNotes = notes.filter((note: any) => !note.isArchived);

          localStorage.setItem("notesflow-notes", JSON.stringify(updatedNotes));
          setArchivedNotes([]);
        }
      } catch (error) {
        console.error("Error clearing archive:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-primary dark:text-dark-text-primary">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span>Загрузка архива...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Заголовок страницы / Page header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="p-2"
                title="Назад к заметкам"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Button>
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
                    d="M5 8l4 4m0 0l4-4m-4 4V3m0 14l-4-4m4 4l4-4"
                  />
                </svg>
                Архив заметок
              </h1>
              {archivedNotes.length > 0 && (
                <span className="text-sm bg-primary/10 text-primary dark:bg-night-primary/10 dark:text-night-primary px-2 py-1 rounded-full">
                  {filteredAndSortedNotes.length} из {archivedNotes.length}
                </span>
              )}
            </div>

            {archivedNotes.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearArchive}
                className="flex items-center gap-2 text-danger hover:bg-danger/10"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Очистить архив
              </Button>
            )}
          </div>

          {archivedNotes.length > 0 && (
            <>
              {/* Поиск / Search */}
              <div className="mb-6">
                <SearchComponent
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Поиск в архиве..."
                  className="w-full"
                />
              </div>

              {/* Сортировка / Sorting */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  Заметки автоматически архивируются при удалении и хранятся
                  здесь
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="input-sm"
                  >
                    <option value="archivedAt">По времени архивации</option>
                    <option value="updatedAt">По изменению</option>
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
              </div>
            </>
          )}
        </Card>

        {/* Список архивированных заметок / Archived notes list */}
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
                  d="M5 8l4 4m0 0l4-4m-4 4V3m0 14l-4-4m4 4l4-4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary mb-2">
              {searchQuery ? "Заметки не найдены" : "Архив пуст"}
            </h3>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
              {searchQuery
                ? "Попробуйте изменить поисковый запрос"
                : "Архивированные заметки будут отображаться здесь"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Очистить поиск
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedNotes.map((note) => (
              <div key={note.id} className="relative">
                <NoteCard
                  note={note}
                  onClick={() => navigate(`/view/${note.id}`)}
                  onFavoriteToggle={() => {}} // Отключено для архивированных заметок
                  onArchive={() => {}} // Отключено
                  onDelete={() => handleDeleteNote(note.id)}
                  viewMode="grid"
                  isArchived={true}
                />

                {/* Кнопка восстановления / Restore button */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestoreNote(note.id);
                    }}
                    className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm"
                    title="Восстановить заметку"
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
                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                      />
                    </svg>
                  </Button>
                </div>

                {/* Время архивации / Archive time */}
                {note.archivedAt && (
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs bg-black/50 text-white px-2 py-1 rounded-full">
                      Архивировано {note.archivedAt.toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
