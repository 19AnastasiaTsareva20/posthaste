import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./Button";

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      path: "/",
      label: "Заметки",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      path: "/archive",
      label: "Архив",
      icon: (
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
            d="M5 8l4 4m0 0l4-4m-4 4V3m0 14l-4-4m4 4l4-4"
          />
        </svg>
      ),
    },
    {
      path: "/settings",
      label: "Настройки",
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Не показывать навигацию на страницах создания/редактирования/просмотра заметок
  const hideNavigationPaths = ["/create", "/view/", "/edit/"];
  const shouldHideNavigation = hideNavigationPaths.some((path) =>
    location.pathname.includes(path),
  );

  if (shouldHideNavigation) {
    return null;
  }

  return (
    <>
      {/* Десктопная навигация / Desktop navigation */}
      <nav className="hidden md:block fixed top-6 left-6 z-40">
        <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border border-border dark:border-dark-border rounded-2xl p-2 shadow-lg">
          <div className="flex flex-col gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isCurrentPath(item.path)
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-neutral-50 dark:hover:bg-dark-background"
                }`}
                title={item.label}
              >
                <span
                  className={`transition-colors ${
                    isCurrentPath(item.path)
                      ? "text-white"
                      : "text-primary dark:text-night-primary"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Мобильная навигация / Mobile navigation */}
      <div className="md:hidden">
        {/* Кнопка меню / Menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 left-4 z-50 p-3 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border border-border dark:border-dark-border rounded-xl shadow-lg"
        >
          {isMenuOpen ? (
            <svg
              className="h-6 w-6 text-text-primary dark:text-dark-text-primary"
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
          ) : (
            <svg
              className="h-6 w-6 text-text-primary dark:text-dark-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        {/* Мобильное меню / Mobile menu */}
        {isMenuOpen && (
          <>
            {/* Оверлей / Overlay */}
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Меню / Menu */}
            <div className="fixed top-4 left-4 right-4 z-50 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl shadow-xl animate-scale-in">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="h-6 w-6 text-primary dark:text-night-primary"
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
                  </h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isCurrentPath(item.path)
                          ? "bg-primary text-white shadow-md"
                          : "text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-neutral-50 dark:hover:bg-dark-background"
                      }`}
                    >
                      <span
                        className={`transition-colors ${
                          isCurrentPath(item.path)
                            ? "text-white"
                            : "text-primary dark:text-night-primary"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Быстрые действия / Quick actions */}
                <div className="mt-6 pt-4 border-t border-border dark:border-dark-border">
                  <Button
                    variant="primary"
                    onClick={() => {
                      navigate("/create");
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2"
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
                    Создать заметку
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Кнопка создания заметки (десктоп) / Create note button (desktop) */}
      <div className="hidden md:block fixed bottom-6 right-6 z-40">
        <Button
          variant="primary"
          onClick={() => navigate("/create")}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all p-0 flex items-center justify-center"
          title="Создать заметку"
        >
          <svg
            className="h-6 w-6"
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
    </>
  );
};
