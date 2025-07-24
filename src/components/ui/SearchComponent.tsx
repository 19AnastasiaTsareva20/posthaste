import React, { useState, useEffect, useRef } from "react";
import { Card } from "./";

interface SearchComponentProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  onSearch,
  placeholder = "Поиск по заметкам...",
  suggestions = [],
  recentSearches = [],
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Поиск с задержкой / Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);

      // Сохранить в недавние поиски / Save to recent searches
      if (query.trim() && query.length > 2) {
        const recent = JSON.parse(
          localStorage.getItem("notesflow-recent-searches") || "[]",
        );
        const updatedRecent = [
          query,
          ...recent.filter((item: string) => item !== query),
        ].slice(0, 5);
        localStorage.setItem(
          "notesflow-recent-searches",
          JSON.stringify(updatedRecent),
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  // Горячие клавиши / Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K или Cmd+K для фокуса на поиске / Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape для очистки / Escape to clear
      if (e.key === "Escape" && isFocused) {
        setQuery("");
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused]);

  // Получить недавние поиски / Get recent searches
  const getRecentSearches = () => {
    return JSON.parse(
      localStorage.getItem("notesflow-recent-searches") || "[]",
    );
  };

  const filteredSuggestions = suggestions
    .filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(query.toLowerCase()) &&
        suggestion !== query,
    )
    .slice(0, 3);

  const recentItems = query.length === 0 ? getRecentSearches().slice(0, 3) : [];

  return (
    <Card className="relative" hover={false}>
      <div className="relative">
        {/* Поле поиска / Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className={`h-5 w-5 transition-colors duration-200 ${
                isFocused
                  ? "text-primary dark:text-night-primary"
                  : "text-text-muted dark:text-dark-text-muted"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              // Задержка для обработки кликов по предложениям / Delay for suggestion clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={placeholder}
            className="w-full pl-12 pr-20 py-3 bg-surface dark:bg-dark-surface 
                     border-2 border-border dark:border-dark-border rounded-xl
                     text-text-primary dark:text-dark-text-primary
                     placeholder-text-muted dark:placeholder-dark-text-muted
                     focus:border-primary dark:focus:border-night-primary 
                     focus:bg-gradient-card dark:focus:bg-gradient-card-dark
                     focus:shadow-primary transition-all duration-300
                     text-base font-medium"
          />

          {/* Кнопки действий / Action buttons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1.5 text-text-muted dark:text-dark-text-muted 
                         hover:text-danger hover:bg-danger/10 rounded-lg
                         transition-all duration-200 mr-1"
                title="Очистить поиск"
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

            {/* Горячая клавиша / Keyboard shortcut */}
            <div className="hidden sm:flex items-center space-x-1 text-xs text-text-muted dark:text-dark-text-muted">
              <kbd className="px-2 py-1 bg-neutral-100 dark:bg-dark-border rounded text-xs">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Предложения и недавние поиски / Suggestions and recent searches */}
        {showSuggestions &&
          (filteredSuggestions.length > 0 || recentItems.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50">
              <Card className="py-2 animate-slide-up shadow-large">
                {/* Предложения / Suggestions */}
                {filteredSuggestions.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-xs font-semibold text-text-muted dark:text-dark-text-muted uppercase tracking-wide">
                      Предложения
                    </div>
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={`suggestion-${index}`}
                        onClick={() => {
                          setQuery(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-text-primary dark:text-dark-text-primary
                               hover:bg-primary/10 dark:hover:bg-night-primary/10 
                               hover:text-primary dark:hover:text-night-primary
                               transition-colors duration-150 flex items-center gap-3"
                      >
                        <svg
                          className="h-4 w-4 text-text-muted dark:text-dark-text-muted"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Недавние поиски / Recent searches */}
                {recentItems.length > 0 && (
                  <div>
                    {filteredSuggestions.length > 0 && (
                      <hr className="border-border dark:border-dark-border my-2" />
                    )}
                    <div className="px-4 py-2 text-xs font-semibold text-text-muted dark:text-dark-text-muted uppercase tracking-wide">
                      Недавние поиски
                    </div>
                    {recentItems.map((recent, index) => (
                      <button
                        key={`recent-${index}`}
                        onClick={() => {
                          setQuery(recent);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-text-secondary dark:text-dark-text-secondary
                               hover:bg-accent/10 dark:hover:bg-accent/10
                               hover:text-accent transition-colors duration-150 flex items-center gap-3"
                      >
                        <svg
                          className="h-4 w-4 text-text-muted dark:text-dark-text-muted"
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
                        {recent}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
      </div>

      {/* Индикатор состояния / Status indicator */}
      {query && (
        <div className="mt-3 flex items-center justify-between text-xs text-text-muted dark:text-dark-text-muted">
          <span>Поиск: "{query}"</span>
          {query.length < 2 && (
            <span className="text-warning">Введите минимум 2 символа</span>
          )}
        </div>
      )}
    </Card>
  );
};
