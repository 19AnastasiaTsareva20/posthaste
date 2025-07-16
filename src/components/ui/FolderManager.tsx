import React, { useState, useEffect } from 'react';
import { Card, Button } from './';
import { Folder } from '../../types';

interface FolderManagerProps {
  onFolderSelect: (folderId: string | null) => void;
  selectedFolderId: string | null;
}

export const FolderManager: React.FC<FolderManagerProps> = ({ 
  onFolderSelect, 
  selectedFolderId 
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Load folders/Загрузка папок
  useEffect(() => {
    const saved = localStorage.getItem('notesflow-folders');
    if (saved) {
      setFolders(JSON.parse(saved));
    }
  }, []);

  // Save folders/Сохранение папок
  const saveFolders = (newFolders: Folder[]) => {
    setFolders(newFolders);
    localStorage.setItem('notesflow-folders', JSON.stringify(newFolders));
  };

  // Create folder/Создание папки
  const createFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        color: '#597EE6',
        createdAt: new Date()
      };
      saveFolders([...folders, newFolder]);
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  // Delete folder/Удаление папки
  const deleteFolder = (folderId: string) => {
    if (window.confirm('Удалить папку? Заметки останутся без папки.')) {
      const newFolders = folders.filter(f => f.id !== folderId);
      saveFolders(newFolders);
      if (selectedFolderId === folderId) {
        onFolderSelect(null);
      }
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-text-primary">Папки</h3>
        <Button 
          size="sm" 
          onClick={() => setIsCreating(true)}
          className="text-xs"
        >
          Добавить
        </Button>
      </div>

      {/* All notes option/Опция всех заметок */}
      <div 
        onClick={() => onFolderSelect(null)}
        className={`p-2 rounded cursor-pointer mb-2 transition-colors ${
          selectedFolderId === null 
            ? 'bg-primary text-white' 
            : 'hover:bg-surface'
        }`}
      >
        Все заметки
      </div>

      {/* Folder list/Список папок */}
      {folders.map(folder => (
        <div 
          key={folder.id}
          className={`flex justify-between items-center p-2 rounded cursor-pointer mb-1 transition-colors ${
            selectedFolderId === folder.id 
              ? 'bg-primary text-white' 
              : 'hover:bg-surface'
          }`}
        >
          <div onClick={() => onFolderSelect(folder.id)}>
            {folder.name}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFolder(folder.id);
            }}
            className="text-xs opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Create new folder/Создание новой папки */}
      {isCreating && (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Название папки"
            className="input w-full text-sm"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && createFolder()}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={createFolder}>
              Создать
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setIsCreating(false);
                setNewFolderName('');
              }}
            >
              Отмена
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
