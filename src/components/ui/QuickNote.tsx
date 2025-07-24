import React, { useState, useRef, useEffect } from "react";
import { Card, Button } from "./";

interface QuickNoteProps {
  onSave: (note: { title: string; content: string; tags: string[] }) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const QuickNote: React.FC<QuickNoteProps> = ({
  onSave,
  className = "",
  placeholder = "Быстрая заметка...",
  autoFocus = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Автофокус / Auto focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Автоматическое изменение высоты textarea / Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  // Горячие клавиши / Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter или Cmd+Enter для сохранения / Ctrl+Enter or Cmd+Enter to save
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && isExpanded) {
        e.preventDefault();
        handleSave();
      }

      // Escape для отмены / Escape to cancel
      if (e.key === "Escape" && isExpanded) {
        handleCancel();
      }
    };

    if (isExpanded) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isExpanded, title, content, tags]);

  // Обработка фокуса / Handle focus
  const handleFocus = () => {
    setIsExpanded(true);
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.focus();
      }
    }, 100);
  };

  // Добавление тега / Add tag
  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput("");
  };

  // Удаление тега / Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Обработка ввода тегов / Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Сохранение заметки / Save note
  const handleSave = async () => {
    if (!content.trim()) {
      textareaRef.current?.focus();
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        title: title.trim() || "Быстрая заметка",
        content: content.trim(),
        tags,
      });

      // Очистка формы / Clear form
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      setIsExpanded(false);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Отмена / Cancel
  const handleCancel = () => {
    if (title || content || tags.length > 0) {
      if (
        window.confirm(
          "Отменить создание заметки? Несохраненные данные будут потеряны.",
        )
      ) {
        setTitle("");
        setContent("");
        setTags([]);
        setTagInput("");
        setIsExpanded(false);
      }
    } else {
      setIsExpanded(false);
    }
  };

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

  return (
    <Card
      className={`transition-all duration-300 ${className} ${
        isExpanded ? "shadow-large" : "hover:shadow-medium"
      }`}
      hover={!isExpanded}
    >
      <div className="space-y-4">
        {/* Компактное состояние / Compact state */}
        {!isExpanded && (
          <div
            onClick={handleFocus}
            className="flex items-center gap-3 p-4 cursor-text text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            <svg
              className="h-5 w-5 text-primary dark:text-night-primary"
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
            <span>{placeholder}</span>
          </div>
        )}

        {/* Развернутое состояние / Expanded state */}
        {isExpanded && (
          <div className="space-y-4 animate-slide-up">
            {/* Заголовок / Title */}
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Заголовок заметки (необязательно)"
              className="w-full text-lg font-semibold bg-transparent border-none outline-none text-text-primary dark:text-dark-text-primary placeholder-text-muted dark:placeholder-dark-text-muted"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  textareaRef.current?.focus();
                }
              }}
            />

            {/* Содержимое / Content */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Начните писать..."
              className="w-full min-h-[120px] bg-transparent border-none outline-none resize-none text-text-primary dark:text-dark-text-primary placeholder-text-muted dark:placeholder-dark-text-muted leading-relaxed"
              autoFocus={!autoFocus}
            />

            {/* Теги / Tags */}
            <div className="space-y-2">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: getTagColor(tag) }}
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Добавить теги (Enter, пробел или запятая для разделения)"
                className="w-full text-sm bg-neutral-50 dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg px-3 py-2 text-text-primary dark:text-dark-text-primary placeholder-text-muted dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Кнопки действий / Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-border dark:border-dark-border">
              <div className="flex items-center gap-2 text-xs text-text-muted dark:text-dark-text-muted">
                <kbd className="px-2 py-1 bg-neutral-100 dark:bg-dark-border rounded text-xs">
                  ⌘ + Enter
                </kbd>
                <span>для сохранения</span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSave}
                  disabled={!content.trim() || isSaving}
                  className="min-w-[80px]"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Сохранение...
                    </div>
                  ) : (
                    "Сохранить"
                  )}
                </Button>
              </div>
            </div>

            {/* Счетчик символов / Character counter */}
            {content && (
              <div className="text-xs text-text-muted dark:text-dark-text-muted text-right">
                {content.length} символов,{" "}
                {content.split(" ").filter((word) => word.length > 0).length}{" "}
                слов
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
