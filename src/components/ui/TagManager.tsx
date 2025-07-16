import React, { useState, useEffect } from 'react';
import { Card } from './';
import { Tag } from '../../types';

interface TagManagerProps {
  onTagSelect: (tag: string | null) => void;
  selectedTag: string | null;
}

export const TagManager: React.FC<TagManagerProps> = ({ 
  onTagSelect, 
  selectedTag 
}) => {
  const [tags, setTags] = useState<Tag[]>([]);

  // Load and calculate tags/Загрузка и подсчет тегов
  useEffect(() => {
    const notes = JSON.parse(localStorage.getItem('notesflow-notes') || '[]');
    const tagCounts: { [key: string]: number } = {};
    
    // Count tag usage/Подсчет использования тегов
    notes.forEach((note: any) => {
      note.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Create tag objects/Создание объектов тегов
    const tagList: Tag[] = Object.entries(tagCounts).map(([name, count]) => ({
      id: name,
      name,
      color: '#75E0FC',
      count
    }));

    setTags(tagList.sort((a, b) => b.count - a.count));
  }, []);

  return (
    <Card>
      <h3 className="font-semibold text-text-primary mb-4">Теги</h3>

      {/* All tags option/Опция всех тегов */}
      <div 
        onClick={() => onTagSelect(null)}
        className={`p-2 rounded cursor-pointer mb-2 transition-colors ${
          selectedTag === null 
            ? 'bg-accent text-white' 
            : 'hover:bg-surface'
        }`}
      >
        Все теги
      </div>

      {/* Tag list/Список тегов */}
      {tags.length === 0 ? (
        <p className="text-text-muted text-sm">Нет тегов</p>
      ) : (
        tags.map(tag => (
          <div 
            key={tag.id}
            onClick={() => onTagSelect(tag.name)}
            className={`flex justify-between items-center p-2 rounded cursor-pointer mb-1 transition-colors ${
              selectedTag === tag.name 
                ? 'bg-accent text-white' 
                : 'hover:bg-surface'
            }`}
          >
            <span>#{tag.name}</span>
            <span className="text-xs opacity-70">({tag.count})</span>
          </div>
        ))
      )}
    </Card>
  );
};
