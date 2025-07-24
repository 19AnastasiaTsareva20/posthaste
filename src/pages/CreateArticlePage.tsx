import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  RichTextEditor,
  showNotification,
} from "../components/ui";

export const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { id: editingId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Загрузка существующей заметки для редактирования
  useEffect(() => {
    if (editingId) {
      setIsLoading(true);
      try {
        const savedNotes = localStorage.getItem("notesflow-notes");
        if (savedNotes) {
          const notes = JSON.parse(savedNotes);
          const noteToEdit = notes.find((note: any) => note.id === editingId);

          if (noteToEdit) {
            setTitle(noteToEdit.title);
            setContent(noteToEdit.content);
            setTags(noteToEdit.tags || []);
          } else {
            showNotification.error("Заметка не найдена");
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Error loading note:", error);
        showNotification.error("Ошибка при загрузке заметки");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Фокус на поле заголовка для новой заметки
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [editingId, navigate]);

  // Отслеживание изменений для предупреждения о несохраненных данных
  useEffect(() => {
    setHasUnsavedChanges(
      title.trim() !== "" || content.trim() !== "" || tags.length > 0,
    );
  }, [title, content, tags]);

  // Предупреждение при попытке покинуть страницу с несохраненными изменениями
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Обработка добавления тегов
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();

      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  // Удаление тега
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Сохранение заметки
  const handleSave = async () => {
    if (!title.trim()) {
      showNotification.warning("Пожалуйста, введите название заметки");
      titleInputRef.current?.focus();
      return;
    }

    try {
      setIsSaving(true);

      const savedNotes = localStorage.getItem("notesflow-notes");
      const existingNotes = savedNotes ? JSON.parse(savedNotes) : [];

      const noteData = {
        id: editingId || `note-${Date.now()}`,
        title: title.trim(),
        content,
        tags,
        isFavorite: false,
        folderId: undefined,
        createdAt: editingId
          ? existingNotes.find((n: any) => n.id === editingId)?.createdAt ||
            new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };

      let updatedNotes;
      if (editingId) {
        updatedNotes = existingNotes.map((note: any) =>
          note.id === editingId ? noteData : note,
        );
        showNotification.success("Заметка обновлена");
      } else {
        updatedNotes = [noteData, ...existingNotes];
        showNotification.success("Заметка создана");
      }

      localStorage.setItem("notesflow-notes", JSON.stringify(updatedNotes));
      setHasUnsavedChanges(false);

      // Небольшая задержка перед переходом для показа уведомления
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      console.error("Error saving note:", error);
      showNotification.error("Ошибка при сохранении заметки");
    } finally {
      setIsSaving(false);
    }
  };

  // Выход без сохранения
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "У вас есть несохраненные изменения. Вы уверены, что хотите выйти?",
        )
      ) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  // Горячие клавиши
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-primary dark:text-dark-text-primary">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span>Загрузка заметки...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background dark:bg-dark-background"
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Шапка с действиями */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleCancel}
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
              <h1 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
                {editingId ? "Редактирование заметки" : "Новая заметка"}
              </h1>
              {hasUnsavedChanges && (
                <span className="text-sm text-warning flex items-center gap-1">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                  Несохраненные изменения
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
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
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Сохранить
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Форма создания/редактирования */}
        <div className="space-y-6">
          {/* Заголовок */}
          <Card className="p-6">
            <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
              Название заметки *
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название заметки..."
              className="input w-full text-lg"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-text-secondary dark:text-dark-text-secondary">
                Обязательное поле
              </span>
              <span className="text-xs text-text-secondary dark:text-dark-text-secondary">
                {title.length}/200
              </span>
            </div>
          </Card>

          {/* Теги */}
          <Card className="p-6">
            <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
              Теги
            </label>

            {/* Существующие теги */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary dark:bg-night-primary/10 dark:text-night-primary rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-primary/70 hover:text-primary dark:text-night-primary/70 dark:hover:text-night-primary"
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

            {/* Ввод новых тегов */}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Добавьте теги (нажмите Enter или запятую)..."
              className="input w-full"
            />
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
              Теги помогают организовать и быстро находить заметки
            </p>
          </Card>

          {/* Редактор контента */}
          <Card className="p-6">
            <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-4">
              Содержание
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Начните писать вашу заметку..."
            />
          </Card>
        </div>

        {/* Подсказки по горячим клавишам */}
        <Card className="p-4 bg-neutral-50 dark:bg-dark-surface">
          <div className="flex items-center gap-4 text-sm text-text-secondary dark:text-dark-text-secondary">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-dark-background rounded border text-xs">
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-white dark:bg-dark-background rounded border text-xs">
                S
              </kbd>
              <span>— сохранить</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-dark-background rounded border text-xs">
                Esc
              </kbd>
              <span>— отмена</span>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
