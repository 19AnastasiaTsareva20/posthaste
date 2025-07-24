import React, { useState, useEffect } from "react";
import { Card, Button } from "./";

interface Tag {
  name: string;
  count: number;
  color?: string;
}

interface TagManagerProps {
  onTagSelect: (tagName: string | undefined) => void;
  selectedTag?: string;
  className?: string;
  allTags?: Tag[];
}

export const TagManager: React.FC<TagManagerProps> = ({
  onTagSelect,
  selectedTag,
  className = "",
  allTags = [],
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState("#2D9EE0");

  // Цвета для тегов / Colors for tags
  const tagColors = [
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
    "#F97316",
    "#84CC16",
    "#EC4899",
    "#6366F1",
    "#14B8A6",
  ];

  // Популярные теги для предложений / Popular tags for suggestions
  const popularTags = [
    "работа",
    "личное",
    "идеи",
    "проект",
    "важное",
    "дела",
    "планы",
    "заметки",
    "учеба",
    "здоровье",
    "путешествия",
  ];

  // Фильтрация тегов / Filter tags
  const filteredTags = allTags
    .filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.count - a.count);

  // Предложения тегов / Tag suggestions
  const suggestions = popularTags
    .filter(
      (tag) =>
        tag.toLowerCase().includes(newTagName.toLowerCase()) &&
        !allTags.some((existingTag) => existingTag.name === tag) &&
        tag !== newTagName,
    )
    .slice(0, 3);

  // Создание нового тега / Create new tag
  const createTag = () => {
    if (!newTagName.trim()) return;

    const tagName = newTagName.trim().toLowerCase();

    // Сохранить цвет тега / Save tag color
    const savedTagColors = JSON.parse(
      localStorage.getItem("notesflow-tag-colors") || "{}",
    );
    savedTagColors[tagName] = selectedColor;
    localStorage.setItem(
      "notesflow-tag-colors",
      JSON.stringify(savedTagColors),
    );

    onTagSelect(tagName);
    setNewTagName("");
    setIsCreating(false);
    setSelectedColor("#2D9EE0");
  };

  // Получить цвет тега / Get tag color
  const getTagColor = (tagName: string): string => {
    const savedColors = JSON.parse(
      localStorage.getItem("notesflow-tag-colors") || "{}",
    );
    return savedColors[tagName] || tagColors[tagName.length % tagColors.length];
  };

  // Очистить поиск при выборе тега / Clear search when tag selected
  useEffect(() => {
    if (selectedTag) {
      setSearchQuery("");
    }
  }, [selectedTag]);

  return (
    <Card className={`${className}`} hover={false}>
      <div className="space-y-4">
        {/* Заголовок / Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
            <svg
              className="h-5 w-5 text-primary dark:text-night-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7 7h10v2l-2 2h-6l-2-2V7zM4 9h2v10a2 2 0 002 2h8a2 2 0 002-2V9h2V7H4v2z" />
            </svg>
            Теги
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(true)}
            className="p-2"
            title="Создать тег"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Button>
        </div>

        {/* Поиск по тегам / Tag search */}
        {filteredTags.length > 5 && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск тегов..."
              className="input w-full text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-danger transition-colors"
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
              </button>
            )}
          </div>
        )}

        {/* Все теги / All tags */}
        <button
          onClick={() => onTagSelect(undefined)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
            !selectedTag
              ? "bg-gradient-primary text-white shadow-primary"
              : "hover:bg-neutral-100 dark:hover:bg-dark-surface text-text-primary dark:text-dark-text-primary"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                !selectedTag ? "bg-white" : "bg-gradient-accent"
              }`}
            />
            <span className="font-medium">Все теги</span>
          </div>
          <span
            className={`text-sm px-2 py-1 rounded-full ${
              !selectedTag
                ? "bg-white/20 text-white"
                : "bg-neutral-200 dark:bg-dark-border text-text-muted dark:text-dark-text-muted group-hover:bg-primary group-hover:text-white"
            }`}
          >
            {allTags.length}
          </span>
        </button>

        {/* Список тегов / Tags list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => onTagSelect(tag.name)}
              className={`w-full group flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 ${
                selectedTag === tag.name
                  ? "bg-gradient-primary text-white shadow-primary"
                  : "hover:bg-neutral-100 dark:hover:bg-dark-surface text-text-primary dark:text-dark-text-primary"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      selectedTag === tag.name
                        ? "white"
                        : getTagColor(tag.name),
                  }}
                />
                <span className="font-medium truncate">#{tag.name}</span>
              </div>

              <span
                className={`text-sm px-2 py-1 rounded-full flex-shrink-0 ${
                  selectedTag === tag.name
                    ? "bg-white/20 text-white"
                    : "bg-neutral-200 dark:bg-dark-border text-text-muted dark:text-dark-text-muted group-hover:bg-primary/20 group-hover:text-primary"
                }`}
              >
                {tag.count}
              </span>
            </button>
          ))}
        </div>

        {/* Форма создания тега / Create tag form */}
        {isCreating && (
          <div className="border border-border dark:border-dark-border rounded-lg p-4 space-y-3 bg-gradient-card dark:bg-gradient-card-dark animate-slide-up">
            <div className="relative">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Название тега..."
                className="input w-full pl-8"
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && createTag()}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted">
                #
              </span>
            </div>

            {/* Предложения / Suggestions */}
            {suggestions.length > 0 && newTagName.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-text-muted dark:text-dark-text-muted">
                  Предложения:
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setNewTagName(suggestion)}
                      className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary dark:bg-night-primary/10 dark:text-night-primary hover:bg-primary/20 transition-colors"
                    >
                      #{suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Выбор цвета / Color selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                Цвет тега:
              </label>
              <div className="flex flex-wrap gap-2">
                {tagColors.slice(0, 10).map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full transition-all duration-200 ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-primary dark:ring-night-primary scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Кнопки действий / Action buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={createTag}
                disabled={!newTagName.trim()}
                className="flex-1"
              >
                Создать
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setNewTagName("");
                  setSelectedColor("#2D9EE0");
                }}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        )}

        {/* Быстрые теги / Quick tags */}
        {!isCreating && allTags.length === 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
              Популярные теги:
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.slice(0, 6).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setNewTagName(tag);
                    setIsCreating(true);
                  }}
                  className="px-3 py-1.5 text-sm rounded-full bg-primary/10 text-primary dark:bg-night-primary/10 dark:text-night-primary hover:bg-primary/20 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Пустое состояние / Empty state */}
        {allTags.length === 0 && !isCreating && (
          <div className="text-center py-6 text-text-muted dark:text-dark-text-muted">
            <svg
              className="h-12 w-12 mx-auto mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 7h10v2l-2 2h-6l-2-2V7zM4 9h2v10a2 2 0 002 2h8a2 2 0 002-2V9h2V7H4v2z"
              />
            </svg>
            <p className="text-sm mb-3">
              Теги помогают быстро находить заметки
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreating(true)}
            >
              Создать первый тег
            </Button>
          </div>
        )}

        {/* Счетчик поиска / Search counter */}
        {searchQuery && (
          <div className="text-xs text-text-muted dark:text-dark-text-muted text-center pt-2 border-t border-border dark:border-dark-border">
            Найдено: {filteredTags.length} из {allTags.length}
          </div>
        )}
      </div>
    </Card>
  );
};
