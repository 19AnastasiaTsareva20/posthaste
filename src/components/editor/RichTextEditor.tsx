import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Card } from "./";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  className?: string;
  onSave?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Начните писать...",
  autoFocus = false,
  readOnly = false,
  className = "",
  onSave,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  // Настройка редактора / Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Highlight.configure({
        HTMLAttributes: {
          class: "highlight",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "editor-link",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
    ],
    content,
    editable: !readOnly,
    autofocus: autoFocus,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Подсчет слов и времени чтения / Word count and reading time
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setReadingTime(Math.ceil(words / 200)); // 200 слов в минуту
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  // Горячие клавиши / Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editor || !isFocused) return;

      // Ctrl+S или Cmd+S для сохранения / Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, isFocused, onSave]);

  // Обновление контента / Update content
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <Card className={`${className} animate-pulse`}>
        <div className="h-64 bg-neutral-100 dark:bg-dark-surface rounded-lg" />
      </Card>
    );
  }

  return (
    <Card
      className={`transition-all duration-300 ${className} ${
        isFocused ? "ring-2 ring-primary/30 shadow-primary" : ""
      }`}
      hover={false}
    >
      <div className="space-y-4">
        {/* Редактор / Editor */}
        <div
          ref={editorRef}
          className="prose prose-lg dark:prose-invert max-w-none focus-within:outline-none"
        >
          <EditorContent
            editor={editor}
            className="min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:text-text-primary [&_.ProseMirror]:dark:text-dark-text-primary [&_.ProseMirror]:leading-relaxed"
          />
        </div>

        {/* Статистика и индикаторы / Statistics and indicators */}
        {!readOnly && (
          <div className="flex items-center justify-between text-sm text-text-muted dark:text-dark-text-muted border-t border-border dark:border-dark-border pt-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
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
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
                {wordCount} слов
              </span>

              {readingTime > 0 && (
                <span className="flex items-center gap-1">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  ~{readingTime} мин чтения
                </span>
              )}

              {isFocused && (
                <span className="flex items-center gap-1 text-primary dark:text-night-primary">
                  <div className="w-2 h-2 bg-primary dark:bg-night-primary rounded-full animate-pulse" />
                  Редактирование
                </span>
              )}
            </div>

            {/* Горячие клавиши / Keyboard shortcuts */}
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <kbd className="px-2 py-1 bg-neutral-100 dark:bg-dark-border rounded">
                ⌘S
              </kbd>
              <span>сохранить</span>
            </div>
          </div>
        )}
      </div>

      {/* Режим чтения / Reading mode */}
      {readOnly && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-info/10 text-info rounded-full text-xs">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Режим чтения
          </div>
        </div>
      )}
    </Card>
  );
};
