import React, { useState } from "react";

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
  onClick: () => void;
  onFavoriteToggle: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onArchive?: (noteId: string) => void;
  className?: string;
  viewMode?: "grid" | "list";
  isArchived?: boolean;
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

  // Получить цвет тега
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

  // Получить превью контента
  const getContentPreview = (
    content: string,
    maxLength: number = 120,
  ): string => {
    const textContent = content.replace(/<[^>]*>/g, "");
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + "..."
      : textContent;
  };

  // Форматирование даты
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

  // Обработчик удаления
  const handleDelete = () => {
    if (window.confirm("Удалить заметку? Это действие нельзя отменить.")) {
      onDelete(note.id);
    }
    setIsMenuOpen(false);
  };

  // Обработчик архивирования
  const handleArchive = () => {
    if (onArchive) {
      onArchive(note.id);
    }
    setIsMenuOpen(false);
  };

  return (
    // Заменяем Card на стандартный div с аналогичными стилями
    <div
      className={`group relative transition-all duration-300 cursor-pointer ${
        viewMode === "list" ? "p-3" : "p-4"
      } ${className} ${
        isHovered
          ? "shadow-lg scale-[1.02]"
          : "hover:shadow-md hover:scale-[1.01]"
      } bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700`}
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
      {/* Индикатор избранного */}
      {note.isFavorite && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
        </div>
      )}
      {/* Основной контент */}
      <div className="space-y-3">
        {/* Заголовок заметки */}
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 ${
              viewMode === "list" ? "text-sm" : "text-base"
            }`}
          >
            {note.title || "Без заголовка"}
          </h3>
          {/* Меню действий */}
          <div
            className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isMenuOpen ? "opacity-100" : ""
            }`}
          >
            <div className="relative">
              {/* Заменяем Button на стандартную кнопку */}
              <button
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              {/* Выпадающее меню */}
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFavoriteToggle(note.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <svg
                        className={`h-4 w-4 ${note.isFavorite ? "text-yellow-500" : "text-gray-500"}`}
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
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <svg
                          className="h-4 w-4 text-gray-500"
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
                    <hr className="border-gray-200 dark:border-gray-700 my-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
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
        {/* Превью контента */}
        {viewMode !== "list" && note.content && (
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
            {getContentPreview(note.content)}
          </p>
        )}
        {/* Теги */}
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
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                +{note.tags.length - (viewMode === "list" ? 2 : 4)}
              </span>
            )}
          </div>
        )}
        {/* Метаданные */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
          {/* Индикаторы статуса */}
          <div className="flex items-center gap-1">
            {note.isFavorite && (
              <svg
                className="h-3 w-3 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
            {note.isArchived && (
              <svg
                className="h-3 w-3 text-blue-500"
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
    </div>
  );
};
