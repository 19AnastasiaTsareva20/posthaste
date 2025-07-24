import React from "react";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = "",
  onChange,
  placeholder = "Начните писать...",
  className = "",
}) => {
  return (
    <div
      className={`border rounded-lg p-4 min-h-[200px] ${className}`}
      data-testid="rich-text-editor"
    >
      <textarea
        value={content}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full h-full border-none outline-none resize-none"
        aria-label="Редактор текста"
      />
    </div>
  );
};
