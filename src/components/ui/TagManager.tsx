import React, { useState } from "react";
import { Card, Button } from "./"; // Теперь это должно работать

interface Tag {
  name: string;
  count: number;
  color?: string;
}

interface TagManagerProps {
  onTagSelect: (tagName: string | undefined) => void;
  selectedTag?: string;
  className?: string;
  allTags?: Tag[];
}

export const TagManager: React.FC<TagManagerProps> = ({
  onTagSelect,
  selectedTag,
  className = "",
  allTags = [],
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Получить цвет тега
  const getTagColor = (tagName: string): string => {
    const savedColors = JSON.parse(
      localStorage.getItem("notesflow-tag-colors") || "{}"
    );
    const colors = [
      "#2D9EE0",
      "#3854F2",
      "#576EF2",
      "#2193B0",
      "#6DD5ED",
      "#15B9A7",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
    ];
    return savedColors[tagName] || colors[tagName.length % colors.length];
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      // Здесь должна быть логика создания тега
      console.log("Создать тег:", newTagName);
      setNewTagName("");
      setIsCreating(false);
    }
  };

  const filteredTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className={`tag-manager ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">
            Теги
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
          >
            +
          </Button>
        </div>

        {/* Поиск тегов */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск тегов..."
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        {isCreating && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Название тега"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <Button size="sm" onClick={handleCreateTag}>
              Создать
            </Button>
          </div>
        )}

        {/* Список тегов */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTagSelect(undefined)}
            className={`px-2 py-1 text-xs rounded-full ${
              !selectedTag
                ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Все теги
          </button>
          
          {filteredTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => onTagSelect(tag.name)}
              className={`px-2 py-1 text-xs rounded-full flex items-center ${
                selectedTag === tag.name
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              style={{
                borderLeft: `3px solid ${getTagColor(tag.name)}`,
              }}
            >
              #{tag.name}
              {tag.count > 0 && (
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  ({tag.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};
