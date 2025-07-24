import React, { useState } from "react";

// Исправляем импорты - предполагаем, что Card и Button находятся в shadcn/ui
import { Card, CardContent } from "../ui/card"; // Предполагаемый путь к Card
import { Button } from "../ui/button"; // Предполагаемый путь к Button

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

interface NoteCardProps {
  note: Note;
  onClick: () => void; // Исправлено для соответствия тестам
  onFavoriteToggle: (noteId: string) => void; // Исправлено для соответствия тестам
  onDelete: (noteId: string) => void;
  onArchive?: (noteId: string) => void;
  className?: string;
  viewMode?: "grid" | "list"; // Добавлено для соответствия тестам
  isArchived?: boolean; // Добавлено для соответствия тестам
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onClick,
  onFavoriteToggle,
  onDelete,
  onArchive,
  className = "",
  viewMode = "grid",
  isArchived = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Получить цвет тега / Get tag color
  const getTagColor = (tagName: string): string => {
    const savedColors = JSON.parse(
      localStorage.getItem("notesflow-tag-colors") || "{}",
    );
    const colors = [
      "#2D9EE0",
      "#3854F2",
      "#576EF2",
      "#2193B0",
      "#6DD5ED",
      "#15B9A7",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
    ];
    return savedColors[tagName] || colors[tagName.length % colors.length];
  };

  // Получить превью контента / Get content preview
  const getContentPreview = (
    content: string,
    maxLength: number = 120,
  ): string => {
    const textContent = content.replace(/<[^>]*>/g, ""); // Удалить HTML теги
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + "..."
      : textContent;
  };

  // Форматирование даты / Date formatting
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffInDays === 0) return "Сегодня";
    if (diffInDays === 1) return "Вчера";
    if (diffInDays < 7) return `${diffInDays} дн. назад`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} нед. назад`;
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  // Обработчик удаления / Delete handler
  const handleDelete = () => {
    if (window.confirm("Удалить заметку? Это действие нельзя отменить.")) {
      onDelete(note.id);
    }
    setIsMenuOpen(false);
  };

  // Обработчик архивирования / Archive handler
  const handleArchive = () => {
    if (onArchive) {
      onArchive(note.id);
    }
    setIsMenuOpen(false);
  };

  return (
    <Card
      className={`group relative transition-all duration-300 cursor-pointer ${
        viewMode === "list" ? "p-3" : "p-4"
      } ${className} ${
        isHovered
          ? "shadow-medium scale-[1.02]"
          : "hover:shadow-medium hover:scale-[1.02]"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
    >
      <CardContent className="p-0">
        {/* Индикатор избранного / Favorite indicator */}
        {note.isFavorite && (
          <div className="absolute top-2 right-2 z-10">
            <div className="w-3 h-3 bg-warning rounded-full animate-pulse" />
          </div>
        )}
        {/* Основной контент / Main content */}
        <div className="space-y-3">
          {/* Заголовок заметки / Note title */}
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`font-semibold text-text-primary dark:text-dark-text-primary line-clamp-2 flex-1 ${
                viewMode === "list" ? "text-sm" : "text-base"
              }`}
            >
              {note.title || "Без заголовка"}
            </h3>
            {/* Меню действий / Actions menu */}
            <div
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                isMenuOpen ? "opacity-100" : ""
              }`}
            >
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="p-1 text-text-muted hover:text-text-primary"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </Button>
                {/* Выпадающее меню / Dropdown menu */}
                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-large z-20 animate-scale-in">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFavoriteToggle(note.id);
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-dark-border flex items-center gap-2"
                      >
                        <svg
                          className={`h-4 w-4 ${note.isFavorite ? "text-warning" : "text-text-muted"}`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {note.isFavorite
                          ? "Убрать из избранного"
                          : "Добавить в избранное"}
                      </button>
                      {onArchive && !note.isArchived && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive();
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-dark-border flex items-center gap-2"
                        >
                          <svg
                            className="h-4 w-4 text-text-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 8l4 4 6-6"
                            />
                          </svg>
                          Архивировать
                        </button>
                      )}
                      <hr className="border-border dark:border-dark-border my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
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
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Превью контента / Content preview */}
          {viewMode !== "list" && note.content && (
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm line-clamp-3 leading-relaxed">
              {getContentPreview(note.content)}
            </p>
          )}
          {/* Теги / Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {note.tags.slice(0, viewMode === "list" ? 2 : 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: getTagColor(tag) }}
                >
                  #{tag}
                </span>
              ))}
              {note.tags.length > (viewMode === "list" ? 2 : 4) && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-neutral-200 dark:bg-dark-border text-text-muted dark:text-dark-text-muted">
                  +{note.tags.length - (viewMode === "list" ? 2 : 4)}
                </span>
              )}
            </div>
          )}
          {/* Метаданные / Metadata */}
          <div className="flex items-center justify-between text-xs text-text-muted dark:text-dark-text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatDate(note.updatedAt)}
              </span>
              {note.content && (
                <span className="flex items-center gap-1">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  {note.content.replace(/<[^>]*>/g, "").split(" ").length} слов
                </span>
              )}
            </div>
            {/* Индикаторы статуса / Status indicators */}
            <div className="flex items-center gap-1">
              {note.isFavorite && (
                <svg
                  className="h-3 w-3 text-warning"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
              {note.isArchived && (
                <svg
                  className="h-3 w-3 text-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8l4 4 6-6"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
        {/* Эффект наведения / Hover effect */}
        <div
          className={`absolute inset-0 bg-gradient-primary opacity-0 rounded-lg transition-opacity duration-300 pointer-events-none ${
            isHovered ? "opacity-5" : ""
          }`}
        />
      </CardContent>
    </Card>
  );
};
