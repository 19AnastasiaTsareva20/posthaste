// src/components/ui/ThemeToggle.tsx
import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, readingMode, toggleReadingMode } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Переключатель темы / Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-3 rounded-xl bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm border border-border/50 dark:border-dark-border/50 hover:bg-gradient-primary hover:text-white hover:border-transparent hover:shadow-primary transition-all duration-300 group"
        aria-label={
          theme === "light"
            ? "Переключить на тёмную тему"
            : "Переключить на светлую тему"
        }
        title={
          theme === "light"
            ? "Переключить на тёмную тему"
            : "Переключить на светлую тему"
        }
      >
        {theme === "light" ? (
          // Иконка луны для тёмной темы / Moon icon for dark theme
          <svg
            className="w-5 h-5 text-text-primary dark:text-dark-text-primary group-hover:text-white transition-colors"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          // Иконка солнца для светлой темы / Sun icon for light theme
          <svg
            className="w-5 h-5 text-text-primary dark:text-dark-text-primary group-hover:text-white transition-colors animate-spin-slow"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Режим чтения / Reading mode */}
      <button
        onClick={toggleReadingMode}
        className={`p-3 rounded-xl backdrop-blur-sm border transition-all duration-300 group ${
          readingMode
            ? "bg-gradient-accent text-white border-transparent shadow-accent"
            : "bg-surface/80 dark:bg-dark-surface/80 border-border/50 dark:border-dark-border/50 hover:bg-gradient-accent hover:text-white hover:border-transparent hover:shadow-accent"
        }`}
        aria-label={
          readingMode 
            ? "Выключить режим чтения" 
            : "Включить режим чтения"
        }
        title={
          readingMode 
            ? "Выключить режим чтения" 
            : "Включить режим чтения"
        }
      >
        <svg
          className={`w-5 h-5 transition-colors ${
            readingMode
              ? "text-white"
              : "text-text-primary dark:text-dark-text-primary group-hover:text-white"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
};
