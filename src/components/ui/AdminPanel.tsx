import React, { useState, useEffect } from "react";
import { Card, Button } from "./";

interface AdminStats {
  totalArticles: number;
  publicArticles: number;
  privateArticles: number;
  totalFiles: number;
  totalTodos: number;
  completedTodos: number;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<AdminStats>({
    totalArticles: 0,
    publicArticles: 0,
    privateArticles: 0,
    totalFiles: 0,
    totalTodos: 0,
    completedTodos: 0,
  });

  const [isDevMode, setIsDevMode] = useState(() => {
    return localStorage.getItem("posthaste-dev-mode") === "true";
  });

  // Загрузка статистики/Load statistics
  useEffect(() => {
    if (isOpen) {
      const articles = JSON.parse(
        localStorage.getItem("posthaste-articles") || "[]",
      );
      const files = JSON.parse(
        localStorage.getItem("posthaste-uploaded-files") || "[]",
      );
      const todos = JSON.parse(localStorage.getItem("posthaste-todos") || "[]");

      setStats({
        totalArticles: articles.length,
        publicArticles: articles.filter((a: any) => a.isPublic).length,
        privateArticles: articles.filter((a: any) => !a.isPublic).length,
        totalFiles: files.length,
        totalTodos: todos.length,
        completedTodos: todos.filter((t: any) => t.completed).length,
      });
    }
  }, [isOpen]);

  const toggleDevMode = () => {
    const newMode = !isDevMode;
    setIsDevMode(newMode);
    localStorage.setItem("posthaste-dev-mode", newMode.toString());
  };

  const clearAllData = () => {
    if (window.confirm("Очистить ВСЕ данные? Это действие нельзя отменить!")) {
      localStorage.removeItem("posthaste-articles");
      localStorage.removeItem("posthaste-uploaded-files");
      localStorage.removeItem("posthaste-todos");
      localStorage.removeItem("posthaste-has-visited");
      alert("Все данные очищены!");
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      articles: JSON.parse(localStorage.getItem("posthaste-articles") || "[]"),
      files: JSON.parse(
        localStorage.getItem("posthaste-uploaded-files") || "[]",
      ),
      todos: JSON.parse(localStorage.getItem("posthaste-todos") || "[]"),
      settings: {
        theme: localStorage.getItem("posthaste-theme"),
        hasVisited: localStorage.getItem("posthaste-has-visited"),
        devMode: localStorage.getItem("posthaste-dev-mode"),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `posthaste-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            Панель администратора
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        {/* Статистика/Statistics */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-cta rounded-lg p-4 text-white">
            <h3 className="font-semibold mb-2">Статьи</h3>
            <div className="space-y-1 text-sm">
              <div>Всего: {stats.totalArticles}</div>
              <div>Публичные: {stats.publicArticles}</div>
              <div>Приватные: {stats.privateArticles}</div>
            </div>
          </div>

          <div className="bg-gradient-subtle rounded-lg p-4 text-primary">
            <h3 className="font-semibold mb-2">Файлы</h3>
            <div className="text-sm">
              <div>Загружено: {stats.totalFiles}</div>
            </div>
          </div>

          <div className="bg-success rounded-lg p-4 text-white">
            <h3 className="font-semibold mb-2">Задачи</h3>
            <div className="space-y-1 text-sm">
              <div>Всего: {stats.totalTodos}</div>
              <div>Выполнено: {stats.completedTodos}</div>
              <div>Осталось: {stats.totalTodos - stats.completedTodos}</div>
            </div>
          </div>

          <div className="bg-primary rounded-lg p-4 text-white">
            <h3 className="font-semibold mb-2">Система</h3>
            <div className="space-y-1 text-sm">
              <div>Режим разработчика: {isDevMode ? "Вкл" : "Выкл"}</div>
              <div>Версия: 1.0.0-beta</div>
            </div>
          </div>
        </div>

        {/* Настройки разработчика/Developer settings */}
        <Card className="mb-6">
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
            Настройки разработчика
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Режим разработчика</span>
              <Button
                variant={isDevMode ? "success" : "outline"}
                size="sm"
                onClick={toggleDevMode}
              >
                {isDevMode ? "Включён" : "Выключен"}
              </Button>
            </div>

            {isDevMode && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-3">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Режим разработчика активен. Дополнительная отладочная
                  информация доступна в консоли браузера.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Управление данными/Data management */}
        <Card>
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">
            Управление данными
          </h3>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={exportData} variant="success" size="sm">
              Экспорт данных
            </Button>
            <Button onClick={clearAllData} variant="danger" size="sm">
              Очистить всё
            </Button>
          </div>
        </Card>
      </Card>
    </div>
  );
};
