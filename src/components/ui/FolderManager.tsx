import React, { useState } from "react";
import { Card, Button } from "./"; // Теперь это должно работать

interface Folder {
  id: string;
  name: string;
  color: string;
  noteCount: number;
  createdAt: Date;
}

interface FolderManagerProps {
  onFolderSelect: (folderId: string | undefined) => void;
  selectedFolderId?: string;
  className?: string;
}

export const FolderManager: React.FC<FolderManagerProps> = ({
  onFolderSelect,
  selectedFolderId,
  className = "",
}) => {
  const [folders] = useState<Folder[]>([
    // Пример данных
    { id: "1", name: "Работа", color: "#3b82f6", noteCount: 5, createdAt: new Date() },
    { id: "2", name: "Личное", color: "#10b981", noteCount: 3, createdAt: new Date() },
    { id: "3", name: "Идеи", color: "#8b5cf6", noteCount: 8, createdAt: new Date() },
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // Здесь должна быть логика создания папки
      console.log("Создать папку:", newFolderName);
      setNewFolderName("");
      setIsCreating(false);
    }
  };

  return (
    <Card className={`folder-manager ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">
            Папки
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
          >
            +
          </Button>
        </div>

        {isCreating && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Название папки"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <Button size="sm" onClick={handleCreateFolder}>
              Создать
            </Button>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={() => onFolderSelect(undefined)}
            className={`w-full text-left px-2 py-1 rounded text-sm ${
              !selectedFolderId
                ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Все заметки
          </button>
          
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onFolderSelect(folder.id)}
              className={`w-full text-left px-2 py-1 rounded text-sm flex items-center justify-between ${
                selectedFolderId === folder.id
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="flex items-center">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {folder.noteCount}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};
