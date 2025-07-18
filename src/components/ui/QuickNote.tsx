import React, { useState } from 'react';
import { Button, Card } from './';

interface QuickNoteProps {
  onSave: (content: string) => void;
}

export const QuickNote: React.FC<QuickNoteProps> = ({ onSave }) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle quick save/Обработка быстрого сохранения
  const handleQuickSave = () => {
    if (content.trim()) {
      onSave(content.trim());
      setContent('');
      setIsExpanded(false);
    }
  };

  // Handle key press/Обработка нажатия клавиш
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleQuickSave();
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">
            ⚡ Быстрая заметка
          </h3>
          <span className="text-xs text-text-muted">
            Ctrl+Enter для сохранения
          </span>
        </div>

        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-left p-3 bg-surface hover:bg-primary/10 rounded border border-default transition-colors"
          >
            <span className="text-text-muted">
              Быстро записать мысль...
            </span>
          </button>
        ) : (
          <div className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Запишите быструю заметку без названия..."
              className="w-full h-24 p-3 border border-default rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              autoFocus
            />
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">
                {content.length} символов
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent('');
                  }}
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  onClick={handleQuickSave}
                  disabled={!content.trim()}
                >
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
