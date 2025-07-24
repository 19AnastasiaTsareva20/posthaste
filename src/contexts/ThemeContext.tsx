import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  readingMode: boolean;
  toggleReadingMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Инициализация темы/Theme initialization
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("posthaste-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    // Автоопределение системной темы/Auto-detect system theme
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Режим чтения/Reading mode
  const [readingMode, setReadingMode] = useState(() => {
    return localStorage.getItem("posthaste-reading-mode") === "true";
  });

  // Применение темы/Apply theme
  useEffect(() => {
    localStorage.setItem("posthaste-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Применение режима чтения/Apply reading mode
  useEffect(() => {
    localStorage.setItem("posthaste-reading-mode", readingMode.toString());
    if (readingMode) {
      document.body.classList.add("reading-mode");
    } else {
      document.body.classList.remove("reading-mode");
    }
  }, [readingMode]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleReadingMode = () => {
    setReadingMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, readingMode, toggleReadingMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
